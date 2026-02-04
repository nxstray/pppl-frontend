import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LeadScoringService, LeadAnalysisDTO, LeadStatistics } from '../../../service/admin/lead-scoring.service';
import { ToastService } from '../../../service/animations/toast.service';
import { LoadingOverlayComponent } from '../../../../shared/animate/loading-overlay/loading-overlay.component';
import { CanComponentDeactivate } from '../../../guard/analysis.guard';

@Component({
  selector: 'app-lead-scoring',
  standalone: true,
  imports: [CommonModule, LoadingOverlayComponent],
  templateUrl: './lead-scoring.component.html',
  styleUrls: ['./lead-scoring.component.scss']
})
export class LeadScoringComponent implements OnInit, CanComponentDeactivate {
  loading = false;
  analyzing = false;
  leads: LeadAnalysisDTO[] = [];
  filteredLeads: LeadAnalysisDTO[] = [];
  statistics: LeadStatistics = {
    totalLeads: 0,
    analyzedLeads: 0,
    hotLeads: 0,
    warmLeads: 0,
    coldLeads: 0
  };

  selectedFilter: string = 'ALL';
  selectedLead: LeadAnalysisDTO | null = null;
  showDetailModal = false;
  analyzingLeads = new Set<number>();

  // Loading Overlay State
  showLoadingOverlay = false;
  loadingTitle = '';
  loadingMessage = '';
  showProgress = false;
  progress = 0;

  constructor(
    private leadScoringService: LeadScoringService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadStatistics();
    this.loadLeadResults();
  }

  // Prevent navigation when analyzing
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.analyzing) {
      $event.returnValue = 'Proses analisa sedang berjalan. Yakin ingin meninggalkan halaman?';
    }
  }

  loadStatistics() {
    this.leadScoringService.getLeadStatistics().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.statistics = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.toastService.error('Gagal Memuat Data', 'Tidak dapat memuat statistik leads');
      }
    });
  }

  loadLeadResults() {
    this.loading = true;
    this.leadScoringService.getAllLeads().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.leads = response.data;
          this.applyFilter(this.selectedFilter);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading leads:', error);
        this.toastService.error('Gagal Memuat Data', 'Tidak dapat memuat data leads dari server');
        this.loading = false;
      }
    });
  }

  /**
   * Analyze single lead with full screen blocking spinner
   */
  async analyzeLead(idRequest: number) {
    const lead = this.leads.find(l => l.idRequest === idRequest);
    const leadInfo = lead ? `${lead.namaKlien} (${lead.layanan})` : `#${idRequest}`;
    
    const confirmed = await this.toastService.helpConfirm(
      'Analisa lead ini dengan AI?',
      `${leadInfo}\n`
    );

    if (confirmed) {
      // Show full screen loading
      this.showLoadingOverlay = true;
      this.loadingTitle = 'Sedang Menganalisa';
      this.loadingMessage = `Menganalisa lead : <strong>${leadInfo}</strong><br>`;
      this.showProgress = true;
      this.progress = 0;

      this.analyzingLeads.add(idRequest);
      this.analyzing = true;

      // Simulate progress (Cause backend do not have progress tracking)
      const progressInterval = this.simulateProgress();
      
      this.leadScoringService.analyzeLeadById(idRequest).subscribe({
        next: (response) => {
          clearInterval(progressInterval);
          this.progress = 100;

          setTimeout(() => {
            if (response.success && response.data) {
              const data = response.data;
              
              this.toastService.success(
                'Lead Berhasil Dianalisa!',
                `<strong>${data.skorPrioritas}</strong> - ${data.kategori}<br>` +
                `<small>Confidence: ${data.confidence}%</small>`
              );
              
              this.loadLeadResults();
              this.loadStatistics();
            }

            // Hide overlay
            this.showLoadingOverlay = false;
            this.analyzingLeads.delete(idRequest);
            this.analyzing = false;
          }, 500);
        },
        error: (error) => {
          clearInterval(progressInterval);
          this.showLoadingOverlay = false;
          this.analyzingLeads.delete(idRequest);
          this.analyzing = false;
          this.handleAnalysisError(error);
        }
      });
    }
  }

  /**
   * Analyze all leads with full screen blocking spinner
   */
  async analyzeAll() {
    const unanalyzed = this.leads.filter(l => !l.aiAnalyzed);
    
    if (unanalyzed.length === 0) {
      this.toastService.success(
        'Semua lead sudah dianalisa',
        'Tidak ada lead yang perlu dianalisa.'
      );
      return;
    }

    const estimatedTime = Math.ceil(unanalyzed.length / 15) * 2;
    
    const confirmed = await this.toastService.helpConfirm(
      'Analisa semua lead?',
      `Sistem akan menganalisa ${unanalyzed.length} lead yang belum dianalisa.\n\n` +
      `Butuh sekitar ${estimatedTime} menit\n\n` +
      `untuk menyelesaikan proses ini.`
    );

    if (confirmed) {
      // Show full screen loading
      this.showLoadingOverlay = true;
      this.loadingTitle = 'Batch Analysis Running';
      this.loadingMessage = `Menganalisa <strong>${unanalyzed.length} leads</strong><br>` +
                            `<small>Estimasi: ~${estimatedTime} menit</small><br>` +
                            `<small>Rate limit: 15 requests per 1 menit</small>`;
      this.showProgress = true;
      this.progress = 0;
      this.analyzing = true;

      // Simulate progress for batch
      const progressInterval = this.simulateBatchProgress(estimatedTime * 60);
      
      this.leadScoringService.analyzeAllPendingLeads().subscribe({
        next: (response) => {
          clearInterval(progressInterval);
          this.progress = 100;

          setTimeout(() => {
            if (response.success) {
              this.toastService.success(
                'Batch Analysis Selesai!',
                response.message || `Berhasil menganalisa ${unanalyzed.length} leads`
              );
              this.loadLeadResults();
              this.loadStatistics();
            }

            this.showLoadingOverlay = false;
            this.analyzing = false;
          }, 500);
        },
        error: (error) => {
          clearInterval(progressInterval);
          this.showLoadingOverlay = false;
          this.analyzing = false;
          this.handleAnalysisError(error);
        }
      });
    }
  }

  /**
   * Simulate progress for single analyze (10-15 detik)
   */
  private simulateProgress(): any {
    const duration = 12000; // 12 seconds
    const interval = 100;
    const steps = duration / interval;
    let currentStep = 0;

    return setInterval(() => {
      currentStep++;
      this.progress = Math.min(95, (currentStep / steps) * 100);
    }, interval);
  }

  /**
   * Simulate progress for batch analysis
   */
  private simulateBatchProgress(durationSeconds: number): any {
    const duration = durationSeconds * 1000;
    const interval = 200;
    const steps = duration / interval;
    let currentStep = 0;

    return setInterval(() => {
      currentStep++;
      this.progress = Math.min(95, (currentStep / steps) * 100);
    }, interval);
  }

  /**
   * Apply filter for leads
   */
  applyFilter(filter: string) {
    this.selectedFilter = filter;
    
    switch (filter) {
      case 'ALL':
        this.filteredLeads = this.leads;
        break;
      case 'UNANALYZED':
        this.filteredLeads = this.leads.filter(l => !l.aiAnalyzed);
        break;
      case 'HOT':
      case 'WARM':
      case 'COLD':
        this.filteredLeads = this.leads.filter(l => l.skorPrioritas === filter);
        break;
      default:
        this.filteredLeads = this.leads;
    }
  }

  getPriorityClass(priority: string | null): string {
    if (!priority) return 'priority-none';
    return `priority-${priority.toLowerCase()}`;
  }

  showDetail(lead: LeadAnalysisDTO) {
    if (this.analyzing) {
      this.toastService.warning(
        'Proses Analisa Berjalan',
        'Tunggu hingga analisa selesai sebelum membuka detail'
      );
      return;
    }
    this.selectedLead = lead;
    this.showDetailModal = true;
  }

  closeModal() {
    this.showDetailModal = false;
    this.selectedLead = null;
  }

  formatDate(date: Date | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isAnalyzing(idRequest: number): boolean {
    return this.analyzingLeads.has(idRequest);
  }

  private handleAnalysisError(error: any) {
    console.error('Analysis error:', error);
    
    const errorMessage = error.error?.message || error.message || 'Terjadi kesalahan saat menganalisa';
    
    if (errorMessage.includes('Rate limit')) {
      const retryAfter = this.extractRetryAfter(errorMessage);
      this.toastService.warning(
        'Rate Limit Exceeded! ⏱️',
        `${errorMessage}<br><br>Silakan tunggu <strong>${retryAfter} detik</strong> dan coba lagi.`
      );
    } else if (errorMessage.includes('tidak ditemukan')) {
      this.toastService.error(
        'Lead Tidak Ditemukan',
        errorMessage
      );
    } else if (errorMessage.includes('Gemini API')) {
      this.toastService.error(
        'AI Service Error',
        `${errorMessage}<br><br>Silakan coba lagi nanti.`
      );
    } else {
      this.toastService.error(
        'Gagal Menganalisa Lead',
        errorMessage
      );
    }
  }

  private extractRetryAfter(message: string): string {
    const match = message.match(/(\d+)\s*detik/);
    return match ? match[1] : 'beberapa';
  }

  refreshData() {
    if (this.analyzing) {
      this.toastService.warning(
        'Proses Analisa Berjalan',
        'Tidak dapat refresh saat analisa sedang berjalan'
      );
      return;
    }
    this.loadStatistics();
    this.loadLeadResults();
  }

  // Implement CanDeactivate - Prevent navigation when analyzing
  canDeactivate(): boolean {
    if (this.analyzing) {
      return confirm(
        'Proses analisa AI sedang berjalan!\n\n' +
        'Meninggalkan halaman akan menghentikan proses analisa.\n' +
        'Yakin ingin meninggalkan halaman ini?'
      );
    }
    return true;
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeadScoringService, LeadAnalysisDTO, LeadStatistics } from '../../service/lead-scoring.service';

@Component({
  selector: 'app-lead-scoring',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lead-scoring.component.html',
  styleUrls: ['./lead-scoring.component.scss']
})
export class LeadScoringComponent implements OnInit {
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

  constructor(private leadScoringService: LeadScoringService) {}

  ngOnInit() {
    this.loadStatistics();
    this.loadLeadResults();
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
        this.showError('Gagal memuat statistik');
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
        this.showError('Gagal memuat data leads');
        this.loading = false;
      }
    });
  }

  analyzeLead(idRequest: number) {
    if (confirm('Analisa lead ini dengan AI? (Menggunakan 1 request quota)')) {
      this.analyzing = true;
      this.leadScoringService.analyzeLeadById(idRequest).subscribe({
        next: (response) => {
          if (response.success) {
            const data = response.data;
            alert('Lead berhasil dianalisa!\n\n' + 
                  'Skor: ' + data.skorPrioritas + '\n' +
                  'Kategori: ' + data.kategori + '\n' +
                  'Alasan: ' + data.alasan);
            
            // Reload data
            this.loadLeadResults();
            this.loadStatistics();
          }
          this.analyzing = false;
        },
        error: (error) => {
          this.analyzing = false;
          this.handleAnalysisError(error);
        }
      });
    }
  }

  analyzeAll() {
    const unanalyzed = this.leads.filter(l => !l.aiAnalyzed).length;
    
    if (unanalyzed === 0) {
      alert('Semua lead sudah dianalisa!');
      return;
    }

    if (confirm(`Analisa ${unanalyzed} lead yang belum dianalisa?\n\n Note: Rate limit 15 requests per 2 menit.`)) {
      this.analyzing = true;
      this.leadScoringService.analyzeAllPendingLeads().subscribe({
        next: (response) => {
          if (response.success) {
            alert('Success ' + response.message);
            this.loadLeadResults();
            this.loadStatistics();
          }
          this.analyzing = false;
        },
        error: (error) => {
          this.analyzing = false;
          this.handleAnalysisError(error);
        }
      });
    }
  }

  applyFilter(filter: string) {
    this.selectedFilter = filter;
    
    if (filter === 'ALL') {
      this.filteredLeads = this.leads;
    } else if (filter === 'UNANALYZED') {
      this.filteredLeads = this.leads.filter(l => !l.aiAnalyzed);
    } else {
      this.filteredLeads = this.leads.filter(l => l.skorPrioritas === filter);
    }
  }

  getPriorityClass(priority: string | null): string {
    if (!priority) return 'priority-none';
    return `priority-${priority.toLowerCase()}`;
  }

  getPriorityIcon(priority: string | null): string {
    switch (priority) {
      case 'HOT': return 'hot';
      case 'WARM': return 'warm';
      case 'COLD': return 'cold';
      default: return 'riddle';
    }
  }

  showDetail(lead: LeadAnalysisDTO) {
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
      year: 'numeric'
    });
  }

  // Error handling helpers
  private handleAnalysisError(error: any) {
    const errorMessage = error.error?.message || 'Terjadi kesalahan saat menganalisa';
    
    // Handle rate limit error khusus
    if (errorMessage.includes('Rate limit')) {
      alert('⏱Rate Limit Exceeded!\n\n' + errorMessage);
    } else {
      alert('Gagal menganalisa lead:\n\n' + errorMessage);
    }
  }

  private showError(message: string) {
    alert('Error!' + message);
  }
}
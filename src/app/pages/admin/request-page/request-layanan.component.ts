import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../service/animations/toast.service';
import { RequestLayananService, RequestLayananDTO, RequestDetailDTO, RequestStatistics } from '../../../service/admin/request-layanan.service';

interface FilterOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-request-layanan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './request-layanan.component.html',
  styleUrls: ['./request-layanan.component.scss']
})
export class RequestLayananComponent implements OnInit {
  // Data
  requests: RequestLayananDTO[] = [];
  filteredRequests: RequestLayananDTO[] = [];
  statistics: RequestStatistics = {
    total: 0,
    menungguVerifikasi: 0,
    diverifikasi: 0,
    ditolak: 0
  };
  
  // UI State
  loading = false;
  processing = false;
  showDetailModal = false;
  showRejectModal = false;
  
  // Selected items
  selectedRequest: RequestDetailDTO | null = null;
  requestToReject: RequestLayananDTO | null = null;
  rejectionReason = '';
  
  // Filters
  searchKeyword = '';
  selectedStatus: string = '';

  // Filter options
  filterOptions: FilterOption[] = [
    { value: '', label: 'Semua' },
    { value: 'MENUNGGU_VERIFIKASI', label: 'Menunggu Verifikasi' },
    { value: 'VERIFIKASI', label: 'Diverifikasi' },
    { value: 'DITOLAK', label: 'Ditolak' }
  ];

  constructor(
    private requestLayananService: RequestLayananService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadRequests();
    this.loadStatistics();
  }

  // Data loading

  loadRequests() {
    this.loading = true;
    this.requestLayananService.getAllRequests().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.requests = response.data;
          console.log('Loaded requests:', this.requests);
          this.applyFilters();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading requests:', error);
        this.showError('Gagal memuat data request');
        this.loading = false;
      }
    });
  }

  loadStatistics() {
    this.requestLayananService.getStatistics().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.statistics = response.data;
          console.log('Loaded statistics:', this.statistics);
        }
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  // Filtering
  selectFilter(value: string) {
    this.selectedStatus = value;
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.requests];

    // Search by keyword
    if (this.searchKeyword.trim()) {
      const keyword = this.searchKeyword.toLowerCase();
      result = result.filter(r => 
        r.namaKlien?.toLowerCase().includes(keyword) ||
        r.namaLayanan?.toLowerCase().includes(keyword)
      );
    }

    // Filter by status - Handle enum properly
    if (this.selectedStatus) {
      result = result.filter(r => {
        // Handle both string and enum object
        const requestStatus = typeof r.status === 'string' ? r.status : String(r.status);
        return requestStatus === this.selectedStatus;
      });
    }

    this.filteredRequests = result;
    console.log('Filtered requests:', this.filteredRequests.length);
  }

  onSearchChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchKeyword = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  // Modal actions
  openDetailModal(request: RequestLayananDTO) {
    if (!request.idRequest) return;
    
    this.loading = true;
    this.requestLayananService.getRequestById(request.idRequest).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.selectedRequest = response.data;
          this.showDetailModal = true;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading detail:', error);
        this.showError('Gagal memuat detail request');
        this.loading = false;
      }
    });
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedRequest = null;
  }

  openRejectModal(request: RequestLayananDTO | RequestDetailDTO) {
    this.requestToReject = request as RequestLayananDTO;
    this.rejectionReason = '';
    this.showRejectModal = true;
  }

  closeRejectModal() {
    this.showRejectModal = false;
    this.requestToReject = null;
    this.rejectionReason = '';
  }

  // Approval workflow
  async approveRequest(request: RequestLayananDTO | RequestDetailDTO) {
    if (!request.idRequest) return;

    const confirmed = await this.toastService.helpConfirm(
      'Verifikasi request?',
      `
        Klien: <strong>${request.namaKlien}</strong><br>
        Layanan: ${request.namaLayanan}<br><br>
        <strong>${request.namaKlien}</strong> akan dipindahkan ke halaman klien.
      `
    );

    if (!confirmed) return;

    this.processing = true;

    this.requestLayananService.approveRequest(request.idRequest).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success(
            'Request Diverifikasi',
            'Request berhasil diverifikasi.'
          );

          this.loadRequests();
          this.loadStatistics();

          if (this.showDetailModal) {
            this.closeDetailModal();
          }
        } else {
          this.toastService.error(
            'Verifikasi Gagal',
            response.message || 'Terjadi kesalahan'
          );
        }

        this.processing = false;
      },
      error: (error) => {
        this.processing = false;
        this.toastService.error(
          'Gagal Verifikasi',
          error.error?.message || 'Terjadi kesalahan server'
        );
      }
    });
  }

  submitRejection() {
    if (!this.requestToReject?.idRequest) return;

    if (!this.rejectionReason.trim()) {
      this.toastService.warning(
        'Alasan Wajib Diisi',
        'Silakan isi alasan penolakan terlebih dahulu.'
      );
      return;
    }

    this.processing = true;

    this.requestLayananService.rejectRequest(
      this.requestToReject.idRequest,
      this.rejectionReason
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success(
            'Request Ditolak',
            'Alasan penolakan telah dikirim ke klien.'
          );

          this.closeRejectModal();
          this.loadRequests();
          this.loadStatistics();
          if (this.showDetailModal) {
            this.closeDetailModal();
          }
        } else {
          this.toastService.error(
            'Gagal Menolak Request',
            response.message || 'Terjadi kesalahan'
          );
        }
        this.processing = false;
      },
      error: (error) => {
        this.processing = false;
        this.toastService.error(
          'Gagal Menolak Request',
          error.error?.message || 'Terjadi kesalahan server'
        );
      }
    });
  }

  // Helper methods - Handle enum properly
  getStatusClass(status: any): string {
    const statusStr = typeof status === 'string' ? status : status?.toString();
    switch (statusStr) {
      case 'MENUNGGU_VERIFIKASI': return 'status-pending';
      case 'VERIFIKASI': return 'status-approved';
      case 'DITOLAK': return 'status-rejected';
      default: return '';
    }
  }

  getStatusLabel(status: any): string {
    const statusStr = typeof status === 'string' ? status : status?.toString();
    switch (statusStr) {
      case 'MENUNGGU_VERIFIKASI': return 'Menunggu Verifikasi';
      case 'VERIFIKASI': return 'Diverifikasi';
      case 'DITOLAK': return 'Ditolak';
      default: return statusStr || 'Unknown';
    }
  }

  getPriorityClass(priority: string | null | undefined): string {
    if (!priority) return 'priority-none';
    return `priority-${priority.toLowerCase()}`;
  }

  formatDate(date: Date | string | undefined | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateShort(date: Date | string | undefined | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  canApprove(request: RequestLayananDTO | RequestDetailDTO): boolean {
    const statusStr = typeof request.status === 'string' ? request.status : String(request.status);
    return statusStr === 'MENUNGGU_VERIFIKASI';
  }

  canReject(request: RequestLayananDTO | RequestDetailDTO): boolean {
    const statusStr = typeof request.status === 'string' ? request.status : String(request.status);
    return statusStr === 'MENUNGGU_VERIFIKASI';
  }

  // Error handling
  private showError(message: string) {
    this.toastService.error('Error', message);
  }

  private handleError(error: any, defaultMessage: string) {
    const errorMessage = error.error?.message || error.message || defaultMessage;
    this.toastService.error('Terjadi Kesalahan', errorMessage);
  }

  // Refresh
  refreshData() {
    this.loadStatistics();
    this.loadRequests();
  }
}
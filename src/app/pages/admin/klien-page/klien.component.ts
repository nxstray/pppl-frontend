import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KlienService, KlienDTO } from '../../../service/admin/klien.service';
import { AuthService } from '../../../service/auth/auth.service';
import { ToastService } from '../../../service/animations/toast.service';

enum StatusKlien {
  BELUM = 'BELUM',
  AKTIF = 'AKTIF'
}

interface KlienStatistics {
  total: number;
  belum: number;
  aktif: number;
}

@Component({
  selector: 'app-klien',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './klien.component.html',
  styleUrls: ['./klien.component.scss']
})
export class KlienComponent implements OnInit {
  // Data
  klien: KlienDTO[] = [];
  filteredKlien: KlienDTO[] = [];
  statistics: KlienStatistics = {
    total: 0,
    belum: 0,
    aktif: 0
  };

  // UI State
  loading = false;
  processing = false;
  showModal = false;
  isEditMode = false;

  canEdit = false;
  canDelete = false;

  // Dropdown states
  dropdownStates: { [key: string]: boolean } = {
  status: false
  };

  // Filters
  searchKeyword = '';
  selectedStatus: string | null = null;

  // Form Data
  formData: KlienDTO = {
    namaKlien: '',
    emailKlien: '',
    noTelp: '',
    status: StatusKlien.BELUM
  };

  constructor(
    private klienService: KlienService,
    private toast: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadKlien();
    this.checkPermissions();

    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.canEdit = user.role === 'SUPER_ADMIN';
        this.canDelete = user.role === 'SUPER_ADMIN';
        console.log('Permissions updated - canEdit:', this.canEdit);
      }
    });
  }

  // Data loading
  loadKlien() {
    this.loading = true;
    this.klienService.getAllKlien().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.klien = response.data;
          this.updateStatistics();
          this.applyFilters();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading klien:', error);
        this.showError('Gagal memuat data klien');
        this.loading = false;
      }
    });
  }

  checkPermissions() {
    const role = this.authService.currentUserValue?.role;
    this.canEdit = role === 'SUPER_ADMIN';
    this.canDelete = role === 'SUPER_ADMIN';
  }

  updateStatistics() {
    this.statistics.total = this.klien.length;
    this.statistics.belum = this.klien.filter(k => k.status === StatusKlien.BELUM).length;
    this.statistics.aktif = this.klien.filter(k => k.status === StatusKlien.AKTIF).length;
  }

  // Filtering
  selectStatus(status: string | null) {
    this.selectedStatus = status;
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.klien];

    // Filter by keyword
    if (this.searchKeyword.trim()) {
      const keyword = this.searchKeyword.toLowerCase();
      result = result.filter(k =>
        k.namaKlien.toLowerCase().includes(keyword) ||
        k.emailKlien.toLowerCase().includes(keyword) ||
        k.noTelp.toLowerCase().includes(keyword)
      );
    }

    // Filter by status
    if (this.selectedStatus) {
      result = result.filter(k => k.status === this.selectedStatus);
    }

    this.filteredKlien = result;
  }

  onSearchChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchKeyword = '';
    this.selectedStatus = null;
    this.applyFilters();
  }

  toggleDropdown(dropdown: string, event?: Event) {
    if (event) event.stopPropagation();
    Object.keys(this.dropdownStates).forEach(key => {
      if (key !== dropdown) this.dropdownStates[key] = false;
    });
    this.dropdownStates[dropdown] = !this.dropdownStates[dropdown];
  }

  selectDropdownItem(dropdown: string, value: any) {
    if (dropdown === 'status') {
      this.formData.status = value;
    }
    this.dropdownStates[dropdown] = false;
  }

  getSelectedLabel(dropdown: string): string {
    if (dropdown === 'status') {
      return this.getStatusLabel(this.formData.status);
    }
    return '';
  }

  @HostListener('document:click', ['$event'])
  closeDropdowns(event: Event) {
    Object.keys(this.dropdownStates).forEach(key => {
      this.dropdownStates[key] = false;
    });
  }

  // Modal
  openCreateModal() {
    this.isEditMode = false;
    this.formData = {
      namaKlien: '',
      emailKlien: '',
      noTelp: '',
      status: StatusKlien.BELUM
    };
    this.showModal = true;
  }

  openEditModal(klien: KlienDTO) {
    this.isEditMode = true;
    this.formData = { ...klien };
    this.showModal = true;
  }

  closeModal() {
    Object.keys(this.dropdownStates).forEach(key => {
      this.dropdownStates[key] = false;
    });
    this.showModal = false;
    this.formData = {
      namaKlien: '',
      emailKlien: '',
      noTelp: '',
      status: StatusKlien.BELUM
    };
  }

  // Form actions
  isFormValid(): boolean {
    return !!(
      this.formData.namaKlien.trim() &&
      this.formData.emailKlien.trim() &&
      this.formData.noTelp.trim() &&
      this.formData.status
    );
  }

  submitForm() {
    if (!this.isFormValid()) {
      this.toast.error('Error!', 'Mohon lengkapi semua field yang required');
      return;
    }

    this.processing = true;

    const action = this.isEditMode
      ? this.klienService.updateKlien(this.formData.idKlien!, this.formData)
      : this.klienService.createKlien(this.formData);

    action.subscribe({
      next: (response) => {
        if (response.success) {
          this.toast.success('Success!', response.message || 'Data klien berhasil disimpan');
          this.closeModal();
          this.loadKlien();
        } else {
          this.toast.error('Error!', response.message);
        }
        this.processing = false;
      },
      error: () => {
        this.toast.error('Error!', 'Gagal menyimpan data klien');
        this.processing = false;
      }
    });
  }

  // Status Toggle
  toggleStatus(klien: KlienDTO) {
    if (!klien.idKlien) return;

    const newStatus = klien.status === StatusKlien.AKTIF ? StatusKlien.BELUM : StatusKlien.AKTIF;
    const statusLabel = newStatus === StatusKlien.AKTIF ? 'Aktifkan' : 'Nonaktifkan';

    this.toast.helpConfirm(
      `${statusLabel} klien?`,
      `<b>"${klien.namaKlien}"</b> akan diubah statusnya menjadi <b>${this.getStatusLabel(newStatus)}</b>.`
    ).then(result => {
      if (!result) return;

      this.processing = true;
      this.klienService.updateKlienStatus(klien.idKlien!, newStatus).subscribe({
        next: () => {
          this.toast.success('Success!', 'Status klien berhasil diupdate');
          this.loadKlien();
          this.processing = false;
        },
        error: () => {
          this.toast.error('Error!', 'Gagal mengubah status klien');
          this.processing = false;
        }
      });
    });
  }

  // Delete
  deleteKlien(klien: KlienDTO) {
    if (!klien.idKlien) return;

    this.toast.helpConfirm(
      `Hapus klien?`,
      `<b>"${klien.namaKlien}"</b> akan dihapus dan tidak dapat dikembalikan.`
    ).then(result => {
      if (!result) return;

      this.processing = true;
      this.klienService.deleteKlien(klien.idKlien!).subscribe({
        next: () => {
          this.toast.success('Success!', 'Klien berhasil dihapus');
          this.loadKlien();
          this.processing = false;
        },
        error: () => {
          this.toast.error('Error!', 'Gagal menghapus klien');
          this.processing = false;
        }
      });
    });
  }

  // Helpers methods
  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'BELUM': return 'BELUM AKTIF';
      case 'AKTIF': return 'AKTIF';
      default: return status;
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  // Error handling
  private handleError(error: any, defaultMessage: string) {
    const errorMessage = error.error?.message || error.message || defaultMessage;
    this.toast.error('Error! ', errorMessage);
  }

  private showError(message: string) {
    this.toast.error('Error! ', message);
  }

  // Refresh
  refreshData() {
    this.loadKlien();
  }
}
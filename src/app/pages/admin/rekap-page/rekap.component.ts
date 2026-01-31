import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RekapService, RekapDTO } from '../../../service/admin/rekap.service';
import { KlienService, KlienDTO } from '../../../service/admin/klien.service';
import { LayananService, LayananDTO } from '../../../service/admin/layanan.service';
import { ToastService } from '../../../service/animations/toast.service';

interface RekapStatistics {
  total: number;
  masihJalan: number;
  tidakLagi: number;
}

@Component({
  selector: 'app-rekap',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rekap.component.html',
  styleUrls: ['./rekap.component.scss']
})
export class RekapComponent implements OnInit {
  // Data
  rekap: RekapDTO[] = [];
  filteredRekap: RekapDTO[] = [];
  klienList: KlienDTO[] = [];
  layananList: LayananDTO[] = [];
  statistics: RekapStatistics = {
    total: 0,
    masihJalan: 0,
    tidakLagi: 0
  };

  // UI State
  loading = false;
  processing = false;
  showModal = false;
  showDetailModal = false;
  isEditMode = false;

  // Dropdown states
  dropdownStates: { [key: string]: boolean } = {
    klien: false,
    layanan: false,
    status: false
  };

  // Filters
  searchKeyword = '';
  selectedStatus: string | null = null;

  // Selected
  selectedRekap: RekapDTO | null = null;

  // Form Data
  formData: any = {
    idKlien: 0,
    namaManagerManual: '',
    idLayanan: 0,
    tglMeeting: new Date().toISOString().split('T')[0],
    hasil: '',
    status: 'MASIH_JALAN',
    catatan: ''
  };

  constructor(
    private rekapService: RekapService,
    private klienService: KlienService,
    private layananService: LayananService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadDependencies();
    this.loadRekap();
  }

  // Data loading

  loadDependencies() {
    // Load Klien
    this.klienService.getAllKlien().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.klienList = response.data;
        }
      },
      error: (error) => console.error('Error loading klien:', error)
    });

    // Load Layanan
    this.layananService.getAllLayanan().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.layananList = response.data;
        }
      },
      error: (error) => console.error('Error loading layanan:', error)
    });
  }

  loadRekap() {
    this.loading = true;
    this.rekapService.getAllRekap().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.rekap = response.data;
          this.updateStatistics();
          this.applyFilters();
        }
        this.loading = false;
      },
      error: () => {
        this.toast.error('Error!', 'Gagal memuat data rekap meeting');
        this.loading = false;
      }
    });
  }

  updateStatistics() {
    this.statistics.total = this.rekap.length;
    this.statistics.masihJalan = this.rekap.filter(
      r => r.status === 'MASIH_JALAN'
    ).length;
    this.statistics.tidakLagi = this.rekap.filter(
      r => r.status === 'TIDAK_LAGI_PAKAI_PANJANG_KARAKTER_UNTUK_CATATAN'
    ).length;
  }

  // Filtering
  selectStatus(status: string | null) {
    this.selectedStatus = status;
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.rekap];

    // Filter by keyword
    if (this.searchKeyword.trim()) {
      const keyword = this.searchKeyword.toLowerCase();
      result = result.filter(r =>
        r.namaKlien?.toLowerCase().includes(keyword) ||
        r.namaManager?.toLowerCase().includes(keyword) ||
        r.namaLayanan?.toLowerCase().includes(keyword)
      );
    }

    // Filter by status
    if (this.selectedStatus) {
      result = result.filter(r => r.status === this.selectedStatus);
    }

    this.filteredRekap = result;
  }

  onSearchChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchKeyword = '';
    this.selectedStatus = null;
    this.applyFilters();
  }

  // Dropdown methods
  toggleDropdown(dropdown: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    // Close all other dropdowns
    Object.keys(this.dropdownStates).forEach(key => {
      if (key !== dropdown) {
        this.dropdownStates[key] = false;
      }
    });
    
    // Toggle current dropdown
    this.dropdownStates[dropdown] = !this.dropdownStates[dropdown];
  }

  selectDropdownItem(dropdown: string, value: any) {
    switch(dropdown) {
      case 'klien':
        this.formData.idKlien = value;
        break;
      case 'layanan':
        this.formData.idLayanan = value;
        break;
      case 'status':
        this.formData.status = value;
        break;
    }
    
    this.dropdownStates[dropdown] = false;
  }

  getSelectedLabel(dropdown: string): string {
    switch(dropdown) {
      case 'klien':
        const klien = this.klienList.find(k => k.idKlien === this.formData.idKlien);
        return klien?.namaKlien || 'Pilih Klien';
      case 'layanan':
        const layanan = this.layananList.find(l => l.idLayanan === this.formData.idLayanan);
        return layanan?.namaLayanan || 'Pilih Layanan';
      case 'status':
        return this.getStatusLabel(this.formData.status);
      default:
        return '';
    }
  }

  @HostListener('document:click', ['$event'])
  closeDropdowns(event: Event) {
    Object.keys(this.dropdownStates).forEach(key => {
      this.dropdownStates[key] = false;
    });
  }

  // Modal actions

  openCreateModal() {
    this.isEditMode = false;
    this.formData = {
      idKlien: 0,
      namaManagerManual: '',
      idLayanan: 0,
      tglMeeting: new Date().toISOString().split('T')[0],
      hasil: '',
      status: 'MASIH_JALAN',
      catatan: ''
    };
    this.showModal = true;
  }

  openEditModal(rekap: RekapDTO) {
    this.isEditMode = true;
    this.formData = {
      ...rekap,
      namaManagerManual: rekap.namaManager || '',
      tglMeeting: this.formatDateForInput(rekap.tglMeeting)
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    // Close all dropdowns
    Object.keys(this.dropdownStates).forEach(key => {
      this.dropdownStates[key] = false;
    });
    this.formData = {
      idKlien: 0,
      namaManagerManual: '',
      idLayanan: 0,
      tglMeeting: new Date().toISOString().split('T')[0],
      hasil: '',
      status: 'MASIH_JALAN',
      catatan: ''
    };
  }

  openDetailModal(rekap: RekapDTO) {
    this.selectedRekap = rekap;
    this.showDetailModal = true;
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedRekap = null;
  }

  // Form actions

  isFormValid(): boolean {
    return !!(
      this.formData.idKlien &&
      this.formData.namaManagerManual?.trim() &&
      this.formData.idLayanan &&
      this.formData.tglMeeting &&
      this.formData.status
    );
  }

  submitForm() {
    if (!this.isFormValid()) {
      this.toast.warning('Warning', 'Mohon lengkapi semua field yang required');
      return;
    }

    this.processing = true;

    const action = this.isEditMode
      ? this.rekapService.updateRekap(this.formData.idMeeting!, this.formData)
      : this.rekapService.createRekap(this.formData);

    action.subscribe({
      next: (response) => {
        if (response.success) {
          this.toast.success('Success', response.message || 'Rekap berhasil disimpan');
          this.closeModal();
          this.loadRekap();
        } else {
          this.toast.error('Error', response.message);
        }
        this.processing = false;
      },
      error: () => {
        this.toast.error('Error', 'Gagal menyimpan rekap');
        this.processing = false;
      }
    });
  }

  // Delete
  async deleteRekap(rekap: RekapDTO) {
    if (!rekap.idMeeting) return;

    const ok = await this.toast.helpConfirm(
      'Hapus rekap meeting?',
      `
        Klien: <b>${rekap.namaKlien}</b><br>
        Tanggal: ${this.formatDate(rekap.tglMeeting)}
      `
    );

    if (!ok) return;

    this.processing = true;
    this.rekapService.deleteRekap(rekap.idMeeting).subscribe({
      next: (response) => {
        if (response.success) {
          this.toast.success('Success', 'Rekap meeting berhasil dihapus');
          this.loadRekap();
        } else {
          this.toast.error('Error', response.message);
        }
        this.processing = false;
      },
      error: () => {
        this.toast.error('Error', 'Gagal menghapus rekap');
        this.processing = false;
      }
    });
  }

  // Helpers methods
  getStatusClass(status: string): string {
    const mapping: { [key: string]: string } = {
      'MASIH_JALAN': 'status-masih-jalan',
      'TIDAK_LAGI_PAKAI_PANJANG_KARAKTER_UNTUK_CATATAN': 'status-tidak-lagi'
    };
    return mapping[status] || '';
  }

  getStatusLabel(status: string): string {
    const mapping: { [key: string]: string } = {
      'MASIH_JALAN': 'Masih Jalan',
      'TIDAK_LAGI_PAKAI_PANJANG_KARAKTER_UNTUK_CATATAN': 'Tidak Lagi'
    };
    return mapping[status] || status;
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  formatDateForInput(date: Date | string | undefined): string {
    if (!date) return new Date().toISOString().split('T')[0];
    return new Date(date).toISOString().split('T')[0];
  }

  // Refresh data
  refreshData() {
    this.loadRekap();
  }
}
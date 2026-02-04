import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayananService, LayananDTO } from '../../../service/admin/layanan.service';
import { AuthService } from '../../../service/auth/auth.service';
import { ToastService } from '../../../service/animations/toast.service';

interface LayananStatistics {
  total: number;
  sosial: number;
  pirantiLunak: number;
  multimedia: number;
  mesinSekuritas: number;
}

interface KategoriOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-layanan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './layanan.component.html',
  styleUrls: ['./layanan.component.scss']
})
export class LayananComponent implements OnInit {
  // Data
  layanan: LayananDTO[] = [];
  filteredLayanan: LayananDTO[] = [];
  statistics: LayananStatistics = {
    total: 0,
    sosial: 0,
    pirantiLunak: 0,
    multimedia: 0,
    mesinSekuritas: 0
  };

  // UI State
  loading = false;
  processing = false;
  showModal = false;
  isEditMode = false;

  // Permissions
  canEdit = false;
  canDelete = false;
  canAdd = false;

  // Dropdown States
  dropdownStates: { [key: string]: boolean } = {
    kategori: false
  };

  // Filters
  searchKeyword = '';
  selectedKategori: string | null = null;

  // Kategori options
  kategoriOptions: KategoriOption[] = [
    { value: 'SOSIAL', label: 'Sosial' },
    { value: 'PIRANTI_LUNAK', label: 'Piranti Lunak' },
    { value: 'MULTIMEDIA', label: 'Multimedia' },
    { value: 'MESIN_SEKURITAS', label: 'Mesin Sekuritas' }
  ];

  // Form Data
  formData: LayananDTO = {
    namaLayanan: '',
    kategori: 'SOSIAL',
    catatan: ''
  };

  constructor(
    private layananService: LayananService,
    private toast: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadLayanan();
    this.checkPermissions();
  }

  // Data loading
  loadLayanan() {
    this.loading = true;
    this.layananService.getAllLayanan().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.layanan = response.data;
          this.updateStatistics();
          this.applyFilters();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading layanan:', error);
        this.showError('Gagal memuat data layanan');
        this.loading = false;
      }
    });
  }

  checkPermissions() {
    const role = this.authService.currentUserValue?.role;
    this.canEdit = role === 'SUPER_ADMIN';
    this.canDelete = role === 'SUPER_ADMIN';
    this.canAdd = role === 'SUPER_ADMIN';
  }

  updateStatistics() {
    this.statistics.total = this.layanan.length;
    this.statistics.sosial = this.layanan.filter(l => l.kategori === 'SOSIAL').length;
    this.statistics.pirantiLunak = this.layanan.filter(l => l.kategori === 'PIRANTI_LUNAK').length;
    this.statistics.multimedia = this.layanan.filter(l => l.kategori === 'MULTIMEDIA').length;
    this.statistics.mesinSekuritas = this.layanan.filter(l => l.kategori === 'MESIN_SEKURITAS').length;
  }

  // Filtering
  selectKategori(kategori: string | null) {
    this.selectedKategori = kategori;
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.layanan];

    // Filter by keyword
    if (this.searchKeyword.trim()) {
      const keyword = this.searchKeyword.toLowerCase();
      result = result.filter(l =>
        l.namaLayanan.toLowerCase().includes(keyword) ||
        l.catatan?.toLowerCase().includes(keyword)
      );
    }

    // Filter by kategori
    if (this.selectedKategori) {
      result = result.filter(l => l.kategori === this.selectedKategori);
    }

    this.filteredLayanan = result;
  }

  onSearchChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchKeyword = '';
    this.selectedKategori = null;
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
    if (dropdown === 'kategori') {
      this.formData.kategori = value;
    }
    this.dropdownStates[dropdown] = false;
  }

  getSelectedLabel(dropdown: string): string {
    if (dropdown === 'kategori') {
      return this.getKategoriLabel(this.formData.kategori);
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
    if (!this.canAdd) {
      this.toast.error('Akses ditolak', 'Anda tidak memiliki izin menambah layanan');
      return;
    }

    this.isEditMode = false;
    this.formData = {
      namaLayanan: '',
      kategori: 'SOSIAL',
      catatan: ''
    };
    this.showModal = true;
  }

  openEditModal(layanan: LayananDTO) {
    this.isEditMode = true;
    this.formData = { ...layanan };
    this.showModal = true;
  }

  closeModal() {
    Object.keys(this.dropdownStates).forEach(key => {
      this.dropdownStates[key] = false;
    });
    this.showModal = false;
    this.formData = {
      namaLayanan: '',
      kategori: 'SOSIAL',
      catatan: ''
    };
  }

  // Form
  isFormValid(): boolean {
    return !!(
      this.formData.namaLayanan.trim() &&
      this.formData.kategori
    );
  }

  submitForm() {
    if (!this.isFormValid()) {
      this.toast.warning('Warning', 'Mohon lengkapi semua field yang required');
      return;
    }

    this.processing = true;

    const action = this.isEditMode
      ? this.layananService.updateLayanan(this.formData.idLayanan!, this.formData)
      : this.layananService.createLayanan(this.formData);

    action.subscribe({
      next: (response) => {
        if (response.success) {
          this.toast.success('Success!', response.message || 'Data layanan berhasil disimpan');
          this.closeModal();
          this.loadLayanan();
        } else {
          this.toast.error('Error!', response.message || 'Gagal menyimpan layanan');
        }
        this.processing = false;
      },
      error: () => {
        this.toast.error('Error!', 'Gagal menyimpan data layanan');
        this.processing = false;
      }
    });
  }

  // Delete
  async deleteLayanan(layanan: LayananDTO) {
    if (!layanan.idLayanan) return;

    const ok = await this.toast.helpConfirm(
      'Hapus layanan?',
      `Layanan "<b>${layanan.namaLayanan}</b>" akan dihapus permanen.`
    );

    if (!ok) return;

    this.processing = true;
    this.layananService.deleteLayanan(layanan.idLayanan).subscribe({
      next: (response) => {
        if (response.success) {
          this.toast.success('Success!', 'Layanan berhasil dihapus');
          this.loadLayanan();
        } else {
          this.toast.error('Error!', response.message || 'Gagal menghapus layanan');
        }
        this.processing = false;
      },
      error: () => {
        this.toast.error('Error!', 'Gagal menghapus layanan');
        this.processing = false;
      }
    });
  }

  // Helpers methods
  getKategoriClass(kategori: string): string {
    const mapping: { [key: string]: string } = {
      'SOSIAL': 'kategori-sosial',
      'PIRANTI_LUNAK': 'kategori-piranti-lunak',
      'MULTIMEDIA': 'kategori-multimedia',
      'MESIN_SEKURITAS': 'kategori-mesin-sekuritas'
    };
    return mapping[kategori] || '';
  }

  getKategoriLabel(kategori: string): string {
    const option = this.kategoriOptions.find(k => k.value === kategori);
    return option ? option.label : kategori;
  }

  // Error handling
  private handleError(error: any, defaultMessage: string) {
    const errorMessage = error.error?.message || error.message || defaultMessage;
    this.toast.error('Error! ', errorMessage);
  }

  private showError(message: string) {
    this.toast.error('Error! ', message);
  }

  // Refresh data
  refreshData() {
    this.loadLayanan();
  }
}
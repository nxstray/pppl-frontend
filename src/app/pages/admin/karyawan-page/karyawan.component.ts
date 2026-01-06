import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KaryawanService, KaryawanDTO } from '../../../service/karyawan.service';
import { ManagerService, ManagerDTO } from '../../../service/manager.service';
import { AuthService } from '../../../service/auth.service';
import { ToastService } from '../../../service/toast.service';

interface KaryawanStatistics {
  total: number;
}

@Component({
  selector: 'app-karyawan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './karyawan.component.html',
  styleUrls: ['./karyawan.component.scss']
})
export class KaryawanComponent implements OnInit {
  // Data
  karyawan: KaryawanDTO[] = [];
  filteredKaryawan: KaryawanDTO[] = [];
  managers: ManagerDTO[] = [];
  statistics: KaryawanStatistics = { total: 0 };

  // UI State
  loading = false;
  processing = false;
  showModal = false;
  isEditMode = false;

  canEdit = false;
  canDelete = false;

  // Upload Photo State
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  uploadingPhoto = false;

  // Dropdown States
  dropdownStates: { [key: string]: boolean } = {
    manager: false
  };

  // Filters
  searchKeyword = '';
  selectedManager: number | null = null;

  // Form Data
  formData: KaryawanDTO = {
    namaKaryawan: '',
    emailKaryawan: '',
    noTelp: '',
    jabatanPosisi: '',
    idManager: 0,
    fotoProfil: undefined
  };

  constructor(
    private karyawanService: KaryawanService,
    private managerService: ManagerService,
    private toast: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadManagers();
    this.loadKaryawan();
    this.checkPermissions();
  }

  // Data loading
  loadManagers() {
    this.managerService.getAllManagers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.managers = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading managers:', error);
      }
    });
  }

  loadKaryawan() {
    this.loading = true;
    this.karyawanService.getAllKaryawan().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.karyawan = response.data;
          this.updateStatistics();
          this.applyFilters();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading karyawan:', error);
        this.showError('Gagal memuat data karyawan');
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
    this.statistics.total = this.karyawan.length;
  }

  // Filtering
  selectManager(idManager: number | null) {
    this.selectedManager = idManager;
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.karyawan];

    if (this.searchKeyword.trim()) {
      const keyword = this.searchKeyword.toLowerCase();
      result = result.filter(k =>
        k.namaKaryawan.toLowerCase().includes(keyword) ||
        k.emailKaryawan.toLowerCase().includes(keyword) ||
        k.jabatanPosisi.toLowerCase().includes(keyword) ||
        k.namaManager?.toLowerCase().includes(keyword)
      );
    }

    if (this.selectedManager !== null) {
      result = result.filter(k => k.idManager === this.selectedManager);
    }

    this.filteredKaryawan = result;
  }

  onSearchChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchKeyword = '';
    this.selectedManager = null;
    this.applyFilters();
  }

  toggleDropdown(dropdown: string, event?: Event) {
    if (event) event.stopPropagation();
    Object.keys(this.dropdownStates).forEach(key => {
      if (key !== dropdown) this.dropdownStates[key] = false;
    });
    this.dropdownStates[dropdown] = !this.dropdownStates[dropdown];
  }

  //  fixed: Bug dropdown tidak bisa select
  selectDropdownItem(dropdown: string, value: any) {
    if (dropdown === 'manager') {  // 'status' jadi 'manager'
      this.formData.idManager = value;
      console.log('Manager selected:', value);
    }
    this.dropdownStates[dropdown] = false;
  }

  getSelectedLabel(dropdown: string): string {
    if (dropdown === 'manager') {
      const manager = this.managers.find(m => m.idManager === this.formData.idManager);
      return manager?.namaManager || 'Pilih Manager';
    }
    return '';
  }

  @HostListener('document:click', ['$event'])
  closeDropdowns(event: Event) {
    Object.keys(this.dropdownStates).forEach(key => {
      this.dropdownStates[key] = false;
    });
  }

  // Photo Upload Handlers
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    
    if (!file) return;

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.toast.error('File Terlalu Besar', 'Ukuran maksimal 2MB');
      event.target.value = '';
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.toast.error('Invalid File', 'Hanya file gambar yang diperbolehkan');
      event.target.value = '';
      return;
    }

    this.selectedFile = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removePhoto() {
    this.selectedFile = null;
    this.previewUrl = null;
    this.formData.fotoProfil = undefined;
  }

  getPhotoPreview(): string | null {
    return this.previewUrl || this.formData.fotoProfil || null;
  }

  getInitial(): string {
    return this.formData.namaKaryawan?.charAt(0).toUpperCase() || 'K';
  }

  // Modal handling
  openCreateModal() {
    this.isEditMode = false;
    this.formData = {
      namaKaryawan: '',
      emailKaryawan: '',
      noTelp: '',
      jabatanPosisi: '',
      idManager: 0,
      fotoProfil: undefined
    };
    this.selectedFile = null;
    this.previewUrl = null;
    this.showModal = true;
  }

  openEditModal(karyawan: KaryawanDTO) {
    this.isEditMode = true;
    this.formData = { ...karyawan };
    this.selectedFile = null;
    this.previewUrl = null;
    this.showModal = true;
  }

  closeModal() {
    Object.keys(this.dropdownStates).forEach(key => {
      this.dropdownStates[key] = false;
    });
    this.showModal = false;
    this.selectedFile = null;
    this.previewUrl = null;
    this.formData = {
      namaKaryawan: '',
      emailKaryawan: '',
      noTelp: '',
      jabatanPosisi: '',
      idManager: 0,
      fotoProfil: undefined
    };
  }

  // Form validation
  isFormValid(): boolean {
    return !!(
      this.formData.namaKaryawan.trim() &&
      this.formData.emailKaryawan.trim() &&
      this.formData.noTelp.trim() &&
      this.formData.jabatanPosisi.trim() &&
      this.formData.idManager
    );
  }

  // Submit with Photo
  async submitForm() {
    if (!this.isFormValid()) {
      this.toast.warning('Warning', 'Mohon lengkapi semua field yang required');
      return;
    }

    this.processing = true;

    try {
      // Upload foto dulu jika ada
      if (this.selectedFile) {
        this.uploadingPhoto = true;
        const uploadResult = await this.uploadPhoto(this.selectedFile);
        if (uploadResult) {
          this.formData.fotoProfil = uploadResult;
        }
        this.uploadingPhoto = false;
      }

      // Save karyawan data
      const action = this.isEditMode
        ? this.karyawanService.updateKaryawan(this.formData.idKaryawan!, this.formData)
        : this.karyawanService.createKaryawan(this.formData);

      action.subscribe({
        next: (response) => {
          if (response.success) {
            this.toast.success('Success!', response.message || 'Data karyawan berhasil disimpan');
            this.closeModal();
            this.loadKaryawan();
          } else {
            this.toast.error('Error!', response.message || 'Gagal menyimpan data');
          }
          this.processing = false;
        },
        error: (error) => {
          this.toast.error('Error!', 'Gagal menyimpan data karyawan');
          this.processing = false;
        }
      });
    } catch (error) {
      this.toast.error('Error!', 'Gagal upload foto');
      this.processing = false;
      this.uploadingPhoto = false;
    }
  }

  // Upload photo method
  private uploadPhoto(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        resolve(e.target.result); // Return Base64
      };
      reader.onerror = () => reject('Failed to read file');
      reader.readAsDataURL(file);
    });
  }

  // Delete
  deleteKaryawan(karyawan: KaryawanDTO) {
    if (!karyawan.idKaryawan) return;

    this.toast.helpConfirm(
      `Hapus karyawan "${karyawan.namaKaryawan}"?`,
      'Tindakan ini tidak dapat dibatalkan'
    ).then(result => {
      if (!result) return;

      this.processing = true;
      this.karyawanService.deleteKaryawan(karyawan.idKaryawan!).subscribe({
        next: (res) => {
          if (res.success) {
            this.toast.success('Success!', 'Karyawan berhasil dihapus');
            this.loadKaryawan();
          } else {
            this.toast.error('Error!', res.message);
          }
          this.processing = false;
        },
        error: () => {
          this.toast.error('Error!', 'Gagal menghapus karyawan');
          this.processing = false;
        }
      });
    });
  }

  // Error handling
  private showError(message: string) {
    this.toast.error('Error!', message);
  }

  // Refresh data
  refreshData() {
    this.loadKaryawan();
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagerService, ManagerDTO } from '../../../service/manager.service';
import { AdminService, RegisterManagerRequest } from '../../../service/admin.service';
import { AuthService } from '../../../service/auth.service';
import { ToastService } from '../../../service/toast.service';

@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.scss']
})
export class ManagerComponent implements OnInit {
  // Data
  managers: ManagerDTO[] = [];
  filteredManagers: ManagerDTO[] = [];
  divisiList: string[] = [];
  
  // UI State
  loading = false;
  showModal = false;
  showRegisterUserModal = false;

  // Permissions
  canEdit = false;
  canDelete = false;
  canAdd = false;

  // Register User Form
  registerUserForm = {
    namaLengkap: '',
    email: ''
  };
  modalMode: 'create' | 'edit' | 'view' = 'create';
  
  // Form
  formData: ManagerDTO = this.getEmptyForm();
  formErrors: any = {};
  
  // Filters
  searchKeyword = '';
  selectedDivisi = '';
  
  constructor(
    private managerService: ManagerService,
    private adminService: AdminService,
    private toast: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadManagers();
    this.loadDivisiList();
    this.checkPermissions();
  }

  // Data loading
  loadManagers() {
    this.loading = true;
    this.managerService.getAllManagers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.managers = response.data;
          this.applyFilters();
        }
        this.loading = false;
      },
      error: () => {
        this.toast.error('Error!', 'Gagal memuat data manager');
        this.loading = false;
      }
    });
  }

  loadDivisiList() {
    this.managerService.getDivisiList().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.divisiList = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading divisi:', error);
      }
    });
  }

  checkPermissions() {
    const role = this.authService.currentUserValue?.role;
    this.canEdit = role === 'SUPER_ADMIN';
    this.canDelete = role === 'SUPER_ADMIN';
    this.canAdd = role === 'SUPER_ADMIN';
  }

  // Filtering
  applyFilters() {
    let result = [...this.managers];

    // Search by keyword
    if (this.searchKeyword.trim()) {
      const keyword = this.searchKeyword.toLowerCase();
      result = result.filter(m => 
        m.namaManager.toLowerCase().includes(keyword) ||
        m.emailManager.toLowerCase().includes(keyword) ||
        m.divisi.toLowerCase().includes(keyword)
      );
    }

    // Filter by divisi
    if (this.selectedDivisi) {
      result = result.filter(m => m.divisi === this.selectedDivisi);
    }

    this.filteredManagers = result;
  }

  onSearchChange() {
    this.applyFilters();
  }

  onDivisiFilterChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchKeyword = '';
    this.selectedDivisi = '';
    this.applyFilters();
  }

  // Modal
  openCreateModal() {
    if (!this.canAdd) {
      this.toast.error('Akses ditolak', 'Anda tidak memiliki izin menambah manager');
      return;
    }

    this.modalMode = 'create';
    this.formData = this.getEmptyForm();
    this.formErrors = {};
    this.showModal = true;
  }

  openEditModal(manager: ManagerDTO) {
    this.modalMode = 'edit';
    this.formData = { ...manager };
    this.formErrors = {};
    this.showModal = true;
  }

  openViewModal(manager: ManagerDTO) {
    this.modalMode = 'view';
    this.formData = { ...manager };
    this.showModal = true;
  }

  openRegisterUserModal() {
    this.showRegisterUserModal = true;
    this.registerUserForm = {
      namaLengkap: '',
      email: ''
    };
  }

  closeModal() {
    this.showModal = false;
    this.formData = this.getEmptyForm();
    this.formErrors = {};
  }

  closeRegisterUserModal() {
    this.showRegisterUserModal = false;
    this.registerUserForm = {
      namaLengkap: '',
      email: ''
    };
  }

  // CRUD operations
  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    if (this.modalMode === 'create') {
      this.createManager();
    } else if (this.modalMode === 'edit') {
      this.updateManager();
    }
  }

  onSubmitRegisterUser() {
    if (!this.registerUserForm.namaLengkap || !this.registerUserForm.email) {
      this.toast.warning('Warning', 'Nama dan email wajib diisi');
      return;
    }

    this.loading = true;
    
    const request: RegisterManagerRequest = {
      namaLengkap: this.registerUserForm.namaLengkap,
      email: this.registerUserForm.email
    };

    this.adminService.registerManager(request).subscribe({
      next: (response) => {
        if (response.success) {
          this.toast.success('Success!', 'Manager berhasil didaftarkan. Email dengan kredensial telah dikirim ke ' + request.email);
          this.closeRegisterUserModal();
        } else {
          this.toast.error('Error!', response.message);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.toast.error('Error!', error.error?.message || 'Gagal mendaftarkan manager');
        this.loading = false;
      }
    });
  }

  createManager() {
    this.loading = true;
    this.managerService.createManager(this.formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.toast.success('Success!', 'Manager berhasil ditambahkan');
          this.closeModal();
          this.loadManagers();
          this.loadDivisiList();
        } else {
          this.toast.error('Error!', response.message);
        }
        this.loading = false;
      },
      error: () => {
        this.toast.error('Error!', 'Gagal menambah manager');
        this.loading = false;
      }
    });
  }

  updateManager() {
    if (!this.formData.idManager) return;

    this.loading = true;
    this.managerService.updateManager(this.formData.idManager, this.formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.toast.success('Success!', 'Manager berhasil diupdate');
          this.closeModal();
          this.loadManagers();
        } else {
          this.toast.error('Error!', response.message);
        }
        this.loading = false;
      },
      error: () => {
        this.toast.error('Error!', 'Gagal update manager');
        this.loading = false;
      }
    });
  }

  async deleteManager(manager: ManagerDTO) {
    if (!manager.idManager) return;

    const ok = await this.toast.helpConfirm(
      'Hapus manager?',
      `Manager "<b>${manager.namaManager}</b>" akan dihapus permanen.`
    );

    if (!ok) return;

    this.loading = true;
    this.managerService.deleteManager(manager.idManager).subscribe({
      next: (response) => {
        if (response.success) {
          this.toast.success('Success!', 'Manager berhasil dihapus');
          this.loadManagers();
          this.loadDivisiList();
        } else {
          this.toast.error('Error!', response.message);
        }
        this.loading = false;
      },
      error: () => {
        this.toast.error('Error!', 'Gagal menghapus manager');
        this.loading = false;
      }
    });
  }

  // Validation
  validateForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    if (!this.formData.namaManager || !this.formData.namaManager.trim()) {
      this.formErrors.namaManager = 'Nama manager wajib diisi';
      isValid = false;
    }

    if (!this.formData.emailManager || !this.formData.emailManager.trim()) {
      this.formErrors.emailManager = 'Email wajib diisi';
      isValid = false;
    } else if (!this.validateEmail(this.formData.emailManager)) {
      this.formErrors.emailManager = 'Format email tidak valid';
      isValid = false;
    }

    if (!this.formData.noTelp || !this.formData.noTelp.trim()) {
      this.formErrors.noTelp = 'No. Telepon wajib diisi';
      isValid = false;
    }

    if (!this.formData.divisi || !this.formData.divisi.trim()) {
      this.formErrors.divisi = 'Divisi wajib diisi';
      isValid = false;
    }

    if (!this.formData.tglMulai) {
      this.formErrors.tglMulai = 'Tanggal mulai wajib diisi';
      isValid = false;
    }

    if (!isValid) {
      this.toast.warning('Warning', 'Mohon lengkapi semua field yang wajib diisi');
    }

    return isValid;
  }

  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Helpers methods
  getEmptyForm(): ManagerDTO {
    return {
      namaManager: '',
      emailManager: '',
      noTelp: '',
      divisi: '',
      tglMulai: new Date().toISOString().split('T')[0]
    };
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getModalTitle(): string {
    switch (this.modalMode) {
      case 'create': return 'Tambah Manager Baru';
      case 'edit': return 'Edit Manager';
      case 'view': return 'Detail Manager';
      default: return 'Manager';
    }
  }
}
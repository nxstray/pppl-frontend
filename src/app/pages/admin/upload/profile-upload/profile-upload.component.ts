import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../service/auth.service';
import { ToastService } from '../../../../service/toast.service';

@Component({
  selector: 'app-profile-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-upload.component.html',
  styleUrls: ['./profile-upload.component.scss']
})
export class ProfileUploadComponent implements OnInit {
  currentUser: any = null;
  uploading = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;

    // Subscribe to current user changes
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  /**
   * Trigger file input click
   */
  triggerFileInput(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  /**
   * Handle file selection
   */
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    
    if (!file) return;

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.toast.error('File Terlalu Besar', 'Ukuran maksimal 2MB');
      event.target.value = ''; // Reset input
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.toast.error('Invalid File', 'Hanya file gambar yang diperbolehkan');
      event.target.value = ''; // Reset input
      return;
    }

    this.selectedFile = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl = e.target.result;
    };
    reader.readAsDataURL(file);

    // Auto upload after selection
    this.uploadPhoto(file);
  }

  /**
   * Upload photo to server
   */
  uploadPhoto(file: File) {
    this.uploading = true;

    this.authService.uploadFotoProfil(file).subscribe({
      next: (response) => {
        if (response.success) {
          this.toast.success('Berhasil!', 'Foto profil berhasil diupdate');
          this.currentUser = this.authService.currentUserValue;
          this.previewUrl = null;
          this.selectedFile = null;
        }
        this.uploading = false;
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.toast.error(
          'Gagal Upload', 
          error.error?.message || 'Terjadi kesalahan saat upload foto'
        );
        this.uploading = false;
        this.previewUrl = null;
        this.selectedFile = null;
      }
    });
  }

  /**
   * Cancel upload (clear preview)
   */
  cancelUpload() {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  /**
   * Get display name initial
   */
  getInitial(): string {
    return this.currentUser?.namaLengkap?.charAt(0).toUpperCase() || 'A';
  }

  /**
   * Get current photo or preview
   */
  getCurrentPhoto(): string | null {
    return this.previewUrl || this.currentUser?.fotoProfil || null;
  }
}
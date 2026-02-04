import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContentPageService, PageName, ContentType, ContentPageDTO, UpdateContentRequest } from '../../../service/admin/content-page.service';
import { ToastService } from '../../../service/animations/toast.service';

@Component({
  selector: 'app-content-manage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './content-manage.component.html',
  styleUrls: ['./content-manage.component.scss']
})
export class ContentManageComponent implements OnInit {
  selectedPage: PageName = PageName.LANDING;
  pageContent: ContentPageDTO[] = [];
  loading = false;
  processing = false;
  uploading = false;
  showModal = false;
  isEditMode = false;

  previewImageUrl: string = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
  uploadedFileName: string = '';

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  dropdownStates: { [key: string]: boolean } = {
    pageName: false,
    ContentType: false
  };

  pageOptions = [
    { label: 'Landing', value: PageName.LANDING },
    { label: 'What We Do', value: PageName.WHAT_WE_DO },
    { label: 'Who We Are', value: PageName.WHO_WE_ARE },
    { label: 'Our Work', value: PageName.OUR_WORK },
    { label: 'Build With Us', value: PageName.BUILD_WITH_US }
  ];

  contentTypeOptions = [
    { label: 'Text', value: ContentType.TEXT },
    { label: 'HTML', value: ContentType.HTML },
    { label: 'Image URL', value: ContentType.IMAGE_URL },
    { label: 'JSON', value: ContentType.JSON },
    { label: 'Number', value: ContentType.NUMBER }
  ];

  formData: ContentPageDTO = this.getEmptyFormData();

  constructor(
    private contentService: ContentPageService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadPageContent();
  }

  get activeContentCount(): number {
    return this.pageContent.filter(c => c.isActive).length;
  }

  loadPageContent() {
    this.loading = true;
    this.contentService.getPageContentForAdmin(this.selectedPage).subscribe({
      next: (response) => {
        this.pageContent = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.toast.error('Error!', 'Gagal memuat konten halaman');
        this.loading = false;
      }
    });
  }

  onPageChange() {
    this.closeModal();
    this.loadPageContent();
  }

  openCreateModal() {
    this.isEditMode = false;
    this.formData = this.getEmptyFormData();
    this.previewImageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    this.uploadedFileName = '';
    this.showModal = true;
  }

  openEditModal(content: ContentPageDTO) {
    this.isEditMode = true;
    this.formData = { ...content };
    
    if (content.contentType === ContentType.IMAGE_URL && content.contentValue) {
      this.previewImageUrl = this.getImagePreviewUrl(content.contentValue);
    } else {
      this.previewImageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    }
    
    this.uploadedFileName = '';
    this.showModal = true;
  }

  closeModal() {
    Object.keys(this.dropdownStates).forEach(key => {
      this.dropdownStates[key] = false;
    });
    this.showModal = false;
    this.previewImageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    this.uploadedFileName = '';
    this.formData = this.getEmptyFormData();
  }

  toggleDropdown(dropdown: string, event?: Event) {
    if (event) event.stopPropagation();
    Object.keys(this.dropdownStates).forEach(key => {
      if (key !== dropdown) this.dropdownStates[key] = false;
    });
    this.dropdownStates[dropdown] = !this.dropdownStates[dropdown];
  }

  selectDropdownItem(dropdown: string, value: any) {
    if (dropdown === 'ContentType') {
      this.formData.contentType = value;
    }
    this.dropdownStates[dropdown] = false;
  }

  getSelectedTypeLabel(): string {
    const selected = this.contentTypeOptions.find(t => t.value === this.formData.contentType);
    return selected ? selected.label : 'Pilih Type';
  }

  @HostListener('document:click', ['$event'])
  closeDropdowns(event: Event) {
    Object.keys(this.dropdownStates).forEach(key => {
      this.dropdownStates[key] = false;
    });
  }

  triggerFileInput() {
    if (this.uploading) return;
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Validasi client-side
    if (!file.type.startsWith('image/')) {
      this.toast.error('Error!', 'File harus berupa gambar');
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.toast.error('Error!', 'Ukuran file maksimal 5MB');
      input.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    this.uploading = true;
    
    this.contentService.uploadImage(formData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.uploadedFileName = response.data.filename;
          this.formData.contentValue = response.data.filename;
          this.previewImageUrl = this.getImagePreviewUrl(response.data.filename);
        }
        this.uploading = false;
        input.value = '';
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.toast.error('Error!', 'Gagal upload gambar');
        this.uploading = false;
        input.value = '';
      }
    });
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (!img.src.includes('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=')) {
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    }
  }

  isFormValid(): boolean {
    return !!(
      this.formData.sectionKey?.trim() &&
      this.formData.contentLabel?.trim() &&
      this.formData.contentValue?.trim() &&
      this.formData.contentType &&
      this.formData.displayOrder !== null &&
      this.formData.displayOrder !== undefined
    );
  }

  submitForm() {
    if (!this.isFormValid()) {
      this.toast.error('Error!', 'Mohon lengkapi semua field yang required');
      return;
    }

    this.processing = true;

    const request: UpdateContentRequest = {
      pageName: this.selectedPage,
      sectionKey: this.formData.sectionKey,
      contentType: this.formData.contentType,
      contentValue: this.formData.contentValue,
      contentLabel: this.formData.contentLabel,
      displayOrder: this.formData.displayOrder
    };

    const action = this.isEditMode && this.formData.idContent
      ? this.contentService.updateContent(this.formData.idContent, request)
      : this.contentService.createContent(request);

    action.subscribe({
      next: (response) => {
        this.toast.success('Success!', this.isEditMode ? 'Content berhasil diupdate' : 'Content berhasil dibuat');
        this.closeModal();
        this.loadPageContent();
        this.processing = false;
      },
      error: (error) => {
        console.error('Save error:', error);
        this.toast.error('Error!', this.isEditMode ? 'Gagal mengupdate content' : 'Gagal membuat content');
        this.processing = false;
      }
    });
  }

  async toggleActive(content: ContentPageDTO) {
    if (!content.idContent) return;

    const confirmed = await this.toast.helpConfirm(
      `${content.isActive ? 'Nonaktifkan' : 'Aktifkan'} content?`,
      `Content "<b>${content.contentLabel}</b>" akan ${content.isActive ? 'dinonaktifkan' : 'diaktifkan'}`
    );

    if (!confirmed) return;

    this.processing = true;
    this.contentService.toggleActive(content.idContent).subscribe({
      next: () => {
        this.toast.success('Success!', `Content berhasil ${content.isActive ? 'dinonaktifkan' : 'diaktifkan'}`);
        this.loadPageContent();
        this.processing = false;
      },
      error: (error) => {
        this.toast.error('Error!', 'Gagal mengubah status');
        this.processing = false;
      }
    });
  }

  async deleteContent(content: ContentPageDTO) {
    if (!content.idContent) return;

    const confirmed = await this.toast.helpConfirm(
      'Hapus content?',
      `Content "<b>${content.contentLabel}</b>" akan dihapus permanen dan tidak dapat dikembalikan`
    );

    if (!confirmed) return;

    this.processing = true;
    this.contentService.deleteContent(content.idContent).subscribe({
      next: () => {
        this.toast.success('Success!', 'Content berhasil dihapus');
        this.loadPageContent();
        this.processing = false;
      },
      error: (error) => {
        this.toast.error('Error!', 'Gagal menghapus content');
        this.processing = false;
      }
    });
  }

  private getEmptyFormData(): ContentPageDTO {
    return {
      pageName: this.selectedPage,
      sectionKey: '',
      contentType: ContentType.TEXT,
      contentValue: '',
      contentLabel: '',
      displayOrder: 0,
      isActive: true
    };
  }

  /**
   * Helper method for get image preview URL
   */
  private getImagePreviewUrl(filename: string): string {
    if (!filename) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    }
    
    // Full URL (http/https)
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    
    // if /content/ already in front, return immediately
    if (filename.startsWith('/content/')) {
      return filename;
    }
    
    // UUID pattern - file from backend upload
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    if (uuidPattern.test(filename)) {
      return `http://localhost:8083/uploads/${filename}`;
    }
    
    // Default: local file in /public/content/
    return `/content/${filename}`;
  }

  public getImageUrl(filename: string): string {
    return this.getImagePreviewUrl(filename);
  }
}
import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService, ProjectDTO, ProjectCategory } from '../../../service/project/project.service';
import { ToastService } from '../../../service/animations/toast.service';
import { HttpClient } from '@angular/common/http';

interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    filename: string;
    originalName: string;
    contentType: string;
    size: number;
  };
}

@Component({
  selector: 'app-project-manage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-manage.component.html',
  styleUrls: ['./project-manage.component.scss']
})
export class ProjectManageComponent implements OnInit {
  projects: ProjectDTO[] = [];
  loading = false;
  processing = false;
  uploading = false;
  showModal = false;
  isEditMode = false;

  previewImageUrl: string = '';
  uploadedFileName: string = '';
  technologiesInput: string = '';

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  dropdownStates: { [key: string]: boolean } = {
    category: false
  };

  categoryOptions = [
    { label: 'Web Development', value: ProjectCategory.WEB_DEVELOPMENT },
    { label: 'Mobile Application', value: ProjectCategory.MOBILE_APP },
    { label: 'UI/UX Design', value: ProjectCategory.UI_UX_DESIGN },
    { label: 'Digital Marketing', value: ProjectCategory.DIGITAL_MARKETING },
    { label: 'AI & Machine Learning', value: ProjectCategory.AI_ML },
    { label: 'Cloud Infrastructure', value: ProjectCategory.CLOUD_INFRASTRUCTURE },
    { label: 'Other', value: ProjectCategory.OTHER }
  ];

  formData: ProjectDTO = this.getEmptyFormData();

  constructor(
    private projectService: ProjectService,
    private toast: ToastService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadProjects();
  }

  get activeProjectCount(): number {
    return this.projects.filter(p => p.isActive).length;
  }

  get featuredProjectCount(): number {
    return this.projects.filter(p => p.isFeatured).length;
  }

  loadProjects() {
    this.loading = true;
    this.projectService.getAllProjectsForAdmin().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.projects = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.toast.error('Error!', 'Gagal memuat projects');
        this.loading = false;
      }
    });
  }

  openCreateModal() {
    this.isEditMode = false;
    this.formData = this.getEmptyFormData();
    this.previewImageUrl = '';
    this.uploadedFileName = '';
    this.technologiesInput = '';
    this.showModal = true;
  }

  openEditModal(project: ProjectDTO) {
    this.isEditMode = true;
    this.formData = { ...project };
    
    // Set preview image
    if (project.projectImage) {
      this.previewImageUrl = this.getImageUrl(project.projectImage);
    } else {
      this.previewImageUrl = '';
    }
    
    // Convert technologies array to comma-separated string
    if (project.projectTechnologies && project.projectTechnologies.length > 0) {
      this.technologiesInput = project.projectTechnologies.join(', ');
    } else {
      this.technologiesInput = '';
    }
    
    this.uploadedFileName = '';
    this.showModal = true;
  }

  closeModal() {
    Object.keys(this.dropdownStates).forEach(key => {
      this.dropdownStates[key] = false;
    });
    this.showModal = false;
    this.previewImageUrl = '';
    this.uploadedFileName = '';
    this.technologiesInput = '';
    this.formData = this.getEmptyFormData();
  }

  toggleDropdown(dropdown: string, event?: Event) {
    if (event) event.stopPropagation();
    Object.keys(this.dropdownStates).forEach(key => {
      if (key !== dropdown) this.dropdownStates[key] = false;
    });
    this.dropdownStates[dropdown] = !this.dropdownStates[dropdown];
  }

  selectCategory(value: ProjectCategory) {
    this.formData.projectCategory = value;
    this.dropdownStates['category'] = false;
  }

  getSelectedCategoryLabel(): string {
    const selected = this.categoryOptions.find(c => c.value === this.formData.projectCategory);
    return selected ? selected.label : 'Pilih Category';
  }

  getCategoryDisplayName(category: ProjectCategory): string {
    return this.projectService.getCategoryDisplayName(category);
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
    
    this.http.post<UploadResponse>('http://localhost:8083/api/admin/upload/image', formData).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.uploadedFileName = response.data.filename;
          this.formData.projectImage = response.data.filename;
          this.previewImageUrl = this.getImageUrl(response.data.filename);
          this.toast.success('Success!', 'Gambar berhasil diupload');
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
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
  }

  isFormValid(): boolean {
    return !!(
      this.formData.projectTitle?.trim() &&
      this.formData.projectCategory &&
      this.formData.displayOrder !== null &&
      this.formData.displayOrder !== undefined
    );
  }

  submitForm() {
    if (!this.isFormValid()) {
      this.toast.error('Error!', 'Mohon lengkapi field Title, Category, dan Display Order');
      return;
    }

    // Parse technologies from comma-separated input
    if (this.technologiesInput && this.technologiesInput.trim()) {
      this.formData.projectTechnologies = this.technologiesInput
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech.length > 0);
    } else {
      this.formData.projectTechnologies = [];
    }

    this.processing = true;

    const action = this.isEditMode && this.formData.idProject
      ? this.projectService.updateProject(this.formData.idProject, this.formData)
      : this.projectService.createProject(this.formData);

    action.subscribe({
      next: (response) => {
        this.toast.success('Success!', this.isEditMode ? 'Project berhasil diupdate' : 'Project berhasil dibuat');
        this.closeModal();
        this.loadProjects();
        this.processing = false;
      },
      error: (error) => {
        console.error('Save error:', error);
        this.toast.error('Error!', this.isEditMode ? 'Gagal mengupdate project' : 'Gagal membuat project');
        this.processing = false;
      }
    });
  }

  async toggleActive(project: ProjectDTO) {
    if (!project.idProject) return;

    const confirmed = await this.toast.helpConfirm(
      `${project.isActive ? 'Nonaktifkan' : 'Aktifkan'} project?`,
      `Project "<b>${project.projectTitle}</b>" akan ${project.isActive ? 'dinonaktifkan' : 'diaktifkan'}`
    );

    if (!confirmed) return;

    this.processing = true;
    this.projectService.toggleActive(project.idProject).subscribe({
      next: () => {
        this.toast.success('Success!', `Project berhasil ${project.isActive ? 'dinonaktifkan' : 'diaktifkan'}`);
        this.loadProjects();
        this.processing = false;
      },
      error: (error) => {
        this.toast.error('Error!', 'Gagal mengubah status');
        this.processing = false;
      }
    });
  }

  async toggleFeatured(project: ProjectDTO) {
    if (!project.idProject) return;

    const confirmed = await this.toast.helpConfirm(
      `${project.isFeatured ? 'Unfeature' : 'Feature'} project?`,
      `Project "<b>${project.projectTitle}</b>" akan ${project.isFeatured ? 'di-unfeature' : 'di-feature'}`
    );

    if (!confirmed) return;

    this.processing = true;
    this.projectService.toggleFeatured(project.idProject).subscribe({
      next: () => {
        this.toast.success('Success!', `Project berhasil ${project.isFeatured ? 'di-unfeature' : 'di-feature'}`);
        this.loadProjects();
        this.processing = false;
      },
      error: (error) => {
        this.toast.error('Error!', 'Gagal mengubah status featured');
        this.processing = false;
      }
    });
  }

  async deleteProject(project: ProjectDTO) {
    if (!project.idProject) return;

    const confirmed = await this.toast.helpConfirm(
      'Hapus project?',
      `Project "<b>${project.projectTitle}</b>" akan dihapus permanen dan tidak dapat dikembalikan`
    );

    if (!confirmed) return;

    this.processing = true;
    this.projectService.deleteProject(project.idProject).subscribe({
      next: () => {
        this.toast.success('Success!', 'Project berhasil dihapus');
        this.loadProjects();
        this.processing = false;
      },
      error: (error) => {
        this.toast.error('Error!', 'Gagal menghapus project');
        this.processing = false;
      }
    });
  }

  private getEmptyFormData(): ProjectDTO {
    return {
      projectTitle: '',
      projectDescription: '',
      projectCategory: ProjectCategory.WEB_DEVELOPMENT,
      projectImage: '',
      projectClient: '',
      projectYear: new Date().getFullYear(),
      projectTechnologies: [],
      projectUrl: '',
      isFeatured: false,
      displayOrder: 0,
      isActive: true
    };
  }

  getImageUrl(filename: string | undefined): string {
    if (!filename) return '';
    
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    
    if (filename.startsWith('/content/')) {
      return filename;
    }
    
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    if (uuidPattern.test(filename)) {
      return `http://localhost:8083/uploads/${filename}`;
    }
    
    return `/content/${filename}`;
  }
}
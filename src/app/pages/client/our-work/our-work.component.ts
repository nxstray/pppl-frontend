import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { ContentPageService, PageName } from '../../../service/admin/content-page.service';
import { ProjectService, ProjectDTO, ProjectCategory, ProjectSearchRequest, ProjectSearchResponse } from '../../../service/project/project.service';

@Component({
  selector: 'app-our-work',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './our-work.component.html',
  styleUrls: ['./our-work.component.scss'],
  animations: [
    trigger('fadeInUp', [
      state('hidden', style({ opacity: 0, transform: 'translateY(50px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('hidden => visible', animate('800ms ease-out'))
    ]),
    trigger('navbarSlide', [
      state('hidden', style({ transform: 'translateY(-100%)', opacity: 0 })),
      state('visible', style({ transform: 'translateY(0)', opacity: 1 })),
      transition('hidden <=> visible', animate('300ms ease-in-out'))
    ]),
    trigger('slideInLeft', [
      state('hidden', style({ opacity: 0, transform: 'translateX(-100px)' })),
      state('visible', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('hidden => visible', animate('1500ms ease-out'))
    ]),
    trigger('slideInRight', [
      state('hidden', style({ opacity: 0, transform: 'translateX(100px)' })),
      state('visible', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('hidden => visible', animate('1500ms ease-out'))
    ]),
    trigger('slideInUp', [
      state('hidden', style({ opacity: 0, transform: 'translateY(100px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('hidden => visible', animate('1000ms ease-out'))
    ])
  ]
})
export class OurWorkComponent implements OnInit {
  navbarVisible = true;
  private lastScrollTop = 0;
  private scrollThreshold = 100;

  contactVisible = false;
  buildingVisible = false;
  projectsVisible = false;

  sectionStates: { [id: string]: boolean } = {};

  // Dropdown states for custom dropdown
  dropdownStates: { [key: string]: boolean } = {
    category: false,
    year: false
  };

  // Project Data
  projects: ProjectDTO[] = [];
  loading = false;

  featuredProjects: ProjectDTO[] = [];
  featuredLoading = false;
  
  // Search & Filter
  searchQuery = '';
  selectedCategory: ProjectCategory | null = null;
  selectedYear: number | null = null;
  showFilterModal = false;
  
  filterOptions: {
    categories: { value: string; label: string }[];
    years: number[];
  } = {
    categories: [],
    years: []
  };
  
  // Pagination
  currentPage = 0;
  pageSize = 12;
  totalPages = 0;
  totalItems = 0;
  hasNext = false;
  hasPrevious = false;
  
  // Expose Math for template
  Math = Math;

  // Dynamic Content Variables
  
  // Hero Section
  heroTitle = 'Our Work';
  heroSubtitle = 'Discover Our Success Stories, Innovations, and Client Partnerships';
  heroVector = '/content/vector_logo_pandigi.webp';
  heroBuildingImage = '/content/building.webp';

  // Footer Section
  footerAddressLine1 = 'Jl. Perjuangan KP Cakung No. 44 RT/RW 004/004';
  footerAddressLine2 = 'Kel. Jatisari, Kec. Jatiasih, Kota Bekasi, Provinsi : Jawa Barat, kode pos : 17426';
  footerAddressLine3 = '0859 5944 1317 | ptpandawadigitalmandiri@gmail.com';
  footerLogo = '/content/logo-no-bg.webp';
  footerCopyright = '© 2026 PT Pandawa Digital Mandiri';

  constructor(
    private router: Router,
    private contentService: ContentPageService,
    private projectService: ProjectService
  ) { }

  ngOnInit() {
    this.loadPageContent();
    this.loadFilterOptions();
    this.loadFeaturedProjects();
    this.loadProjects();
    this.checkSectionsVisibility();
    setTimeout(() => {
      this.buildingVisible = true;
    }, 100);
  }

  // Dropdown Methods
  toggleDropdown(dropdown: string, event?: Event) {
    if (event) event.stopPropagation();
    Object.keys(this.dropdownStates).forEach(key => {
      if (key !== dropdown) this.dropdownStates[key] = false;
    });
    this.dropdownStates[dropdown] = !this.dropdownStates[dropdown];
  }

  selectCategory(value: string | null) {
    this.selectedCategory = value as ProjectCategory | null;
    this.dropdownStates['category'] = false;
  }

  selectYear(value: number | null) {
    this.selectedYear = value;
    this.dropdownStates['year'] = false;
  }

  @HostListener('document:click', ['$event'])
  closeDropdowns(event: Event) {
    Object.keys(this.dropdownStates).forEach(key => {
      this.dropdownStates[key] = false;
    });
  }

  // Proj
  loadProjects() {
    this.loading = true;
    
    const request: ProjectSearchRequest = {
      searchQuery: this.searchQuery || undefined,
      category: this.selectedCategory || undefined,
      year: this.selectedYear || undefined,
      page: this.currentPage,
      size: this.pageSize
    };
    
    this.projectService.searchProjects(request).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data as ProjectSearchResponse;
          this.projects = data.projects;
          this.currentPage = data.currentPage;
          this.totalPages = data.totalPages;
          this.totalItems = data.totalItems;
          this.hasNext = data.hasNext;
          this.hasPrevious = data.hasPrevious;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading projects:', err);
        this.loading = false;
      }
    });
  }

  loadFeaturedProjects() {
    this.featuredLoading = true;
    
    this.projectService.getFeaturedProjects().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.featuredProjects = response.data;
        }
        this.featuredLoading = false;
      },
      error: (err) => {
        console.error('Error loading featured projects:', err);
        this.featuredLoading = false;
      }
    });
  }
  
  loadFilterOptions() {
    this.projectService.getFilterOptions().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.filterOptions = response.data;
        }
      },
      error: (err) => {
        console.error('Error loading filter options:', err);
      }
    });
  }
  
  onSearch() {
    this.currentPage = 0;
    this.loadProjects();
  }
  
  clearSearch() {
    this.searchQuery = '';
    this.currentPage = 0;
    this.loadProjects();
  }
  
  toggleFilterModal() {
    this.showFilterModal = !this.showFilterModal;
    if (!this.showFilterModal) {
      // Close all dropdowns when modal closes
      Object.keys(this.dropdownStates).forEach(key => {
        this.dropdownStates[key] = false;
      });
    }
  }
  
  applyFilters() {
    this.currentPage = 0;
    this.loadProjects();
    this.showFilterModal = false;
    Object.keys(this.dropdownStates).forEach(key => {
      this.dropdownStates[key] = false;
    });
  }
  
  clearFilters() {
    this.selectedCategory = null;
    this.selectedYear = null;
    this.currentPage = 0;
    this.loadProjects();
    this.showFilterModal = false;
    Object.keys(this.dropdownStates).forEach(key => {
      this.dropdownStates[key] = false;
    });
  }
  
  get activeFiltersCount(): number {
    let count = 0;
    if (this.selectedCategory) count++;
    if (this.selectedYear) count++;
    return count;
  }
  
  // Pagination methods
  previousPage() {
    if (this.hasPrevious) {
      this.currentPage--;
      this.loadProjects();
      this.scrollToSection('projects');
    }
  }
  
  nextPage() {
    if (this.hasNext) {
      this.currentPage++;
      this.loadProjects();
      this.scrollToSection('projects');
    }
  }
  
  goToPage(page: number) {
    this.currentPage = page;
    this.loadProjects();
    this.scrollToSection('projects');
  }
  
  getCategoryName(category: ProjectCategory): string {
    return this.projectService.getCategoryDisplayName(category);
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

  // CMS Content Methods
  loadPageContent() {
    this.contentService.getPageContent(PageName.OUR_WORK).subscribe({
      next: (response) => {
        const content = response.content;
        
        this.heroTitle = content['hero_title'] || this.heroTitle;
        this.heroSubtitle = content['hero_subtitle'] || this.heroSubtitle;
        this.heroVector = this.getContentImageUrl(content['hero_vector']) || this.heroVector;
        this.heroBuildingImage = this.getContentImageUrl(content['hero_building_image']) || this.heroBuildingImage;
        
        // Footer Sections
        this.footerAddressLine1 = content['footer_address_line1'] || this.footerAddressLine1;
        this.footerAddressLine2 = content['footer_address_line2'] || this.footerAddressLine2;
        this.footerAddressLine3 = content['footer_address_line3'] || this.footerAddressLine3;
        this.footerLogo = this.getContentImageUrl(content['footer_logo']) || this.footerLogo;
        this.footerCopyright = content['footer_copyright'] || this.footerCopyright;
        
        console.log('Our Work CMS content loaded successfully');
      },
      error: (err) => {
        console.error('Error loading page content from CMS:', err);
      }
    });
  }
  
  private getContentImageUrl(filename: string | undefined): string {
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

  // Scroll and Animation Methods
  @HostListener('window:scroll')
  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (Math.abs(scrollTop - this.lastScrollTop) > this.scrollThreshold) {
      if (scrollTop > this.lastScrollTop && scrollTop > 200) {
        this.navbarVisible = false;
      } else {
        this.navbarVisible = true;
      }
      this.lastScrollTop = scrollTop;
    }

    this.checkSectionsVisibility();
  }

  private checkSectionsVisibility() {
    const ids = ['projects', 'contact'];
    ids.forEach(id => this.sectionStates[id] = this.isElementInViewport(id));

    this.projectsVisible = !!this.sectionStates['projects'];
    this.contactVisible = !!this.sectionStates['contact'];
  }

  private isElementInViewport(elementId: string): boolean {
    const element = document.getElementById(elementId);
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;

    return rect.top <= windowHeight * 0.75;
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  navigateToOtherPage(path: string) {
    this.router.navigate([path]);
  }
}
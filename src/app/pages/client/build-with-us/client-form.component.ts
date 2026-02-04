import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ClientFormService, ClientFormDTO, LayananOption } from '../../../service/client/client-form.service';
import { ContentPageService, PageName } from '../../../service/admin/content-page.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss'],
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
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class ClientFormComponent implements OnInit {
  navbarVisible = true;
  private lastScrollTop = 0;
  buildingVisible = false;

  // Dynamic Content Variables
  
  // Hero Section
  heroTitle = 'Request a Consultation Form';
  heroSubtitle = 'Let\'s Build Something Great Together';
  heroVector = '/content/vector_logo_pandigi.png';
  heroBuildingImage = '/content/building.png';

  // Form Section
  formSectionTitle = 'Lets get started';
  formSectionSubtitle = 'Build with us here';
  formSectionDescription = '';

  // Footer Section
  footerAddressLine1 = 'Jl. Perjuangan KP Cakung No. 44 RT/RW 004/004';
  footerAddressLine2 = 'Kel. Jatisari, Kec. Jatiasih, Kota Bekasi, Provinsi : Jawa Barat, kode pos : 17426';
  footerAddressLine3 = '0859 5944 1317 | ptpandawadigitalmandiri@gmail.com';
  footerCopyright = '© 2026 PT Pandawa Digital Mandiri';

  // Form Data
  formData: ClientFormDTO = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    idLayanan: 0,
    message: '',
    perusahaan: '',
    anggaran: '',
    waktuImplementasi: ''
  };

  // Form validation errors
  formErrors = {
    firstName: false,
    lastName: false,
    email: false,
    phoneNumber: false,
    idLayanan: false,
    message: false
  };

  // Dropdown Options
  layananOptions: LayananOption[] = [];
  anggaranOptions = [
    'Kurang dari 20 Juta',
    'Antara 20 - 50 Juta',
    'Lebih dari 50 Juta',
    'Belum tahu'
  ];
  waktuOptions = [
    'Kurang dari 1 bulan',
    'Antara 1 - 3 Bulan',
    'Lebih dari 3 Bulan',
    'Fleksibel'
  ];

  // UI States
  submitting = false;
  submitted = false;
  loadingLayanan = false;
  showError = false;
  errorMessage = '';

  // Dropdown States
  dropdownStates: { [key: string]: boolean } = {
    layanan: false,
    anggaran: false,
    waktuImplementasi: false
  };
  
  // Success data for display
  successData: {
    idRequest?: number;
    serviceName?: string;
  } = {};

  constructor(
    private clientFormService: ClientFormService,
    private contentService: ContentPageService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadPageContent();
    this.loadLayananOptions();
    setTimeout(() => {
      this.buildingVisible = true;
    }, 100);
  }

  /**
   * Load all dynamic content from CMS
   */
  loadPageContent() {
    this.contentService.getPageContent(PageName.BUILD_WITH_US).subscribe({
      next: (response) => {
        const content = response.content;
        
        // Hero Section
        this.heroTitle = content['hero_title'] || this.heroTitle;
        this.heroSubtitle = content['hero_subtitle'] || this.heroSubtitle;
        this.heroVector = this.getImageUrl(content['hero_vector']) || this.heroVector;
        this.heroBuildingImage = this.getImageUrl(content['hero_building_image']) || this.heroBuildingImage;
        
        // Form Section
        this.formSectionTitle = content['form_section_title'] || this.formSectionTitle;
        this.formSectionSubtitle = content['form_section_subtitle'] || this.formSectionSubtitle;
        this.formSectionDescription = content['form_section_description'] || this.formSectionDescription;
        
        // Footer Section
        this.footerAddressLine1 = content['footer_address_line1'] || this.footerAddressLine1;
        this.footerAddressLine2 = content['footer_address_line2'] || this.footerAddressLine2;
        this.footerAddressLine3 = content['footer_address_line3'] || this.footerAddressLine3;
        this.footerCopyright = content['footer_copyright'] || this.footerCopyright;
        
        console.log('Build With Us CMS content loaded successfully');
      },
      error: (err) => {
        console.error('Error loading page content from CMS:', err);
      }
    });
  }

  loadLayananOptions() {
    this.loadingLayanan = true;
    this.clientFormService.getLayananOptions().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.layananOptions = response.data;
        }
        this.loadingLayanan = false;
      },
      error: (error) => {
        console.error('Error loading layanan options:', error);
        this.showErrorMessage('Gagal memuat pilihan layanan. Silakan refresh halaman.');
        this.loadingLayanan = false;
      }
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (Math.abs(scrollTop - this.lastScrollTop) > 100) {
      if (scrollTop > this.lastScrollTop && scrollTop > 200) {
        this.navbarVisible = false;
      } else {
        this.navbarVisible = true;
      }
      this.lastScrollTop = scrollTop;
    }
  }

  /**
   * Helper method for get image URL
   */
  private getImageUrl(filename: string | undefined): string {
    if (!filename) return '';
    
    // Return full URL if already full path (http/https)
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    
    // If /content/ path already in front, return immediately
    if (filename.startsWith('/content/')) {
      return filename;
    }
    
    // Check if UUID (file form upload backend)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    if (uuidPattern.test(filename)) {
      // File uploaded ke backend, akses via backend URL
      return `http://localhost:8083/uploads/${filename}`;
    }
    
    // Default: files in /public/content/
    return `/content/${filename}`;
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

  toggleDropdown(dropdown: string, event?: Event) {
    if (event) event.stopPropagation();

    Object.keys(this.dropdownStates).forEach(key => {
      if (key !== dropdown) this.dropdownStates[key] = false;
    });

    this.dropdownStates[dropdown] = !this.dropdownStates[dropdown];
  }

  selectDropdownItem(type: string, value: any) {
    if (type === 'layanan') {
      this.formData.idLayanan = value.id;
    }

    if (type === 'anggaran') {
      this.formData.anggaran = value;
    }

    if (type === 'waktuImplementasi') {
      this.formData.waktuImplementasi = value;
    }

    this.dropdownStates[type] = false;
  }

  @HostListener('document:click')
  closeDropdowns() {
    Object.keys(this.dropdownStates).forEach(key => {
      this.dropdownStates[key] = false;
    });
  }

  validateForm(): boolean {
    this.formErrors = {
      firstName: false,
      lastName: false,
      email: false,
      phoneNumber: false,
      idLayanan: false,
      message: false
    };

    let isValid = true;

    if (!this.formData.firstName.trim()) {
      this.formErrors.firstName = true;
      isValid = false;
    }

    if (!this.formData.lastName.trim()) {
      this.formErrors.lastName = true;
      isValid = false;
    }

    if (!this.formData.email.trim()) {
      this.formErrors.email = true;
      isValid = false;
    } else if (!this.validateEmail(this.formData.email)) {
      this.formErrors.email = true;
      isValid = false;
    }

    if (!this.formData.phoneNumber.trim()) {
      this.formErrors.phoneNumber = true;
      isValid = false;
    }

    if (!this.formData.idLayanan || this.formData.idLayanan === 0) {
      this.formErrors.idLayanan = true;
      isValid = false;
    }

    if (!this.formData.message.trim()) {
      this.formErrors.message = true;
      isValid = false;
    }

    return isValid;
  }

  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  onSubmit() {
    if (!this.validateForm()) {
      this.showErrorMessage('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    this.submitting = true;

    this.clientFormService.submitForm(this.formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successData = {
            idRequest: response.data?.idRequest,
            serviceName: response.data?.serviceName
          };
          
          this.submitted = true;
          this.resetForm();

          setTimeout(() => {
            this.submitted = false;
          }, 8000);
        } else {
          this.showErrorMessage('Gagal mengirim form: ' + response.message);
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error submitting form:', error);
        const errorMsg = error.error?.message || 'Terjadi kesalahan pada server';
        this.showErrorMessage('Gagal mengirim form: ' + errorMsg);
        this.submitting = false;
      }
    });
  }

  resetForm() {
    this.formData = {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      idLayanan: 0,
      message: '',
      perusahaan: '',
      anggaran: '',
      waktuImplementasi: ''
    };
    
    this.formErrors = {
      firstName: false,
      lastName: false,
      email: false,
      phoneNumber: false,
      idLayanan: false,
      message: false
    };
  }

  showErrorMessage(message: string) {
    this.errorMessage = message;
    this.showError = true;
    
    setTimeout(() => {
      this.showError = false;
    }, 5000);
  }

  getLayananName(id: number): string {
    const layanan = this.layananOptions.find(l => l.id === id);
    return layanan ? layanan.name : '';
  }

  getSelectedLayananLabel(): string {
    const layanan = this.layananOptions.find(
      l => l.id === this.formData.idLayanan
    );
    return layanan ? layanan.name : 'Pilih Layanan';
  }

  getSelectedAnggaranLabel(): string {
    return this.formData.anggaran || 'Select budget range';
  }

  getSelectedWaktuLabel(): string {
    return this.formData.waktuImplementasi || 'Select timeline';
  }
}
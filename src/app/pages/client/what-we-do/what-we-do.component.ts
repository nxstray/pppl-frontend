import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ContentPageService, PageName } from '../../../service/admin/content-page.service';

@Component({
  selector: 'app-what-we-do',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './what-we-do.component.html',
  styleUrls: ['./what-we-do.component.scss'],
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
export class WhatWeDoComponent implements OnInit {
  navbarVisible = true;
  private lastScrollTop = 0;
  private scrollThreshold = 100;

  contactVisible = false;
  buildingVisible = false;
  servicesVisible = false;

  sectionStates: { [id: string]: boolean } = {};

  // Dynamic Content Variables
  
  // Hero Section
  heroTitle = 'What We Do';
  heroSubtitle = 'Discover our services and how we can help you achieve your goals.';
  heroVector = '/content/vector_logo_pandigi.webp';
  heroBuildingImage = '/content/building.webp';

  // Services Section
  whatWeOfferTitle = 'What we offer?';
  services: any[] = [];

  // Service Detail Sections
  serviceDetails: any[] = [];

  // Footer Section
  footerAddressLine1 = 'Jl. Perjuangan KP Cakung No. 44 RT/RW 004/004';
  footerAddressLine2 = 'Kel. Jatisari, Kec. Jatiasih, Kota Bekasi, Provinsi : Jawa Barat, kode pos : 17426';
  footerAddressLine3 = '0859 5944 1317 | ptpandawadigitalmandiri@gmail.com';
  footerLogo = '/content/logo-no-bg.webp';
  footerCopyright = '© 2026 PT Pandawa Digital Mandiri';

  constructor(
    private router: Router,
    private contentService: ContentPageService
  ) { }

  ngOnInit() {
    this.loadPageContent();
    this.checkSectionsVisibility();
    setTimeout(() => {
      this.buildingVisible = true;
    }, 100);
  }

  /**
   * Load all dynamic content from CMS
   */
  loadPageContent() {
    this.contentService.getPageContent(PageName.WHAT_WE_DO).subscribe({
      next: (response) => {
        const content = response.content;
        
        // Hero Section
        this.heroTitle = content['hero_title'] || this.heroTitle;
        this.heroSubtitle = content['hero_subtitle'] || this.heroSubtitle;
        this.heroVector = this.getImageUrl(content['hero_vector']) || this.heroVector;
        this.heroBuildingImage = this.getImageUrl(content['hero_building_image']) || this.heroBuildingImage;
        
        // Service Section
        this.whatWeOfferTitle = content['what_we_offer_title'] || this.whatWeOfferTitle;
        
        this.services = [
          {
            title: content['service_software_title'] || 'Software',
            code: content['service_software_code'] || '(46152)',
            description: content['service_software_description'] || 'Kami menyediakan solusi pengembangan perangkat lunak yang komprehensif.',
            icon: this.getImageUrl(content['service_software_icon']) || '/content/software-wwd.webp',
            sectionId: 'software'
          },
          {
            title: content['service_hardware_title'] || 'Hardware',
            code: content['service_hardware_code'] || '(46599)',
            description: content['service_hardware_description'] || 'Dari workstation hingga server, kami menyediakan infrastruktur berkualitas.',
            icon: this.getImageUrl(content['service_hardware_icon']) || '/content/hardware-wwd.webp',
            sectionId: 'hardware'
          },
          {
            title: content['service_multimedia_title'] || 'Multimedia',
            code: content['service_multimedia_code'] || '(61929)',
            description: content['service_multimedia_description'] || 'Solusi multimedia kreatif untuk meningkatkan kehadiran brand Anda.',
            icon: this.getImageUrl(content['service_multimedia_icon']) || '/content/media-wwd.webp',
            sectionId: 'multimedia'
          },
          {
            title: content['service_computer_title'] || 'Computer',
            code: content['service_computer_code'] || '(46511)',
            description: content['service_computer_description'] || 'Layanan pemeliharaan komputer profesional dan dukungan IT.',
            icon: this.getImageUrl(content['service_computer_icon']) || '/content/computer-wwd.webp',
            sectionId: 'computer'
          }
        ];

        // Service Detail Section
        this.serviceDetails = [
          {
            sectionId: 'software',
            title: content['detail_software_title'] || 'Software',
            description: content['detail_software_description'] || 'Kami menyediakan solusi pengembangan perangkat lunak yang komprehensif.',
            image: this.getImageUrl(content['detail_software_image']) || '/content/dummy-photo.webp'
          },
          {
            sectionId: 'hardware',
            title: content['detail_hardware_title'] || 'Hardware',
            description: content['detail_hardware_description'] || 'Dari workstation hingga server, kami menyediakan infrastruktur berkualitas.',
            image: this.getImageUrl(content['detail_hardware_image']) || '/content/dummy-photo.webp'
          },
          {
            sectionId: 'multimedia',
            title: content['detail_multimedia_title'] || 'Multimedia',
            description: content['detail_multimedia_description'] || 'Solusi multimedia kreatif untuk meningkatkan kehadiran brand Anda.',
            image: this.getImageUrl(content['detail_multimedia_image']) || '/content/dummy-photo.webp'
          },
          {
            sectionId: 'computer',
            title: content['detail_computer_title'] || 'Computer',
            description: content['detail_computer_description'] || 'Layanan pemeliharaan komputer profesional dan dukungan IT.',
            image: this.getImageUrl(content['detail_computer_image']) || '/content/dummy-photo.webp'
          }
        ];
        
        // Footer Section
        this.footerAddressLine1 = content['footer_address_line1'] || this.footerAddressLine1;
        this.footerAddressLine2 = content['footer_address_line2'] || this.footerAddressLine2;
        this.footerAddressLine3 = content['footer_address_line3'] || this.footerAddressLine3;
        this.footerLogo = this.getImageUrl(content['footer_logo']) || this.footerLogo;
        this.footerCopyright = content['footer_copyright'] || this.footerCopyright;
        
        console.log('What We Do CMS content loaded successfully');
      },
      error: (err) => {
        console.error('Error loading page content from CMS:', err);
      }
    });
  }

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
    const ids = ['services', 'contact', 'software', 'hardware', 'multimedia', 'computer'];
    ids.forEach(id => this.sectionStates[id] = this.isElementInViewport(id));

    this.servicesVisible = !!this.sectionStates['services'];
    this.contactVisible = !!this.sectionStates['contact'];
  }

  private isElementInViewport(elementId: string): boolean {
    const element = document.getElementById(elementId);
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;

    return rect.top <= windowHeight * 0.75;
  }

  /**
   * Helper method for get image URL
   */
  private getImageUrl(filename: string | undefined): string {
    if (!filename) return '';
    
    // Return full URL jika sudah lengkap (http/https)
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    
    // if /content/ already in front, return immediately
    if (filename.startsWith('/content/')) {
      return filename;
    }
    
    // Check if UUID (file from upload backend)
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
}
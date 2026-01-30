import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from "@angular/common";
import { ContentPageService, PageName } from '../../../service/content-page.service';

@Component({
  selector: 'app-what-we-do',
  imports: [CommonModule],
  templateUrl: './what-we-do.component.html',
  styleUrl: './what-we-do.component.scss',
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

  // ============ DYNAMIC CONTENT FROM CMS ============
  
  // Hero Section
  heroTitle = 'What We Do';
  heroSubtitle = 'Discover our services and how we can help you achieve your goals.';
  heroVector = 'vector_logo_pandigi.png';
  heroBuildingImage = 'building.png';

  // Services Section
  whatWeOfferTitle = 'What we offer?';
  services: any[] = [];

  // Service Detail Sections
  serviceDetails: any[] = [];

  // Contact Section
  contactTitle = 'Get in touch with us';
  contactPhone = { title: 'Phone', description: '' };
  contactEmail = { title: 'Email', description: '' };
  contactSocial = { title: 'Social', links: ['#', '#', '#'] };
  contactLogoImage = 'logo-text.png';

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
        
        // ============ HERO SECTION ============
        this.heroTitle = content['hero_title'] || this.heroTitle;
        this.heroSubtitle = content['hero_subtitle'] || this.heroSubtitle;
        this.heroVector = this.getImageUrl(content['hero_vector']) || this.heroVector;
        this.heroBuildingImage = this.getImageUrl(content['hero_building_image']) || this.heroBuildingImage;
        
        // ============ SERVICES SECTION ============
        this.whatWeOfferTitle = content['what_we_offer_title'] || this.whatWeOfferTitle;
        
        this.services = [
          {
            title: content['service_software_title'] || 'Software',
            code: content['service_software_code'] || '(46152)',
            description: content['service_software_description'] || 'Kami menyediakan solusi pengembangan perangkat lunak yang komprehensif.',
            icon: this.getImageUrl(content['service_software_icon']) || 'software-wwd.png',
            sectionId: 'software'
          },
          {
            title: content['service_hardware_title'] || 'Hardware',
            code: content['service_hardware_code'] || '(46599)',
            description: content['service_hardware_description'] || 'Dari workstation hingga server, kami menyediakan infrastruktur berkualitas.',
            icon: this.getImageUrl(content['service_hardware_icon']) || 'hardware-wwd.png',
            sectionId: 'hardware'
          },
          {
            title: content['service_multimedia_title'] || 'Multimedia',
            code: content['service_multimedia_code'] || '(61929)',
            description: content['service_multimedia_description'] || 'Solusi multimedia kreatif untuk meningkatkan kehadiran brand Anda.',
            icon: this.getImageUrl(content['service_multimedia_icon']) || 'media-wwd.png',
            sectionId: 'multimedia'
          },
          {
            title: content['service_computer_title'] || 'Computer',
            code: content['service_computer_code'] || '(46511)',
            description: content['service_computer_description'] || 'Layanan pemeliharaan komputer profesional dan dukungan IT.',
            icon: this.getImageUrl(content['service_computer_icon']) || 'computer-wwd.png',
            sectionId: 'computer'
          }
        ];

        // ============ SERVICE DETAIL SECTIONS ============
        this.serviceDetails = [
          {
            sectionId: 'software',
            title: content['detail_software_title'] || 'Software',
            description: content['detail_software_description'] || 'Kami menyediakan solusi pengembangan perangkat lunak yang komprehensif.',
            image: this.getImageUrl(content['detail_software_image']) || 'dummy-photo.png'
          },
          {
            sectionId: 'hardware',
            title: content['detail_hardware_title'] || 'Hardware',
            description: content['detail_hardware_description'] || 'Dari workstation hingga server, kami menyediakan infrastruktur berkualitas.',
            image: this.getImageUrl(content['detail_hardware_image']) || 'dummy-photo.png'
          },
          {
            sectionId: 'multimedia',
            title: content['detail_multimedia_title'] || 'Multimedia',
            description: content['detail_multimedia_description'] || 'Solusi multimedia kreatif untuk meningkatkan kehadiran brand Anda.',
            image: this.getImageUrl(content['detail_multimedia_image']) || 'dummy-photo.png'
          },
          {
            sectionId: 'computer',
            title: content['detail_computer_title'] || 'Computer',
            description: content['detail_computer_description'] || 'Layanan pemeliharaan komputer profesional dan dukungan IT.',
            image: this.getImageUrl(content['detail_computer_image']) || 'dummy-photo.png'
          }
        ];
        
        // ============ CONTACT SECTION ============
        this.contactTitle = content['contact_title'] || this.contactTitle;
        
        this.contactPhone = {
          title: content['contact_phone_title'] || 'Phone',
          description: content['contact_phone_description'] || '+62 21 1234 5678 - Tersedia Senin hingga Jumat'
        };
        
        this.contactEmail = {
          title: content['contact_email_title'] || 'Email',
          description: content['contact_email_description'] || 'info@pandawadigital.com - Kami akan merespons dalam 24 jam'
        };
        
        this.contactSocial = {
          title: content['contact_social_title'] || 'Social',
          links: [
            content['contact_social_link_1'] || '#',
            content['contact_social_link_2'] || '#',
            content['contact_social_link_3'] || '#'
          ]
        };
        
        this.contactLogoImage = this.getImageUrl(content['contact_logo_image']) || this.contactLogoImage;
        
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
   * Helper method untuk get image URL
   */
  private getImageUrl(filename: string | undefined): string {
    if (!filename) return '';
    
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    if (uuidPattern.test(filename)) {
      return `http://localhost:8083/uploads/${filename}`;
    }
    
    return `/${filename}`;
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
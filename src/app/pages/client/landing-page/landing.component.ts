import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ContentPageService, PageName } from '../../../service/content-page.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  animations: [
    trigger('fadeInUp', [
      state('hidden', style({
        opacity: 0,
        transform: 'translateY(50px)'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('hidden => visible', animate('800ms ease-out'))
    ]),
    trigger('navbarSlide', [
      state('hidden', style({
        transform: 'translateY(-100%)',
        opacity: 0
      })),
      state('visible', style({
        transform: 'translateY(0)',
        opacity: 1
      })),
      transition('hidden <=> visible', animate('300ms ease-in-out'))
    ])
  ]
})
export class LandingComponent implements OnInit {
  // Animation states
  navbarVisible = true;
  private lastScrollTop = 0;
  private scrollThreshold = 100;

  whatWeDoVisible = false;
  whoWeAreVisible = false;
  ourWorkVisible = false;
  contactVisible = false;

  // ============ DYNAMIC CONTENT FROM CMS ============
  
  // Hero Section
  heroTitle = 'Menyediakan Solusi Digital yang mendukung pertumbuhan dan Transformasi Bisnis';
  heroSubtitle = 'Solusi perangkat lunak, perangkat keras, dan pendampingan IT yang dirancang sesuai kebutuhan perusahaan.';
  heroCtaText = 'Build with us';
  heroBuildingImage = 'building.png';
  
  // What We Do Section
  whatWeDoTitle = 'What we do';
  services: any[] = [];
  
  // Who We Are Section
  whoWeAreTitle = 'Who we are';
  whoWeAreDescription = '';
  whoWeAreImages: string[] = ['dummy-photo.png', 'dummy-photo.png', 'dummy-photo.png'];
  
  // Our Work Section
  ourWorkTitle = 'Our work';
  portfolios: any[] = [];
  
  // Contact Section
  contactTitle = 'Get in touch with us';
  contactPhone = { title: 'Phone', description: '' };
  contactEmail = { title: 'Email', description: '' };
  contactSocial = { title: 'Social', links: ['#', '#', '#'] };
  contactLogoImage = 'logo-text.png';

  constructor(
    private router: Router,
    private contentService: ContentPageService
  ) {}

  ngOnInit() {
    this.loadPageContent();
    this.checkSectionsVisibility();
  }

  /**
   * Load all dynamic content from CMS
   */
  loadPageContent() {
    this.contentService.getPageContent(PageName.LANDING).subscribe({
      next: (response) => {
        const content = response.content;
        
        // ============ HERO SECTION ============
        this.heroTitle = content['hero_title'] || this.heroTitle;
        this.heroSubtitle = content['hero_subtitle'] || this.heroSubtitle;
        this.heroCtaText = content['hero_cta_text'] || this.heroCtaText;
        this.heroBuildingImage = this.getImageUrl(content['hero_building_image']) || this.heroBuildingImage;
        
        // ============ WHAT WE DO SECTION ============
        this.whatWeDoTitle = content['what_we_do_title'] || this.whatWeDoTitle;
        
        this.services = [
          {
            title: content['service_software_title'] || 'Software',
            description: content['service_software_description'] || 'Kami menyediakan solusi pengembangan perangkat lunak yang komprehensif.',
            icon: this.getImageUrl(content['service_software_icon']) || 'software-wwd.png'
          },
          {
            title: content['service_hardware_title'] || 'Hardware',
            description: content['service_hardware_description'] || 'Dari workstation hingga server, kami menyediakan infrastruktur berkualitas.',
            icon: this.getImageUrl(content['service_hardware_icon']) || 'hardware-wwd.png'
          },
          {
            title: content['service_multimedia_title'] || 'Multimedia',
            description: content['service_multimedia_description'] || 'Solusi multimedia kreatif untuk meningkatkan kehadiran brand Anda.',
            icon: this.getImageUrl(content['service_multimedia_icon']) || 'media-wwd.png'
          },
          {
            title: content['service_computer_title'] || 'Computer',
            description: content['service_computer_description'] || 'Layanan pemeliharaan komputer profesional dan dukungan IT.',
            icon: this.getImageUrl(content['service_computer_icon']) || 'computer-wwd.png'
          }
        ];
        
        // ============ WHO WE ARE SECTION ============
        this.whoWeAreTitle = content['who_we_are_title'] || this.whoWeAreTitle;
        this.whoWeAreDescription = content['who_we_are_description'] || 
          'PT. Pandawa Digital Mandiri adalah penyedia solusi teknologi terkemuka yang berkomitmen untuk memberikan layanan inovatif dan andal.';
        
        this.whoWeAreImages = [
          content['who_we_are_image_1'] || 'dummy-photo.png',
          content['who_we_are_image_2'] || 'dummy-photo.png',
          content['who_we_are_image_3'] || 'dummy-photo.png'
        ];
        
        // ============ OUR WORK SECTION ============
        this.ourWorkTitle = content['our_work_title'] || this.ourWorkTitle;
        
        this.portfolios = [
          {
            image: content['portfolio_1_image'] || 'dummy-photo.png',
            title: content['portfolio_1_title'] || 'E-Commerce Platform'
          },
          {
            image: content['portfolio_2_image'] || 'dummy-photo.png',
            title: content['portfolio_2_title'] || 'Corporate Website'
          },
          {
            image: content['portfolio_3_image'] || 'dummy-photo.png',
            title: content['portfolio_3_title'] || 'Mobile Application'
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
        
        this.contactLogoImage = content['contact_logo_image'] || this.contactLogoImage;
        
        console.log('CMS content loaded successfully');
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
    this.whatWeDoVisible = this.isElementInViewport('what-we-do');
    this.whoWeAreVisible = this.isElementInViewport('who-we-are');
    this.ourWorkVisible = this.isElementInViewport('our-work');
    this.contactVisible = this.isElementInViewport('contact');
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
    
    // Return full URL jika sudah lengkap
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    
    // Check if UUID (file dari upload - ada di backend)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    if (uuidPattern.test(filename)) {
      // File uploaded ke backend, akses via backend URL
      return `http://localhost:8083/uploads/${filename}`;
    }
    
    // Legacy files di frontend/public
    return `/${filename}`;
  }

  scrollToSection(sectionId: string) {
    if (sectionId === 'build-with-us') {
      this.router.navigate(['/build']);
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  navigateToOtherPage(pageId: string) {
    console.log(`Navigating to ${pageId} page`);
    this.router.navigate([`/${pageId}`]);
  }
}
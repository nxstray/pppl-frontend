import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ContentPageService, PageName } from '../../../service/admin/content-page.service';

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

  // Dynamic Content Variables
  
  // Hero Section
  heroTitle = 'Menyediakan Solusi Digital yang mendukung pertumbuhan dan Transformasi Bisnis';
  heroSubtitle = 'Solusi perangkat lunak, perangkat keras, dan pendampingan IT yang dirancang sesuai kebutuhan perusahaan.';
  heroCtaText = 'Build with us';
  heroBuildingImage = '/content/building.png';
  
  // What We Do Section
  whatWeDoTitle = 'What we do';
  services: any[] = [];
  
  // Who We Are Section
  whoWeAreTitle = 'Who we are';
  whoWeAreDescription = '';
  whoWeAreImages: string[] = ['/content/dummy-photo.png', '/content/dummy-photo.png', '/content/dummy-photo.png'];
  
  // Our Work Section
  ourWorkTitle = 'Our work';
  portfolios: any[] = [];

  // Footer Section
  footerAddressLine1 = 'Jl. Perjuangan KP Cakung No. 44 RT/RW 004/004';
  footerAddressLine2 = 'Kel. Jatisari, Kec. Jatiasih, Kota Bekasi, Provinsi : Jawa Barat, kode pos : 17426';
  footerAddressLine3 = '0859 5944 1317 | ptpandawadigitalmandiri@gmail.com';
  footerCopyright = '© 2026 PT Pandawa Digital Mandiri';

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
        
        // Hero Section
        this.heroTitle = content['hero_title'] || this.heroTitle;
        this.heroSubtitle = content['hero_subtitle'] || this.heroSubtitle;
        this.heroCtaText = content['hero_cta_text'] || this.heroCtaText;
        this.heroBuildingImage = this.getImageUrl(content['hero_building_image']) || this.heroBuildingImage;
        
        // What We Do Section
        this.whatWeDoTitle = content['what_we_do_title'] || this.whatWeDoTitle;
        
        this.services = [
          {
            title: content['service_software_title'] || 'Software',
            description: content['service_software_description'] || 'Kami menyediakan solusi pengembangan perangkat lunak yang komprehensif.',
            icon: this.getImageUrl(content['service_software_icon']) || '/content/software-wwd.png'
          },
          {
            title: content['service_hardware_title'] || 'Hardware',
            description: content['service_hardware_description'] || 'Dari workstation hingga server, kami menyediakan infrastruktur berkualitas.',
            icon: this.getImageUrl(content['service_hardware_icon']) || '/content/hardware-wwd.png'
          },
          {
            title: content['service_multimedia_title'] || 'Multimedia',
            description: content['service_multimedia_description'] || 'Solusi multimedia kreatif untuk meningkatkan kehadiran brand Anda.',
            icon: this.getImageUrl(content['service_multimedia_icon']) || '/content/media-wwd.png'
          },
          {
            title: content['service_computer_title'] || 'Computer',
            description: content['service_computer_description'] || 'Layanan pemeliharaan komputer profesional dan dukungan IT.',
            icon: this.getImageUrl(content['service_computer_icon']) || '/content/computer-wwd.png'
          }
        ];
        
        // Who We Are Section
        this.whoWeAreTitle = content['who_we_are_title'] || this.whoWeAreTitle;
        this.whoWeAreDescription = content['who_we_are_description'] || 
          'PT. Pandawa Digital Mandiri adalah penyedia solusi teknologi terkemuka yang berkomitmen untuk memberikan layanan inovatif dan andal.';
        
        this.whoWeAreImages = [
          this.getImageUrl(content['who_we_are_image_1']) || '/content/dummy-photo.png',
          this.getImageUrl(content['who_we_are_image_2']) || '/content/dummy-photo.png',
          this.getImageUrl(content['who_we_are_image_3']) || '/content/dummy-photo.png'
        ];
        
        // Our Work Section
        this.ourWorkTitle = content['our_work_title'] || this.ourWorkTitle;
        
        this.portfolios = [
          {
            image: this.getImageUrl(content['portfolio_1_image']) || '/content/dummy-photo.png',
            title: content['portfolio_1_title'] || 'E-Commerce Platform'
          },
          {
            image: this.getImageUrl(content['portfolio_2_image']) || '/content/dummy-photo.png',
            title: content['portfolio_2_title'] || 'Corporate Website'
          },
          {
            image: this.getImageUrl(content['portfolio_3_image']) || '/content/dummy-photo.png',
            title: content['portfolio_3_title'] || 'Mobile Application'
          }
        ];
        
        // Footer Section
        this.footerAddressLine1 = content['footer_address_line1'] || this.footerAddressLine1;
        this.footerAddressLine2 = content['footer_address_line2'] || this.footerAddressLine2;
        this.footerAddressLine3 = content['footer_address_line3'] || this.footerAddressLine3;
        this.footerCopyright = content['footer_copyright'] || this.footerCopyright;
        
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
      // File uploaded to backend, access via backend URL
      return `http://localhost:8083/uploads/${filename}`;
    }
    
    // Default: files in /public/content/
    return `/content/${filename}`;
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
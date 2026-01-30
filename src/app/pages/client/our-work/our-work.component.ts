import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from "@angular/common";
import { ContentPageService, PageName } from '../../../service/content-page.service';

@Component({
  selector: 'app-our-work',
  imports: [CommonModule],
  templateUrl: './our-work.component.html',
  styleUrl: './our-work.component.scss',
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

  sectionStates: { [id: string]: boolean } = {};

  // ============ DYNAMIC CONTENT FROM CMS ============
  
  // Hero Section
  heroTitle = 'Our Work';
  heroSubtitle = 'Discover Our Success Stories, Innovations, and Client Partnerships';
  heroVector = 'vector_logo_pandigi.png';
  heroBuildingImage = 'building.png';

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
    this.contentService.getPageContent(PageName.OUR_WORK).subscribe({
      next: (response) => {
        const content = response.content;
        
        // ============ HERO SECTION ============
        this.heroTitle = content['hero_title'] || this.heroTitle;
        this.heroSubtitle = content['hero_subtitle'] || this.heroSubtitle;
        this.heroVector = this.getImageUrl(content['hero_vector']) || this.heroVector;
        this.heroBuildingImage = this.getImageUrl(content['hero_building_image']) || this.heroBuildingImage;
        
        // ============ CONTACT SECTION ============
        this.contactTitle = content['contact_title'] || this.contactTitle;
        
        this.contactPhone = {
          title: content['contact_phone_title'] || 'Phone',
          description: content['contact_phone_description'] || '+62 21 1234 5678'
        };
        
        this.contactEmail = {
          title: content['contact_email_title'] || 'Email',
          description: content['contact_email_description'] || 'info@pandawadigital.com'
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
        
        console.log('Our Work CMS content loaded successfully');
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
    const ids = ['contact'];
    ids.forEach(id => this.sectionStates[id] = this.isElementInViewport(id));

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
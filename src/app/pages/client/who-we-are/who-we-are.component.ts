import { Component, HostListener, OnInit, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ContentPageService, PageName } from '../../../service/admin/content-page.service';

interface TimelineItem {
  date: string;
  title: string;
  description: string;
}

interface VisionAndMission {
  vision: string;
  mission: string[];
}

interface ServicesItem {
  title: string;
  description: string;
  image: string;
}

interface TeamMember {
  name: string;
  description: string;
  imageUrl: string;
}

interface ClientReview {
  imageUrl: string;
  description: string;
}

@Component({
  selector: 'app-who-we-are',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './who-we-are.component.html',
  styleUrls: ['./who-we-are.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
export class WhoWeAreComponent implements OnInit, AfterViewInit {
  navbarVisible = true;
  private lastScrollTop = 0;
  private scrollThreshold = 100;

  buildingVisible = false;
  timelineVisible = false;
  visionMissionVisible = false;
  servicesVisible = false;
  ourteamVisible = false;
  reviewsVisible = false;
  contactVisible = false;

  // ============ DYNAMIC CONTENT FROM CMS ============
  
  // Hero Section
  heroTitle = 'Who We Are';
  heroSubtitle = 'Discover Pandigi\'s Journey and Values';
  heroVector = '/content/vector_logo_pandigi.png';
  heroBuildingImage = '/content/building.png';

  // Timeline Section
  timelineTitle = 'Our Journey';
  timelineItems: TimelineItem[] = [];

  // Vision & Mission Section
  visionandmission: VisionAndMission = {
    vision: '',
    mission: []
  };

  // Services Section
  servicesTitle = 'Layanan Kami';
  servicesItems: ServicesItem[] = [];

  // Team Section
  teamTitle = 'Tim Kami';
  teamMembers: TeamMember[] = [];

  // Reviews Section
  reviewsTitle = 'Ulasan Client';
  clientReviews: ClientReview[] = [];

  // Contact Section
  contactTitle = 'Get in touch with us';
  contactPhone = { title: 'Phone', description: '' };
  contactEmail = { title: 'Email', description: '' };
  contactSocial = { title: 'Social', links: ['#', '#', '#'] };
  contactLogoImage = '/content/logo-text.png';

  @ViewChild('reviewSwiper') reviewSwiperRef!: ElementRef;

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
    this.contentService.getPageContent(PageName.WHO_WE_ARE).subscribe({
      next: (response) => {
        const content = response.content;
        
        // ============ HERO SECTION ============
        this.heroTitle = content['hero_title'] || this.heroTitle;
        this.heroSubtitle = content['hero_subtitle'] || this.heroSubtitle;
        this.heroVector = this.getImageUrl(content['hero_vector']) || this.heroVector;
        this.heroBuildingImage = this.getImageUrl(content['hero_building_image']) || this.heroBuildingImage;
        
        // ============ TIMELINE SECTION ============
        this.timelineTitle = content['timeline_title'] || this.timelineTitle;
        
        // Parse timeline items from JSON or build from individual fields
        if (content['timeline_items']) {
          try {
            this.timelineItems = JSON.parse(content['timeline_items']);
          } catch (e) {
            console.error('Error parsing timeline items:', e);
          }
        }
        
        // Fallback to individual timeline items if JSON parsing fails
        if (this.timelineItems.length === 0) {
          for (let i = 1; i <= 6; i++) {
            if (content[`timeline_${i}_date`]) {
              this.timelineItems.push({
                date: content[`timeline_${i}_date`],
                title: content[`timeline_${i}_title`] || '',
                description: content[`timeline_${i}_description`] || ''
              });
            }
          }
        }
        
        // ============ VISION & MISSION SECTION ============
        this.visionandmission.vision = content['vision_text'] || 'To be a global leader in digital innovation.';
        
        // Parse mission array
        if (content['mission_items']) {
          try {
            this.visionandmission.mission = JSON.parse(content['mission_items']);
          } catch (e) {
            console.error('Error parsing mission items:', e);
          }
        }
        
        // Fallback to individual mission items
        if (this.visionandmission.mission.length === 0) {
          for (let i = 1; i <= 4; i++) {
            if (content[`mission_${i}`]) {
              this.visionandmission.mission.push(content[`mission_${i}`]);
            }
          }
        }
        
        // ============ SERVICES SECTION ============
        this.servicesTitle = content['services_title'] || this.servicesTitle;
        
        this.servicesItems = [
          {
            title: content['service_software_title'] || 'Software',
            description: content['service_software_description'] || 'Solusi pengembangan perangkat lunak.',
            image: this.getImageUrl(content['service_software_image']) || '/content/dummy-photo.png'
          },
          {
            title: content['service_hardware_title'] || 'Hardware',
            description: content['service_hardware_description'] || 'Infrastruktur hardware berkualitas.',
            image: this.getImageUrl(content['service_hardware_image']) || '/content/dummy-photo.png'
          },
          {
            title: content['service_multimedia_title'] || 'Multimedia',
            description: content['service_multimedia_description'] || 'Solusi multimedia kreatif.',
            image: this.getImageUrl(content['service_multimedia_image']) || '/content/dummy-photo.png'
          },
          {
            title: content['service_computer_title'] || 'Computer',
            description: content['service_computer_description'] || 'Layanan pemeliharaan komputer.',
            image: this.getImageUrl(content['service_computer_image']) || '/content/dummy-photo.png'
          }
        ];
        
        // ============ TEAM SECTION ============
        this.teamTitle = content['team_title'] || this.teamTitle;
        
        this.teamMembers = [];
        for (let i = 1; i <= 4; i++) {
          if (content[`team_${i}_name`]) {
            this.teamMembers.push({
              name: content[`team_${i}_name`],
              description: content[`team_${i}_description`] || '',
              imageUrl: this.getImageUrl(content[`team_${i}_image`]) || '/content/dummy-photo.png'
            });
          }
        }
        
        // ============ REVIEWS SECTION ============
        this.reviewsTitle = content['reviews_title'] || this.reviewsTitle;
        
        this.clientReviews = [];
        for (let i = 1; i <= 4; i++) {
          if (content[`review_${i}_description`]) {
            this.clientReviews.push({
              imageUrl: this.getImageUrl(content[`review_${i}_image`]) || '/content/dummy-photo.png',
              description: content[`review_${i}_description`]
            });
          }
        }
        
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
        
        console.log('Who We Are CMS content loaded successfully');
      },
      error: (err) => {
        console.error('Error loading page content from CMS:', err);
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.reviewSwiperRef?.nativeElement) {
      const swiperEl = this.reviewSwiperRef.nativeElement;

      const params = {
        slidesPerView: 1,
        loop: true,
        spaceBetween: 30,
        navigation: {
          nextEl: '.custom-next-btn',
        },
        pagination: {
          el: '.custom-pagination',
          clickable: true,
          renderBullet: function (index: number, className: string) {
            return '<span class="' + className + '">' + (index + 1) + '</span>';
          },
        },
      };

      Object.assign(swiperEl, params);
      swiperEl.initialize();
    }
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
    this.timelineVisible = this.isElementInViewport('timeline');
    this.visionMissionVisible = this.isElementInViewport('vision-mission');
    this.servicesVisible = this.isElementInViewport('services');
    this.ourteamVisible = this.isElementInViewport('our-team');
    this.reviewsVisible = this.isElementInViewport('client-reviews');
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
    
    // Return full URL jika sudah lengkap (http/https)
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    
    // Jika sudah ada /content/ di depan, langsung return
    if (filename.startsWith('/content/')) {
      return filename;
    }
    
    // Check if UUID (file dari upload backend)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    if (uuidPattern.test(filename)) {
      // File uploaded ke backend, akses via backend URL
      return `http://localhost:8083/uploads/${filename}`;
    }
    
    // Default: files di /public/content/
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
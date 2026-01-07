import {
  Component, HostListener, OnInit, CUSTOM_ELEMENTS_SCHEMA,
  AfterViewInit, ViewChild, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

interface TimelineItem {
  date: string;
  title: string;
  description: string;
  icon?: string;
}

interface VisionAndMission {
  vision: string;
  mission: string[];
}

interface ServicesItems {
  title: string;
  code: string;
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
export class WhoWeAreComponent implements OnInit, AfterViewInit {
  navbarVisible = true;
  private lastScrollTop = 0;
  private scrollThreshold = 100;

  timelineVisible = false;
  visionMissionVisible = false;
  servicesVisible = false;
  ourteamVisible = false;
  reviewsVisible = false;
  contactVisible = false;

  heroTitle = 'Who We Are';
  heroSubtitle = 'Discover Pandigi\'s Journey and Values';
  heroVector = 'vector_logo_pandigi.png';

  timelineItems: TimelineItem[] = [
    {
      date: '2010',
      title: 'Company Founded',
      description: 'Pandigi was established with a vision to innovate in digital solutions.',
      icon: '🏢'
    },
    {
      date: '2012',
      title: 'First Major Project',
      description: 'Launched our flagship software product, revolutionizing the industry.',
      icon: '🚀'
    },
    {
      date: '2015',
      title: 'Expansion',
      description: 'Opened new offices and expanded our team to serve global clients.',
      icon: '🌍'
    },
    {
      date: '2018',
      title: 'Award Recognition',
      description: 'Received industry awards for excellence in technology and innovation.',
      icon: '🏆'
    },
    {
      date: '2021',
      title: 'Digital Transformation',
      description: 'Embraced cutting-edge technologies to enhance our services.',
      icon: '💡'
    },
    {
      date: '2023',
      title: 'Sustainability Initiative',
      description: 'Committed to eco-friendly practices and sustainable development.',
      icon: '🌱'
    }
  ];

  visionandmission: VisionAndMission = {
    vision: 'To be a global leader in digital innovation, empowering businesses and communities through cutting-edge technology solutions.',
    mission: [
      'Deliver high-quality digital products that meet the evolving needs of our clients.',
      'Foster a culture of innovation, collaboration, and continuous learning within our team.',
      'Promote sustainable practices in all aspects of our business operations.',
      'Build long-term partnerships with clients based on trust, transparency, and mutual success.'
    ]
  };

  servicesItems: ServicesItems[] = [
    {
      title: 'Software',
      code: '(46152)',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      image: 'dummy-photo.png'
    },
    {
      title: 'Hardware',
      code: '(46599)',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      image: 'dummy-photo.png'
    },
    {
      title: 'Multimedia',
      code: '(61929)',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      image: 'dummy-photo.png'
    },
    {
      title: 'Computer',
      code: '(46511)',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      image: 'dummy-photo.png'
    }
  ]

  teamMembers: TeamMember[] = [
    {
      name: 'Michael Doe',
      description: 'You can relay on our amazing features list and also our customer services will be great experience.',
      imageUrl: 'dummy-photo.png'
    },
    {
      name: 'Sarah Smith',
      description: 'You can relay on our amazing features list and also our customer services will be great experience.',
      imageUrl: 'dummy-photo.png'
    },
    {
      name: 'James Bond',
      description: 'You can relay on our amazing features list and also our customer services will be great experience.',
      imageUrl: 'dummy-photo.png'
    },
    {
      name: 'Emily Rose',
      description: 'You can relay on our amazing features list and also our customer services will be great experience.',
      imageUrl: 'dummy-photo.png'
    }
  ];

  @ViewChild('reviewSwiper') reviewSwiperRef!: ElementRef;
  clientReviews: ClientReview[] = [
    {
      imageUrl: 'dummy-photo.png',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    },
    {
      imageUrl: 'dummy-photo.png',
      description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
    },
    {
      imageUrl: 'dummy-photo.png',
      description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
    },
    {
      imageUrl: 'dummy-photo.png',
      description: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    },
  ];

  constructor(private router: Router) { }

  ngOnInit() { 
    this.checkSectionsVisibility();
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

    this.checkSectionsVisibility()
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

  scrollToSection(sectionId: string): void {
    console.log('Scrolling to section:', sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      console.log('Element found, scrolling to:', sectionId);
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.log('Element not found for section:', sectionId);
    }
  }

  navigateToOtherPage(path: string) {
    console.log(`Navigating to ${path} page`);
    this.router.navigate([path]);
  }
}

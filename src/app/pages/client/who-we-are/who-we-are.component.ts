import { Component, HostListener, OnInit, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

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
    ]),
    trigger('slideInLeft', [
      state('hidden', style({
        opacity: 0,
        transform: 'translateX(-100px)'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateX(0)'
      })),
      transition('hidden => visible', animate('1500ms ease-out'))
    ]),
    trigger('slideInRight', [
      state('hidden', style({
        opacity: 0,
        transform: 'translateX(100px)'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateX(0)'
      })),
      transition('hidden => visible', animate('1500ms ease-out'))
    ]),
    trigger('slideInUp', [
      state('hidden', style({
        opacity: 0,
        transform: 'translateY(100px)'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('hidden => visible', animate('1000ms ease-out'))
    ])
  ]
})
export class WhoWeAreComponent implements OnInit, AfterViewInit {
  @ViewChild('reviewSwiper') reviewSwiperRef!: ElementRef;
  
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

  constructor(private router: Router) { }

  ngOnInit() {
    this.checkSectionsVisibility();
    setTimeout(() => {
      this.buildingVisible = true;
    }, 100);
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

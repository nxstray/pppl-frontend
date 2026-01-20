import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

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
  navbarVisible = true;
  private lastScrollTop = 0;
  private scrollThreshold = 100;

  whatWeDoVisible = false;
  whoWeAreVisible = false;
  ourWorkVisible = false;
  contactVisible = false;

  services = [
    {
      title: 'Software',
      code: '(46152)',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      icon: 'software-wwd.png'
    },
    {
      title: 'Hardware',
      code: '(46599)',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      icon: 'hardware-wwd.png'
    },
    {
      title: 'Multimedia',
      code: '(61929)',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      icon: 'media-wwd.png'
    },
    {
      title: 'Computer',
      code: '(46511)',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      icon: 'computer-wwd.png'
    }
  ];

  portfolios = [
    { image: 'dummy-photo.png', title: 'Project 1' },
    { image: 'dummy-photo.png', title: 'Project 2' },
    { image: 'dummy-photo.png', title: 'Project 3' }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkSectionsVisibility();
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

  scrollToSection(sectionId: string) {
    // Jika section adalah 'build-with-us', navigate ke halaman form
    if (sectionId === 'build-with-us') {
      this.router.navigate(['/build']);
      return;
    }

    // Untuk section lainnya, scroll seperti biasa
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  navigateToOtherPage(pageId: string) {
    console.log(`Redirect to : ${pageId}`);
    this.router.navigate([`/${pageId}`]);
  }
}
import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from "@angular/common"

interface Service {
  image: string;
  description: string;
}

@Component({
  selector: 'app-what-we-do',
  imports: [CommonModule],
  templateUrl: './what-we-do.component.html',
  styleUrl: './what-we-do.component.scss',
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
      transition('hidden => visible', animate('1000ms ease-out'))
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
      transition('hidden => visible', animate('1000ms ease-out'))
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
export class WhatWeDoComponent implements OnInit {
  navbarVisible = true;
  private lastScrollTop = 0;
  private scrollThreshold = 100;

  contactVisible = false;
  buildingVisible = false;
  servicesVisible = false;

  heroTitle = 'What We Do';
  heroSubtitle = 'Discover our services and how we can help you achieve your goals.';
  heroVector = 'vector_logo_pandigi.png';

  services = [
    {
      title: 'Software',
      code: '(46152)',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      icon: 'software-wwd.png',
      sectionId: 'software'
    },
    {
      title: 'Hardware',
      code: '(46599)',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      icon: 'hardware-wwd.png',
      sectionId: 'hardware',
    },
    {
      title: 'Multimedia',
      code: '(61929)',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      icon: 'media-wwd.png',
      sectionId: 'multimedia',
    },
    {
      title: 'Computer',
      code: '(46511)',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      icon: 'computer-wwd.png',
      sectionId: 'computer',
    }
  ];

  constructor(private router: Router) { }

  ngOnInit() {
    this.checkSectionsVisibility();
    setTimeout(() => {
      this.buildingVisible = true;
    }, 100);
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
    this.servicesVisible = this.isElementInViewport('services');
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

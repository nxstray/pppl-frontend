import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-what-we-do',
  imports: [],
  templateUrl: './what-we-do.component.html',
  styleUrl: './what-we-do.component.scss',
  animations: [
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
export class WhatWeDoComponent implements OnInit {
  navbarVisible = true;
  private lastScrollTop = 0;
  private scrollThreshold = 100;

  heroTitle = 'What We Do';
  heroSubtitle = 'Discover our services and how we can help you achieve your goals.';
  heroVector = 'vector_logo_pandigi.png';

  constructor(private router: Router) { }
  
  ngOnInit() { }

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

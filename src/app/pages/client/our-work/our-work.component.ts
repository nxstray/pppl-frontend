import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-our-work',
  imports: [CommonModule],
  templateUrl: './our-work.component.html',
  styleUrl: './our-work.component.scss',
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
export class OurWorkComponent implements OnInit {
  navbarVisible = true;
  private lastScrollTop = 0;
  private scrollThreshold = 100;

  contactVisible = false;
  buildingVisible = false;

  sectionStates: { [id: string]: boolean } = {};

  heroTitle = 'Our Work';
  heroSubtitle = 'Discover Our Success Stories, Innovations, and Client Partnerships';
  heroVector = 'vector_logo_pandigi.png';

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

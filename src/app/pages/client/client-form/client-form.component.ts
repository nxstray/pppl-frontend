import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ClientFormService, ClientFormDTO, LayananOption } from '../../../service/client-form.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss'],
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
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class ClientFormComponent implements OnInit {
  navbarVisible = true;
  private lastScrollTop = 0;
  buildingVisible = false;

  // Form Data
  formData: ClientFormDTO = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    idLayanan: 0,
    message: '',
    perusahaan: '',
    anggaran: '',
    waktuImplementasi: ''
  };

  // Form validation errors
  formErrors = {
    firstName: false,
    lastName: false,
    email: false,
    phoneNumber: false,
    idLayanan: false,
    message: false
  };

  // Dropdown Options
  layananOptions: LayananOption[] = [];

  // UI States
  submitting = false;
  submitted = false;
  loadingLayanan = false;
  showError = false;
  errorMessage = '';
  
  // Success data for display
  successData: {
    idRequest?: number;
    serviceName?: string;
  } = {};

  constructor(
    private clientFormService: ClientFormService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadLayananOptions();
    setTimeout(() => {
      this.buildingVisible = true;
    }, 100);
  }

  loadLayananOptions() {
    this.loadingLayanan = true;
    this.clientFormService.getLayananOptions().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.layananOptions = response.data;
        }
        this.loadingLayanan = false;
      },
      error: (error) => {
        console.error('Error loading layanan options:', error);
        this.showErrorMessage('Gagal memuat pilihan layanan. Silakan refresh halaman.');
        this.loadingLayanan = false;
      }
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (Math.abs(scrollTop - this.lastScrollTop) > 100) {
      if (scrollTop > this.lastScrollTop && scrollTop > 200) {
        this.navbarVisible = false;
      } else {
        this.navbarVisible = true;
      }
      this.lastScrollTop = scrollTop;
    }
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

  validateForm(): boolean {
    // Reset errors
    this.formErrors = {
      firstName: false,
      lastName: false,
      email: false,
      phoneNumber: false,
      idLayanan: false,
      message: false
    };

    let isValid = true;

    if (!this.formData.firstName.trim()) {
      this.formErrors.firstName = true;
      isValid = false;
    }

    if (!this.formData.lastName.trim()) {
      this.formErrors.lastName = true;
      isValid = false;
    }

    if (!this.formData.email.trim()) {
      this.formErrors.email = true;
      isValid = false;
    } else if (!this.validateEmail(this.formData.email)) {
      this.formErrors.email = true;
      isValid = false;
    }

    if (!this.formData.phoneNumber.trim()) {
      this.formErrors.phoneNumber = true;
      isValid = false;
    }

    if (!this.formData.idLayanan || this.formData.idLayanan === 0) {
      this.formErrors.idLayanan = true;
      isValid = false;
    }

    if (!this.formData.message.trim()) {
      this.formErrors.message = true;
      isValid = false;
    }

    return isValid;
  }

  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  onSubmit() {
    if (!this.validateForm()) {
      this.showErrorMessage('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    this.submitting = true;

    this.clientFormService.submitForm(this.formData).subscribe({
      next: (response) => {
        if (response.success) {
          // Store success data for display
          this.successData = {
            idRequest: response.data?.idRequest,
            serviceName: response.data?.serviceName
          };
          
          this.submitted = true;
          this.resetForm();

          // Auto hide success message after 8 seconds
          setTimeout(() => {
            this.submitted = false;
          }, 8000);
        } else {
          this.showErrorMessage('Gagal mengirim form: ' + response.message);
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error submitting form:', error);
        const errorMsg = error.error?.message || 'Terjadi kesalahan pada server';
        this.showErrorMessage('Gagal mengirim form: ' + errorMsg);
        this.submitting = false;
      }
    });
  }

  resetForm() {
    this.formData = {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      idLayanan: 0,
      message: '',
      perusahaan: '',
      anggaran: '',
      waktuImplementasi: ''
    };
    
    this.formErrors = {
      firstName: false,
      lastName: false,
      email: false,
      phoneNumber: false,
      idLayanan: false,
      message: false
    };
  }

  showErrorMessage(message: string) {
    this.errorMessage = message;
    this.showError = true;
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      this.showError = false;
    }, 5000);
  }

  getLayananName(id: number): string {
    const layanan = this.layananOptions.find(l => l.id === id);
    return layanan ? layanan.name : '';
  }
}
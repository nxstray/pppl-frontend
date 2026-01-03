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
    trigger('navbarSlide', [
      state('hidden', style({
        transform: 'translateY(-150%)',
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
export class ClientFormComponent implements OnInit {
  navbarVisible = true;
  private lastScrollTop = 0;

  heroTitle = 'Request a Consultation Form';
  heroSubtitle = 'Let\'s Build Something Great Together';
  heroVector = 'vector_logo_pandigi.png';
  
  // Form Data - sesuaikan dengan DTO backend
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

  // Dropdown Options - load dari backend
  layananOptions: LayananOption[] = [];
  
  anggaranOptions = [
    'Kurang dari 20 Juta',
    'Antara 20 - 50 Juta',
    'Lebih dari 50 Juta',
    'Belum tahu'
  ];
  
  waktuOptions = [
    'Kurang dari 1 bulan',
    'Antara 1 - 3 Bulan',
    'Lebih dari 3 Bulan',
    'Fleksibel'
  ];

  // UI States
  submitting = false;
  submitted = false;
  loadingLayanan = false;

  constructor(
    private clientFormService: ClientFormService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadLayananOptions();
  }

  /**
   * Load layanan options dari backend
   */
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
        alert('Gagal memuat pilihan layanan. Silakan refresh halaman.');
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

    // Check required fields
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

    // FIXED: validasi idLayanan
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
      alert('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    this.submitting = true;

    this.clientFormService.submitForm(this.formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.submitted = true;
          
          // Show success message dengan info
          const data = response.data;
          if (data) {
            alert(`${response.message}\n\nID Request: #${data.idRequest}\nLayanan: ${data.serviceName}\n\nTim kami akan segera menghubungi Anda!`);
          } else {
            alert(`${response.message}`);
          }
          
          this.resetForm();
          
          // Auto hide success message after 5 seconds
          setTimeout(() => {
            this.submitted = false;
          }, 5000);
          
          // Optional: redirect ke landing page
          // this.router.navigate(['/']);
        } else {
          alert('❌ Gagal mengirim form: ' + response.message);
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error submitting form:', error);
        const errorMessage = error.error?.message || 'Terjadi kesalahan pada server';
        alert('❌ Gagal mengirim form: ' + errorMessage);
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
  }

  /**
   * Helper untuk display nama layanan berdasarkan ID
   */
  getLayananName(id: number): string {
    const layanan = this.layananOptions.find(l => l.id === id);
    return layanan ? layanan.name : '';
  }
}
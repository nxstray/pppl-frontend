import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from '../../../app/service/animations/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription?: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription = this.toastService.toast$.subscribe(toast => {
      this.addToast(toast);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  private addToast(toast: Toast) {
    this.toasts.push(toast);

    // Auto remove after duration
    if (toast.duration) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, toast.duration);
    }
  }

  removeToast(id: number) {
    const toast = this.toasts.find(t => t.id === id);
    if (!toast) return;

    toast.closing = true;

    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, 300);
  }

  getIconContent(type: string): string {
    switch (type) {
      case 'help': return '?';
      case 'success': return '✓';
      case 'warning': return '!';
      case 'error': return '×';
      default: return '?';
    }
  }

  confirmToast(toast: Toast, result: boolean) {
    toast.resolve?.(result);
    this.removeToast(toast.id);
  }

  acceptConfirm(toast: Toast, result: boolean, event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();

    toast.resolve?.(result);
    this.removeToast(toast.id);
  }

  cancelConfirm(toast: Toast, result: boolean, event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();

    toast.resolve?.(result);
    this.removeToast(toast.id);
  }
}
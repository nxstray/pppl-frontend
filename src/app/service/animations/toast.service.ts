import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  id: number;
  type: 'help' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;

  confirm?: boolean;
  resolve?: (value: boolean) => void;

  closing?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<Toast>();
  public toast$ = this.toastSubject.asObservable();
  
  private toastId = 0;

  /**
   * Show help toast
   */
  help(title: string, message: string, duration: number = 5000) {
    this.show('help', title, message, duration);
  }

  /**
   * Show success toast
   */
  success(title: string, message: string, duration: number = 7000) {
    this.show('success', title, message, duration);
  }

  /**
   * Show warning toast
   */
  warning(title: string, message: string, duration: number = 5000) {
    this.show('warning', title, message, duration);
  }

  /**
   * Show error toast
   */
  error(title: string, message: string, duration: number = 6000) {
    this.show('error', title, message, duration);
  }

  /**
   * Show confirmation dialog (returns promise)
   */
  helpConfirm(title: string, message: string): Promise<boolean> {
    return new Promise((resolve) => {
      const toast: Toast = {
        id: ++this.toastId,
        type: 'help',
        title,
        message,
        confirm: true,
        resolve
      };

      this.toastSubject.next(toast);
    });
  }

  /**
   * Internal show method
   */
  private show(type: Toast['type'], title: string, message: string, duration: number) {
    const toast: Toast = {
      id: ++this.toastId,
      type,
      title,
      message,
      duration
    };
    
    this.toastSubject.next(toast);
  }
}
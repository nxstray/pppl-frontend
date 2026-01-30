import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BellService, NotificationDTO } from '../../../app/service/animations/bell.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bell.component.html',
  styleUrls: ['./bell.component.scss']
})
export class BellComponent implements OnDestroy {

  showPanel = false;
  notifications: NotificationDTO[] = [];
  unreadCount = 0;

  private sub!: Subscription;

  constructor(
    private bellService: BellService,
    private router: Router
  ) {
    this.sub = this.bellService.notifications$.subscribe(list => {
      this.notifications = list;
      this.unreadCount = list.filter(n => !n.isRead).length;
    });
  }

  togglePanel(): void {
    this.showPanel = !this.showPanel;
  }

  onNotificationClick(n: NotificationDTO): void {
    if (!n.isRead && n.idNotification) {
      this.bellService.markAsRead(n.idNotification).subscribe();
      this.bellService.updateLocalAsRead(n.idNotification);
    }

    if (n.link) {
      this.router.navigate([n.link]);
      this.showPanel = false;
    }
  }

  deleteNotification(e: Event, n: NotificationDTO): void {
    e.stopPropagation();
    if (!n.idNotification) return;

    this.bellService.deleteNotification(n.idNotification).subscribe();
    this.bellService.removeLocal(n.idNotification);
  }

  markAllAsRead(): void {
    this.bellService.markAllAsRead().subscribe();
    this.bellService.updateLocalAllRead();
  }

  // UI helpers methods
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'NEW_CLIENT': return '';
      case 'PENDING_VERIFICATION': return '';
      case 'MEETING_REMINDER': return '';
      default: return '';
    }
  }

  getRelativeTime(date: Date): string {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Baru saja';
    if (mins < 60) return `${mins} menit yang lalu`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} jam yang lalu`;
    return `${Math.floor(hrs / 24)} hari yang lalu`;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}

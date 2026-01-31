import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { NgZone } from '@angular/core';

export interface NotificationDTO {
  idNotification?: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

@Injectable({ providedIn: 'root' })
export class BellService implements OnDestroy {

  private apiUrl = `${environment.apiUrl}/admin/notifications`;

  private stompClient!: Client;

  // Single source of truth
  private notificationsSubject =
    new BehaviorSubject<NotificationDTO[]>([]);

  notifications$ = this.notificationsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private ngZone: NgZone
  ) {
    this.loadInitialNotifications();
    this.initWebSocket();
  }

  /**
   * Initial Load Notifications
   */
  private loadInitialNotifications(): void {
    this.http
      .get<ApiResponse<NotificationDTO[]>>(`${this.apiUrl}/recent`)
      .subscribe(res => {
        if (res.success && res.data) {
          this.notificationsSubject.next(res.data);
        }
      });
  }

  /**
   * WebSocket Initialization
   */
  private initWebSocket(): void {
    // Get WebSocket URL from environment
    const wsBaseUrl = environment.apiUrl.replace('/api', '');
    const wsUrl = `${wsBaseUrl}/ws`;
    
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      debug: (msg) => console.log('[STOMP]', msg)
    });

    this.stompClient.onConnect = () => {
      console.log('STOMP CONNECTED');

      this.stompClient.subscribe('/topic/admin/notifications', (msg: IMessage) => {
        console.log('WS MESSAGE RECEIVED:', msg.body);

        this.ngZone.run(() => {
          const notif: NotificationDTO = JSON.parse(msg.body);
          console.log('PARSED NOTIF:', notif);

          const current = this.notificationsSubject.value;
          this.notificationsSubject.next([notif, ...current]);
        });
      });
    };
        
    this.stompClient.activate();
  }

  /**
   * State mutations
   */
  markAsRead(id: number): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/read-all`, {});
  }

  deleteNotification(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${id}`);
  }

  updateLocalAsRead(id: number) {
    this.notificationsSubject.next(
      this.notificationsSubject.value.map(n =>
        n.idNotification === id ? { ...n, isRead: true } : n
      )
    );
  }

  updateLocalAllRead() {
    this.notificationsSubject.next(
      this.notificationsSubject.value.map(n => ({ ...n, isRead: true }))
    );
  }

  removeLocal(id: number) {
    this.notificationsSubject.next(
      this.notificationsSubject.value.filter(n => n.idNotification !== id)
    );
  }

  ngOnDestroy(): void {
    if (this.stompClient?.active) {
      this.stompClient.deactivate();
    }
  }
}
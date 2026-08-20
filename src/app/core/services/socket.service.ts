import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

export interface Notification {
  event: string;
  data: any;
  time: Date;
}

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;
  readonly connected = signal(false);
  readonly notifications = signal<Notification[]>([]);

  connect(): void {
    if (this.socket?.connected) return;
    const url = environment.apiUrl.replace('/api/v1/', '');
    this.socket = io(url, { transports: ['websocket'] });
    this.socket.on('connect', () => this.connected.set(true));
    this.socket.on('disconnect', () => this.connected.set(false));
    this.socket.on('order:updated', (data) => this.addNotification('order:updated', data));
    this.socket.on('order:created', (data) => this.addNotification('order:created', data));
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.connected.set(false);
  }

  private addNotification(event: string, data: any): void {
    this.notifications.update((n) => [{ event, data, time: new Date() }, ...n].slice(0, 50));
  }

  clearNotifications(): void {
    this.notifications.set([]);
  }
}

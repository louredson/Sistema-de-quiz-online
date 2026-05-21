import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: number;
  kind: ToastKind;
  title: string;
  message: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly items = signal<ToastItem[]>([]);
  private nextId = 1;

  show(kind: ToastKind, title: string, message: string, duration = 3600) {
    const toast: ToastItem = {
      id: this.nextId++,
      kind,
      title,
      message,
      duration
    };

    this.items.update((items) => [...items, toast]);
    setTimeout(() => this.dismiss(toast.id), duration);
  }

  success(title: string, message: string) {
    this.show('success', title, message);
  }

  error(title: string, message: string) {
    this.show('error', title, message, 4200);
  }

  info(title: string, message: string) {
    this.show('info', title, message);
  }

  warning(title: string, message: string) {
    this.show('warning', title, message);
  }

  dismiss(id: number) {
    this.items.update((items) => items.filter((item) => item.id !== id));
  }
}

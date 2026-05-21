import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-toast-viewport',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="toast-stack" aria-live="polite" aria-label="Notificacoes">
      <article class="toast" *ngFor="let item of toast.items()" [class]="'toast toast-' + item.kind">
        <div class="toast-accent"></div>
        <div class="toast-copy">
          <strong>{{ item.title }}</strong>
          <span>{{ item.message }}</span>
          <div class="toast-progress" [style.animationDuration.ms]="item.duration"></div>
        </div>
        <button class="toast-close" (click)="toastService.dismiss(item.id)" type="button">x</button>
      </article>
    </section>
  `
})
export class ToastViewportComponent {
  readonly toastService = inject(ToastService);
  readonly toast = this.toastService;
}

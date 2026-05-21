import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { SessionService } from '../core/session.service';
import { ToastService } from '../core/toast.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="auth-shell page-enter">
      <div class="auth-frame">
        <article class="auth-hero hero-card">
          <span class="inline-tag">Admin control</span>
          <h1 class="hero-title">Gestao completa da plataforma.</h1>
          <p class="hero-copy">Acesso reservado para controlo de utilizadores, quizzes e governanca da plataforma.</p>
          <ul class="feature-list">
            <li>Vista consolidada de contas e quizzes.</li>
            <li>Separacao clara entre utilizador e administrador.</li>
            <li>Autenticacao isolada para area sensivel.</li>
          </ul>
        </article>

        <article class="auth-panel">
          <span class="eyebrow">Administrador</span>
          <h2>Entrar como admin</h2>
          <form (ngSubmit)="login()">
            <div>
              <label class="field-label">Email do admin</label>
              <input [(ngModel)]="email" name="email" placeholder="admin@quizverse.com">
            </div>
            <div>
              <label class="field-label">Password</label>
              <input [(ngModel)]="password" name="password" type="password" placeholder="Password segura">
            </div>
            <button class="primary-button" type="submit">Entrar no painel</button>
            <p class="error-text" *ngIf="error">{{ error }}</p>
          </form>
          <div class="form-links">
            <a routerLink="/login">Area do utilizador</a>
            <a routerLink="/forgot-password">Recuperar senha</a>
          </div>
        </article>
      </div>
    </section>
  `
})
export class AdminLoginPageComponent {
  email = 'admin@quiz.com';
  password = 'admin123';
  error = '';
  private readonly api = inject(ApiService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  login() {
    this.api.adminLogin({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.session.setSession(response.token, response.user);
        this.toast.success('Admin autenticado', 'Painel administrativo desbloqueado.');
        this.router.navigateByUrl('/admin');
      },
      error: (e) => {
        this.error = e.error?.message || 'Erro ao entrar como admin';
        this.toast.error('Acesso negado', this.error);
      }
    });
  }
}
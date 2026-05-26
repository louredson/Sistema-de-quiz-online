import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { SessionService } from '../core/session.service';
import { ToastService } from '../core/toast.service';
import { UiService } from '../core/ui.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="auth-shell page-enter">
      <div class="auth-frame">
        <article class="auth-hero hero-card">
          <a routerLink="/" class="auth-brand-link">
            <span class="brand-mark"><img src="assets/favicon.svg" alt="QuizVerse"></span>
            <span class="brand-copy">
              <strong>QuizVerse</strong>
              <span>{{ ui.t('Voltar ao inicio', 'Back to home') }}</span>
            </span>
          </a>
          <span class="inline-tag">{{ ui.t('Controlo administrativo', 'Admin control') }}</span>
          <h1 class="hero-title">{{ ui.t('Gestao completa da plataforma.', 'Full platform management.') }}</h1>
          <p class="hero-copy">{{ ui.t('Acesso reservado para controlo de utilizadores, quizzes e governanca da plataforma.', 'Restricted access for managing users, quizzes, and platform governance.') }}</p>
          <ul class="feature-list">
            <li>{{ ui.t('Vista consolidada de contas e quizzes.', 'Consolidated view of accounts and quizzes.') }}</li>
            <li>{{ ui.t('Separacao clara entre utilizador e administrador.', 'Clear separation between user and administrator.') }}</li>
            <li>{{ ui.t('Autenticacao isolada para area sensivel.', 'Isolated authentication for the sensitive area.') }}</li>
          </ul>
        </article>

        <article class="auth-panel">
          <a routerLink="/" class="auth-brand-link">
            <span class="brand-mark"><img src="assets/favicon.svg" alt="QuizVerse"></span>
            <span class="brand-copy">
              <strong>QuizVerse</strong>
              <span>{{ ui.t('Pagina inicial', 'Home page') }}</span>
            </span>
          </a>
          <span class="eyebrow">{{ ui.t('Administrador', 'Administrator') }}</span>
          <h2>{{ ui.t('Entrar como admin', 'Sign in as admin') }}</h2>
          <form (ngSubmit)="login()">
            <div>
              <label class="field-label">{{ ui.t('Email do admin', 'Admin email') }}</label>
              <input [(ngModel)]="email" name="email" placeholder="admin@quizverse.com">
            </div>
            <div class="password-field">
              <label class="field-label">{{ ui.t('Password', 'Password') }}</label>
              <input [(ngModel)]="password" name="password" [type]="showPassword ? 'text' : 'password'" [placeholder]="ui.t('Password segura', 'Secure password')">
              <button class="eye-button" type="button" (click)="showPassword = !showPassword" [attr.aria-label]="showPassword ? ui.t('Ocultar senha', 'Hide password') : ui.t('Mostrar senha', 'Show password')">
                <svg class="eye-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z"></path>
                  <circle cx="12" cy="12" r="3.2"></circle>
                </svg>
              </button>
            </div>
            <button class="primary-button" type="submit">{{ ui.t('Entrar no painel', 'Enter dashboard') }}</button>
            <p class="error-text" *ngIf="error">{{ error }}</p>
          </form>
          <div class="form-links">
            <a routerLink="/login">{{ ui.t('Area do utilizador', 'User area') }}</a>
            <a routerLink="/forgot-password">{{ ui.t('Recuperar senha', 'Recover password') }}</a>
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
  showPassword = false;
  private readonly api = inject(ApiService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly ui = inject(UiService);

  login() {
    this.api.adminLogin({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.session.setSession(response.token, response.user);
        this.toast.success(this.ui.t('Admin autenticado', 'Admin authenticated'), this.ui.t('Painel administrativo desbloqueado.', 'Administrative dashboard unlocked.'));
        this.router.navigateByUrl('/admin');
      },
      error: (e) => {
        this.error = e.error?.message || this.ui.t('Erro ao entrar como admin', 'Failed to sign in as admin');
        this.toast.error(this.ui.t('Acesso negado', 'Access denied'), this.error);
      }
    });
  }
}

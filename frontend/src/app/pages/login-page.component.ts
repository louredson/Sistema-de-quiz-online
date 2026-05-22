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
          <a routerLink="/" class="auth-brand-link">
            <span class="brand-mark"><img src="assets/favicon.svg" alt="QuizVerse"></span>
            <span class="brand-copy">
              <strong>QuizVerse</strong>
              <span>Back to home</span>
            </span>
          </a>
          <span class="inline-tag">QuizVerse Login</span>
          <h1 class="hero-title">Uma unica entrada para toda a plataforma.</h1>
          <p class="hero-copy">Jogadores e administrador entram pela mesma area. O sistema identifica o perfil e abre automaticamente a experiencia certa.</p>
          <ul class="feature-list">
            <li>Explorar quizzes publicados e tendencias da comunidade.</li>
            <li>Criar quizzes com suporte de IA e gerir rascunhos.</li>
            <li>Painel administrativo reservado apos autenticacao.</li>
          </ul>
        </article>

        <article class="auth-panel">
          <a routerLink="/" class="auth-brand-link">
            <span class="brand-mark"><img src="assets/favicon.svg" alt="QuizVerse"></span>
            <span class="brand-copy">
              <strong>QuizVerse</strong>
              <span>Pagina inicial</span>
            </span>
          </a>
          <span class="eyebrow">Acesso unico</span>
          <h2>Entrar na conta</h2>
          <p class="helper-copy">Usa a tua conta para jogar, criar ou administrar. O redirecionamento e feito conforme o teu perfil.</p>
          <form (ngSubmit)="login()">
            <div>
              <label class="field-label">Email</label>
              <input [(ngModel)]="email" name="email" placeholder="user@quizverse.com">
            </div>
            <div class="password-field">
              <label class="field-label">Password</label>
              <input [(ngModel)]="password" name="password" placeholder="Password" [type]="showPassword ? 'text' : 'password'">
              <button class="eye-button" type="button" (click)="showPassword = !showPassword" [attr.aria-label]="showPassword ? 'Ocultar senha' : 'Mostrar senha'">
                <svg class="eye-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z"></path>
                  <circle cx="12" cy="12" r="3.2"></circle>
                </svg>
              </button>
            </div>
            <button class="primary-button" type="submit">Entrar agora</button>
            <p class="error-text" *ngIf="error">{{ error }}</p>
          </form>
          <div class="form-links">
            <a routerLink="/register">Criar conta</a>
            <a routerLink="/forgot-password">Recuperar senha</a>
          </div>
        </article>
      </div>
    </section>
  `
})
export class LoginPageComponent {
  email = 'user@quiz.com';
  password = 'user1234';
  error = '';
  showPassword = false;
  private readonly api = inject(ApiService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  login() {
    this.api.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.session.setSession(response.token, response.user);
        this.toast.success('Sessao iniciada', 'Bem-vindo de volta ao QuizVerse.');
        this.router.navigateByUrl(response.user?.role === 'admin' ? '/admin' : '/');
      },
      error: (e) => {
        this.error = e.error?.message || 'Erro ao autenticar';
        this.toast.error('Falha no login', this.error);
      }
    });
  }
}
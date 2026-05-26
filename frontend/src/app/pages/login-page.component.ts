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
          <span class="inline-tag">{{ ui.t('Login QuizVerse', 'QuizVerse Login') }}</span>
          <h1 class="hero-title">{{ ui.t('Uma unica entrada para toda a plataforma.', 'One login for the whole platform.') }}</h1>
          <p class="hero-copy">{{ ui.t('Jogadores e administrador entram pela mesma area. O sistema identifica o perfil e abre automaticamente a experiencia certa.', 'Players and admins sign in through the same area. The system detects the profile and opens the right experience automatically.') }}</p>
          <ul class="feature-list">
            <li>{{ ui.t('Explorar quizzes publicados e tendencias da comunidade.', 'Explore published quizzes and community trends.') }}</li>
            <li>{{ ui.t('Criar quizzes com suporte de IA e gerir rascunhos.', 'Create quizzes with AI support and manage drafts.') }}</li>
            <li>{{ ui.t('Painel administrativo reservado apos autenticacao.', 'Administrative dashboard available after authentication.') }}</li>
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
          <span class="eyebrow">{{ ui.t('Acesso unico', 'Single access') }}</span>
          <h2>{{ ui.t('Entrar na conta', 'Sign in') }}</h2>
          <p class="helper-copy">{{ ui.t('Usa a tua conta para jogar, criar ou administrar. O redirecionamento e feito conforme o teu perfil.', 'Use your account to play, create, or manage. Redirection is based on your profile.') }}</p>
          <form (ngSubmit)="login()">
            <div>
              <label class="field-label">Email</label>
              <input [(ngModel)]="email" name="email" placeholder="user@quizverse.com">
            </div>
            <div class="password-field">
              <label class="field-label">{{ ui.t('Password', 'Password') }}</label>
              <input [(ngModel)]="password" name="password" [placeholder]="ui.t('Password', 'Password')" [type]="showPassword ? 'text' : 'password'">
              <button class="eye-button" type="button" (click)="showPassword = !showPassword" [attr.aria-label]="showPassword ? ui.t('Ocultar senha', 'Hide password') : ui.t('Mostrar senha', 'Show password')">
                <svg class="eye-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z"></path>
                  <circle cx="12" cy="12" r="3.2"></circle>
                </svg>
              </button>
            </div>
            <button class="primary-button" type="submit">{{ ui.t('Entrar agora', 'Sign in now') }}</button>
            <p class="error-text" *ngIf="error">{{ error }}</p>
          </form>
          <div class="form-links">
            <a routerLink="/register">{{ ui.t('Criar conta', 'Create account') }}</a>
            <a routerLink="/forgot-password">{{ ui.t('Recuperar senha', 'Recover password') }}</a>
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
  readonly ui = inject(UiService);

  login() {
    this.api.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.session.setSession(response.token, response.user);
        this.toast.success(this.ui.t('Sessao iniciada', 'Session started'), this.ui.t('Bem-vindo de volta ao QuizVerse.', 'Welcome back to QuizVerse.'));
        this.router.navigateByUrl(response.user?.role === 'admin' ? '/admin' : '/');
      },
      error: (e) => {
        this.error = e.error?.message || this.ui.t('Erro ao autenticar', 'Authentication failed');
        this.toast.error(this.ui.t('Falha no login', 'Login failed'), this.error);
      }
    });
  }
}

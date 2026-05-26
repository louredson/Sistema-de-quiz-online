import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
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
          <span class="inline-tag">{{ ui.t('Criar conta', 'Create account') }}</span>
          <h1 class="hero-title">{{ ui.t('Comeca a construir a tua presenca no QuizVerse.', 'Start building your presence on QuizVerse.') }}</h1>
          <p class="hero-copy">{{ ui.t('Regista-te para jogar, criar quizzes e aparecer no ranking global.', 'Sign up to play, create quizzes, and show up on the global leaderboard.') }}</p>
          <ul class="feature-list">
            <li>{{ ui.t('Conta normal para jogar e criar quizzes.', 'Standard account to play and create quizzes.') }}</li>
            <li>{{ ui.t('Perfil com estatisticas detalhadas.', 'Profile with detailed statistics.') }}</li>
            <li>{{ ui.t('Fluxo simples, rapido e responsivo.', 'Simple, fast, and responsive flow.') }}</li>
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
          <span class="eyebrow">{{ ui.t('Novo utilizador', 'New user') }}</span>
          <h2>{{ ui.t('Criar conta', 'Create account') }}</h2>
          <form (ngSubmit)="register()">
            <div>
              <label class="field-label">{{ ui.t('Nome', 'Name') }}</label>
              <input [(ngModel)]="name" name="name" [placeholder]="ui.t('O teu nome', 'Your name')">
            </div>
            <div>
              <label class="field-label">Email</label>
              <input [(ngModel)]="email" name="email" placeholder="nome@email.com">
            </div>
            <div class="password-field">
              <label class="field-label">{{ ui.t('Password', 'Password') }}</label>
              <input [(ngModel)]="password" name="password" [type]="showPassword ? 'text' : 'password'" [placeholder]="ui.t('Minimo 6 caracteres', 'Minimum 6 characters')">
              <button class="eye-button" type="button" (click)="showPassword = !showPassword" [attr.aria-label]="showPassword ? ui.t('Ocultar senha', 'Hide password') : ui.t('Mostrar senha', 'Show password')">
                <svg class="eye-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z"></path>
                  <circle cx="12" cy="12" r="3.2"></circle>
                </svg>
              </button>
            </div>
            <button class="primary-button" type="submit">{{ ui.t('Criar conta', 'Create account') }}</button>
            <p class="success-text" *ngIf="msg">{{ msg }}</p>
          </form>
          <div class="form-links">
            <a routerLink="/login">{{ ui.t('Ja tenho conta', 'I already have an account') }}</a>
          </div>
        </article>
      </div>
    </section>
  `
})
export class RegisterPageComponent {
  name = '';
  email = '';
  password = '';
  msg = '';
  showPassword = false;
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly ui = inject(UiService);

  register() {
    this.api.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => {
        this.msg = this.ui.t('Conta criada com sucesso', 'Account created successfully');
        this.toast.success(this.ui.t('Conta criada com sucesso', 'Account created successfully'), this.ui.t('Ja podes entrar e comecar a jogar.', 'You can now sign in and start playing.'));
        this.router.navigateByUrl('/login');
      },
      error: (e) => this.toast.error(this.ui.t('Falha no registo', 'Registration failed'), e.error?.message || this.ui.t('Nao foi possivel criar a conta.', 'Could not create the account.'))
    });
  }
}

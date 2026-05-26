import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
          <span class="inline-tag">{{ ui.t('Recuperacao de password', 'Password recovery') }}</span>
          <h1 class="hero-title">{{ ui.t('Recupera a conta em dois passos.', 'Recover your account in two steps.') }}</h1>
          <p class="hero-copy">{{ ui.t('Enquanto o envio por email nao esta ligado, o token de recuperacao aparece no proprio ecran para desenvolvimento.', 'While email delivery is not connected, the recovery token is shown on screen for development.') }}</p>
          <ul class="feature-list">
            <li>{{ ui.t('Geracao de token temporario.', 'Temporary token generation.') }}</li>
            <li>{{ ui.t('Redefinicao imediata da password.', 'Immediate password reset.') }}</li>
            <li>{{ ui.t('Fluxo preparado para evoluir para SMTP.', 'Flow ready to evolve to SMTP.') }}</li>
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
          <span class="eyebrow">{{ ui.t('Recuperacao', 'Recovery') }}</span>
          <h2>{{ ui.t('Redefinir senha', 'Reset password') }}</h2>
          <div class="form-stack">
            <div>
              <label class="field-label">{{ ui.t('Email da conta', 'Account email') }}</label>
              <input [(ngModel)]="email" placeholder="nome@email.com">
            </div>
            <button class="secondary-button" type="button" (click)="requestReset()">{{ ui.t('Gerar token', 'Generate token') }}</button>
            <p class="helper-copy" *ngIf="message">{{ message }}</p>
            <div class="question-card" *ngIf="tokenPreview">
              <strong>{{ ui.t('Token temporario', 'Temporary token') }}</strong>
              <span>{{ tokenPreview }}</span>
            </div>
            <div>
              <label class="field-label">{{ ui.t('Token', 'Token') }}</label>
              <input [(ngModel)]="token" [placeholder]="ui.t('Cole o token aqui', 'Paste the token here')">
            </div>
            <div class="password-field">
              <label class="field-label">{{ ui.t('Nova password', 'New password') }}</label>
              <input [(ngModel)]="password" [type]="showPassword ? 'text' : 'password'" [placeholder]="ui.t('Nova password', 'New password')">
              <button class="eye-button" type="button" (click)="showPassword = !showPassword" [attr.aria-label]="showPassword ? ui.t('Ocultar senha', 'Hide password') : ui.t('Mostrar senha', 'Show password')">
                <svg class="eye-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z"></path>
                  <circle cx="12" cy="12" r="3.2"></circle>
                </svg>
              </button>
            </div>
            <button class="primary-button" type="button" (click)="resetPassword()">{{ ui.t('Atualizar password', 'Update password') }}</button>
            <p class="error-text" *ngIf="error">{{ error }}</p>
          </div>
          <div class="form-links">
            <a routerLink="/login">{{ ui.t('Entrar como utilizador', 'Sign in as user') }}</a>
          </div>
        </article>
      </div>
    </section>
  `
})
export class ForgotPasswordPageComponent {
  email = '';
  token = '';
  password = '';
  tokenPreview = '';
  message = '';
  error = '';
  showPassword = false;
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  readonly ui = inject(UiService);

  requestReset() {
    this.error = '';
    this.message = '';
    this.api.forgotPassword({ email: this.email }).subscribe({
      next: (response) => {
        this.message = response.message || this.ui.t('Pedido criado', 'Request created');
        this.tokenPreview = response.reset_token || '';
        this.token = response.reset_token || this.token;
        this.toast.info(this.ui.t('Token gerado', 'Token generated'), this.ui.t('Usa o token apresentado para redefinir a senha.', 'Use the displayed token to reset your password.'));
      },
      error: (e) => {
        this.error = e.error?.message || this.ui.t('Erro ao gerar token', 'Failed to generate token');
        this.toast.error(this.ui.t('Falha na recuperacao', 'Recovery failed'), this.error);
      }
    });
  }

  resetPassword() {
    this.error = '';
    this.message = '';
    this.api.resetPassword({ token: this.token, password: this.password }).subscribe({
      next: (response) => {
        this.message = response.message || this.ui.t('Senha atualizada', 'Password updated');
        this.toast.success(this.ui.t('Senha atualizada', 'Password updated'), this.ui.t('Ja podes voltar a entrar na plataforma.', 'You can now sign in again.'));
      },
      error: (e) => {
        this.error = e.error?.message || this.ui.t('Erro ao redefinir senha', 'Failed to reset password');
        this.toast.error(this.ui.t('Falha ao redefinir', 'Reset failed'), this.error);
      }
    });
  }
}

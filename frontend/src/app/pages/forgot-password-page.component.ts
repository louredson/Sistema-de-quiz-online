import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
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
          <span class="inline-tag">Password recovery</span>
          <h1 class="hero-title">Recupera a conta em dois passos.</h1>
          <p class="hero-copy">Enquanto o envio por email nao esta ligado, o token de recuperacao aparece no proprio ecran para desenvolvimento.</p>
          <ul class="feature-list">
            <li>Geracao de token temporario.</li>
            <li>Redefinicao imediata da password.</li>
            <li>Fluxo preparado para evoluir para SMTP.</li>
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
          <span class="eyebrow">Recuperacao</span>
          <h2>Redefinir senha</h2>
          <div class="form-stack">
            <div>
              <label class="field-label">Email da conta</label>
              <input [(ngModel)]="email" placeholder="nome@email.com">
            </div>
            <button class="secondary-button" type="button" (click)="requestReset()">Gerar token</button>
            <p class="helper-copy" *ngIf="message">{{ message }}</p>
            <div class="question-card" *ngIf="tokenPreview">
              <strong>Token temporario</strong>
              <span>{{ tokenPreview }}</span>
            </div>
            <div>
              <label class="field-label">Token</label>
              <input [(ngModel)]="token" placeholder="Cole o token aqui">
            </div>
            <div class="password-field">
              <label class="field-label">Nova password</label>
              <input [(ngModel)]="password" [type]="showPassword ? 'text' : 'password'" placeholder="Nova password">
              <button class="eye-button" type="button" (click)="showPassword = !showPassword" [attr.aria-label]="showPassword ? 'Ocultar senha' : 'Mostrar senha'">
                <svg class="eye-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z"></path>
                  <circle cx="12" cy="12" r="3.2"></circle>
                </svg>
              </button>
            </div>
            <button class="primary-button" type="button" (click)="resetPassword()">Atualizar password</button>
            <p class="error-text" *ngIf="error">{{ error }}</p>
          </div>
          <div class="form-links">
            <a routerLink="/login">Entrar como utilizador</a>
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

  requestReset() {
    this.error = '';
    this.message = '';
    this.api.forgotPassword({ email: this.email }).subscribe({
      next: (response) => {
        this.message = response.message || 'Pedido criado';
        this.tokenPreview = response.reset_token || '';
        this.token = response.reset_token || this.token;
        this.toast.info('Token gerado', 'Usa o token apresentado para redefinir a senha.');
      },
      error: (e) => {
        this.error = e.error?.message || 'Erro ao gerar token';
        this.toast.error('Falha na recuperacao', this.error);
      }
    });
  }

  resetPassword() {
    this.error = '';
    this.message = '';
    this.api.resetPassword({ token: this.token, password: this.password }).subscribe({
      next: (response) => {
        this.message = response.message || 'Senha atualizada';
        this.toast.success('Senha atualizada', 'Ja podes voltar a entrar na plataforma.');
      },
      error: (e) => {
        this.error = e.error?.message || 'Erro ao redefinir senha';
        this.toast.error('Falha ao redefinir', this.error);
      }
    });
  }
}

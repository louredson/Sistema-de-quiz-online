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
            <div>
              <label class="field-label">Nova password</label>
              <input [(ngModel)]="password" type="password" placeholder="Nova password">
            </div>
            <button class="primary-button" type="button" (click)="resetPassword()">Atualizar password</button>
            <p class="error-text" *ngIf="error">{{ error }}</p>
          </div>
          <div class="form-links">
            <a routerLink="/login">Entrar como utilizador</a>
            <a routerLink="/admin-login">Entrar como admin</a>
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
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
            <span class="brand-mark">QV</span>
            <span class="brand-copy">
              <strong>QuizVerse</strong>
              <span>Back to home</span>
            </span>
          </a>
          <span class="inline-tag">QuizVerse Login</span>
          <h1 class="hero-title">Entra e continua a subir no ranking.</h1>
          <p class="hero-copy">Performance, estatisticas, quizzes e competicao num painel moderno e rapido.</p>
          <ul class="feature-list">
            <li>Ranking global com destaque para top jogadores.</li>
            <li>Modo claro e escuro com persistencia local.</li>
            <li>Experiencia pensada para desktop e mobile.</li>
          </ul>
        </article>

        <article class="auth-panel">
          <a routerLink="/" class="auth-brand-link">
            <span class="brand-mark">QV</span>
            <span class="brand-copy">
              <strong>QuizVerse</strong>
              <span>Pagina inicial</span>
            </span>
          </a>
          <span class="eyebrow">Area do utilizador</span>
          <h2>Entrar na conta</h2>
          <p class="helper-copy">Usa a tua conta para jogar quizzes, acompanhar historico e criar novos desafios.</p>
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
        this.router.navigateByUrl('/');
      },
      error: (e) => {
        this.error = e.error?.message || 'Erro ao autenticar';
        this.toast.error('Senha incorreta', this.error);
      }
    });
  }
}

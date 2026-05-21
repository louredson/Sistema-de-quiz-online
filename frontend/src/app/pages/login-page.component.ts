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
          <span class="eyebrow">Area do utilizador</span>
          <h2>Entrar na conta</h2>
          <p class="helper-copy">Usa a tua conta para jogar quizzes, acompanhar historico e criar novos desafios.</p>
          <form (ngSubmit)="login()">
            <div>
              <label class="field-label">Email</label>
              <input [(ngModel)]="email" name="email" placeholder="user@quizverse.com">
            </div>
            <div>
              <label class="field-label">Password</label>
              <input [(ngModel)]="password" name="password" placeholder="Password" [type]="showPassword ? 'text' : 'password'">
            </div>
            <button class="ghost-button" type="button" (click)="showPassword = !showPassword">{{ showPassword ? 'Ocultar senha' : 'Mostrar senha' }}</button>
            <button class="primary-button" type="submit">Entrar agora</button>
            <p class="error-text" *ngIf="error">{{ error }}</p>
          </form>
          <div class="form-links">
            <a routerLink="/register">Criar conta</a>
            <a routerLink="/forgot-password">Recuperar senha</a>
            <a routerLink="/admin-login">Entrar como admin</a>
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
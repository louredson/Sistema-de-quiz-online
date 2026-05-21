import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
          <span class="inline-tag">Create account</span>
          <h1 class="hero-title">Comeca a construir a tua presenca no QuizVerse.</h1>
          <p class="hero-copy">Regista-te para jogar, criar quizzes e aparecer no ranking global.</p>
          <ul class="feature-list">
            <li>Conta normal para jogar e criar quizzes.</li>
            <li>Perfil com estatisticas detalhadas.</li>
            <li>Fluxo simples, rapido e responsivo.</li>
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
          <span class="eyebrow">Novo utilizador</span>
          <h2>Criar conta</h2>
          <form (ngSubmit)="register()">
            <div>
              <label class="field-label">Nome</label>
              <input [(ngModel)]="name" name="name" placeholder="O teu nome">
            </div>
            <div>
              <label class="field-label">Email</label>
              <input [(ngModel)]="email" name="email" placeholder="nome@email.com">
            </div>
            <div class="password-field">
              <label class="field-label">Password</label>
              <input [(ngModel)]="password" name="password" [type]="showPassword ? 'text' : 'password'" placeholder="Minimo 6 caracteres">
              <button class="eye-button" type="button" (click)="showPassword = !showPassword" [attr.aria-label]="showPassword ? 'Ocultar senha' : 'Mostrar senha'">
                <svg class="eye-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z"></path>
                  <circle cx="12" cy="12" r="3.2"></circle>
                </svg>
              </button>
            </div>
            <button class="primary-button" type="submit">Criar conta</button>
            <p class="success-text" *ngIf="msg">{{ msg }}</p>
          </form>
          <div class="form-links">
            <a routerLink="/login">Ja tenho conta</a>
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

  register() {
    this.api.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => {
        this.msg = 'Conta criada com sucesso';
        this.toast.success('Conta criada com sucesso', 'Ja podes entrar e comecar a jogar.');
        this.router.navigateByUrl('/login');
      },
      error: (e) => this.toast.error('Falha no registo', e.error?.message || 'Nao foi possivel criar a conta.')
    });
  }
}

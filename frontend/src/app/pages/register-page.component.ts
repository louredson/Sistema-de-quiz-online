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
            <div>
              <label class="field-label">Password</label>
              <input [(ngModel)]="password" name="password" type="password" placeholder="Minimo 6 caracteres">
            </div>
            <button class="primary-button" type="submit">Criar conta</button>
            <p class="success-text" *ngIf="msg">{{ msg }}</p>
          </form>
          <div class="form-links">
            <a routerLink="/login">Ja tenho conta</a>
            <a routerLink="/admin-login">Area do admin</a>
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
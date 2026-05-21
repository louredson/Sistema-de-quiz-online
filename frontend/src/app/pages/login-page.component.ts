import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../core/api.service';
import { SessionService } from '../core/session.service';

@Component({ standalone: true, imports: [CommonModule, FormsModule], template: `
<div class='card form-card'>
<h2>Login QUIZ</h2>
<input [(ngModel)]='email' placeholder='Email'>
<input [(ngModel)]='password' placeholder='Password' type='password'>
<button (click)='login()'>Entrar</button>
<p class='error'>{{error}}</p>
</div>` })
export class LoginPageComponent {
  email = 'admin@quiz.com'; password = 'admin123'; error = '';
  api = inject(ApiService); session = inject(SessionService); router = inject(Router);
  login() { this.api.login({ email: this.email, password: this.password }).subscribe({ next: r => { this.session.setSession(r.token, r.user); this.router.navigateByUrl('/'); }, error: e => this.error = e.error?.message || 'Erro' }); }
}

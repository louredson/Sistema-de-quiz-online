import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UiService } from './core/ui.service';
import { SessionService } from './core/session.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
  <header class="topbar">
    <a routerLink="/" class="brand">🧠 QUIZ</a>
    <nav>
      <a routerLink="/ranking">{{ ui.t('Ranking', 'Ranking') }}</a>
      <a routerLink="/create-quiz">{{ ui.t('Criar Quiz', 'Create Quiz') }}</a>
      <a routerLink="/profile">{{ ui.t('Perfil', 'Profile') }}</a>
      <a *ngIf="session.user()?.role==='admin'" routerLink="/admin">Admin</a>
    </nav>
    <div class="actions">
      <button (click)="ui.toggleTheme()">{{ ui.theme()==='light' ? '🌙' : '☀️' }}</button>
      <button (click)="switchLang()">{{ ui.lang()==='pt' ? 'EN' : 'PT' }}</button>
      <button *ngIf="!session.user()" (click)="go('/login')">Login</button>
      <button *ngIf="session.user()" (click)="logout()">Logout</button>
    </div>
  </header>
  <main class="container"><router-outlet /></main>
  `
})
export class AppComponent {
  ui = inject(UiService);
  session = inject(SessionService);
  private router = inject(Router);

  constructor() { this.ui.initTheme(); }

  switchLang() { this.ui.setLang(this.ui.lang() === 'pt' ? 'en' : 'pt'); }
  go(url: string) { this.router.navigateByUrl(url); }
  logout() { this.session.logout(); this.router.navigateByUrl('/login'); }
}


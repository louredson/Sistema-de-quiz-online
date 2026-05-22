import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ToastViewportComponent } from './components/toast-viewport.component';
import { SessionService } from './core/session.service';
import { UiService } from './core/ui.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, ToastViewportComponent],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <a routerLink="/" class="topbar-brand" aria-label="QuizVerse home">
          <span class="brand-mark"><img src="assets/favicon.svg" alt="QuizVerse"></span>
          <span class="brand-copy topbar-brand-copy">
            <strong>QuizVerse</strong>
            <span>Smart quiz platform</span>
          </span>
        </a>

        <nav class="topbar-nav">
          <a routerLink="/">Home</a>
          <a routerLink="/explore">Explorar</a>
          <a *ngIf="session.user()" routerLink="/create-quiz">Criar</a>
          <a *ngIf="session.user()?.role === 'user'" routerLink="/ranking">Ranking</a>
          <a *ngIf="session.user()?.role === 'admin'" routerLink="/admin">Dashboard</a>
        </nav>
      </div>

      <div class="topbar-right">
        <button class="icon-button" type="button" (click)="ui.toggleTheme()">{{ ui.theme() === 'light' ? 'Dark' : 'Light' }}</button>
        <button class="icon-button" type="button" (click)="switchLang()">{{ ui.lang() === 'pt' ? 'EN' : 'PT' }}</button>
        <div class="user-chip" *ngIf="session.user(); else authButtons">
          <div class="avatar">{{ initials }}</div>
          <div class="user-meta">
            <strong>{{ session.user()?.name }}</strong>
            <span>{{ session.user()?.role === 'admin' ? 'Administrator' : 'Player' }}</span>
          </div>
          <button class="ghost-button" type="button" (click)="logout()">Logout</button>
        </div>
        <ng-template #authButtons>
          <div class="auth-actions">
            <button class="primary-button topbar-cta" type="button" (click)="go('/login')">Login</button>
            <button class="primary-button topbar-cta" type="button" (click)="go('/register')">Criar conta</button>
          </div>
        </ng-template>
      </div>
    </header>

    <div class="shell-layout">
      <main class="page-shell" [class.page-shell-auth]="isAuthRoute">
        <router-outlet />
      </main>
    </div>

    <footer class="app-footer">
      <div class="app-footer-inner">
        <div class="footer-brand">
          <span class="brand-mark"><img src="assets/favicon.svg" alt="QuizVerse"></span>
          <div class="brand-copy">
            <strong>QuizVerse</strong>
            <span>Explora quizzes, cria conteudo com IA e acompanha rankings em tempo real.</span>
          </div>
        </div>

        <div class="footer-links">
          <span>Angular + PHP + MySQL</span>
          <span>Gemini-ready quiz generation</span>
          <span>PT / EN</span>
        </div>
      </div>
    </footer>

    <app-toast-viewport />
  `
})
export class AppComponent {
  readonly ui = inject(UiService);
  readonly session = inject(SessionService);
  private readonly router = inject(Router);
  isAuthRoute = false;
  currentUrl = '';

  constructor() {
    this.ui.initTheme();
    this.trackRoute(this.router.url);
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.trackRoute((event as NavigationEnd).urlAfterRedirects);
    });
  }

  get initials() {
    const user = this.session.user();
    if (!user?.name) {
      return 'QV';
    }

    return user.name.split(' ').slice(0, 2).map((part: string) => part[0]).join('').toUpperCase();
  }

  switchLang() {
    this.ui.setLang(this.ui.lang() === 'pt' ? 'en' : 'pt');
  }

  go(url: string) {
    this.router.navigateByUrl(url);
  }

  logout() {
    this.session.logout();
    this.router.navigateByUrl('/login');
  }

  private trackRoute(url: string) {
    this.currentUrl = url;
    this.isAuthRoute = ['/login', '/register', '/forgot-password'].some((route) => url.startsWith(route));
  }
}

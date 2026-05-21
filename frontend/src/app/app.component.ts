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
    <div class="app-shell" [class.auth-layout]="isAuthRoute">
      <aside class="sidebar" *ngIf="!isAuthRoute" [class.sidebar-collapsed]="sidebarCollapsed">
        <div class="brand-block">
          <a routerLink="/" class="brand-mark" aria-label="QuizVerse">QV</a>
          <div class="brand-copy" *ngIf="!sidebarCollapsed">
            <strong>QuizVerse</strong>
            <span>Competitive learning</span>
          </div>
        </div>

        <button class="sidebar-toggle" type="button" (click)="sidebarCollapsed = !sidebarCollapsed">
          {{ sidebarCollapsed ? '>' : '<' }}
        </button>

        <nav class="menu">
          <a *ngFor="let item of visibleNavItems()"
             [routerLink]="item.route"
             class="menu-item">
            <span class="menu-icon">{{ item.icon }}</span>
            <span *ngIf="!sidebarCollapsed">{{ item.label }}</span>
          </a>
        </nav>

        <div class="sidebar-footer" *ngIf="!sidebarCollapsed">
          <p>Premium interface for modern quizzes.</p>
        </div>
      </aside>

      <div class="shell-content">
        <header class="topbar" [class.topbar-auth]="isAuthRoute">
          <div class="topbar-left">
            <div class="mobile-brand" *ngIf="!isAuthRoute">
              <span class="mobile-badge">QV</span>
              <div>
                <strong>QuizVerse</strong>
                <span>Smart quiz platform</span>
              </div>
            </div>
            <div *ngIf="!isAuthRoute" class="search-shell">
              <span class="search-icon">+</span>
              <input type="text" placeholder="Pesquisar quizzes, rankings e usuarios">
            </div>
          </div>

          <div class="topbar-right">
            <button class="icon-button" type="button" (click)="ui.toggleTheme()">{{ ui.theme() === 'light' ? 'Dark' : 'Light' }}</button>
            <button class="icon-button" type="button" (click)="switchLang()">{{ ui.lang() === 'pt' ? 'EN' : 'PT' }}</button>
            <button class="icon-button" type="button" *ngIf="!isAuthRoute">3</button>
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
                <button class="ghost-button" type="button" (click)="go('/login')">Login</button>
                <button class="primary-button" type="button" (click)="go('/register')">Criar conta</button>
              </div>
            </ng-template>
          </div>
        </header>

        <main class="page-shell" [class.page-shell-auth]="isAuthRoute">
          <router-outlet />
        </main>
      </div>
    </div>

    <app-toast-viewport />
  `
})
export class AppComponent {
  readonly ui = inject(UiService);
  readonly session = inject(SessionService);
  private readonly router = inject(Router);
  sidebarCollapsed = false;
  isAuthRoute = false;
  navItems = [
    { route: '/', label: 'Dashboard', icon: 'D' },
    { route: '/ranking', label: 'Rankings', icon: 'R', auth: true },
    { route: '/create-quiz', label: 'Criar Quiz', icon: 'C', auth: true },
    { route: '/profile', label: 'Perfil', icon: 'P', auth: true },
    { route: '/admin', label: 'Usuarios', icon: 'U', auth: true, admin: true },
    { route: '/admin-login', label: 'Admin', icon: 'A', guest: true }
  ];

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

  visibleNavItems() {
    const user = this.session.user();
    return this.navItems.filter((item) => {
      if (item.auth && !user) {
        return false;
      }
      if (item.admin && user?.role !== 'admin') {
        return false;
      }
      if (item.guest && user) {
        return false;
      }
      return true;
    });
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
    this.isAuthRoute = ['/login', '/register', '/admin-login', '/forgot-password'].some((route) => url.startsWith(route));
  }
}
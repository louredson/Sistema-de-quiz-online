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

    <div class="shell-layout" [class.shell-layout-admin]="showAdminSidebar">
      <aside class="sidebar" *ngIf="showAdminSidebar" [class.sidebar-collapsed]="sidebarCollapsed">
        <div class="brand-block">
          <a routerLink="/admin" class="brand-mark" aria-label="QuizVerse admin"><img src="assets/favicon.svg" alt="QuizVerse"></a>
          <div class="brand-copy" *ngIf="!sidebarCollapsed">
            <strong>Admin Panel</strong>
            <span>Control center</span>
          </div>
        </div>

        <button class="sidebar-toggle" type="button" (click)="sidebarCollapsed = !sidebarCollapsed">
          {{ sidebarCollapsed ? '>' : '<' }}
        </button>

        <nav class="menu">
          <a *ngFor="let item of adminNavItems"
             [routerLink]="item.route"
             class="menu-item">
            <span class="menu-icon">{{ item.icon }}</span>
            <span *ngIf="!sidebarCollapsed">{{ item.label }}</span>
          </a>
        </nav>
      </aside>

      <main class="page-shell" [class.page-shell-auth]="isAuthRoute">
        <router-outlet />
      </main>
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
  currentUrl = '';
  adminNavItems = [
    { route: '/admin', label: 'Dashboard', icon: 'D' },
    { route: '/ranking', label: 'Rankings', icon: 'R' },
    { route: '/create-quiz', label: 'Criar Quiz', icon: 'C' },
    { route: '/profile', label: 'Perfil', icon: 'P' }
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

  get showAdminSidebar() {
    return this.currentUrl.startsWith('/admin') && this.session.user()?.role === 'admin';
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
    this.isAuthRoute = ['/login', '/register', '/admin-login', '/forgot-password'].some((route) => url.startsWith(route));
  }
}

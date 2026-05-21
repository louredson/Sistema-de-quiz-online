import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UiService {
  lang = signal<'pt' | 'en'>((localStorage.getItem('lang') as 'pt' | 'en') || 'pt');
  theme = signal<'light' | 'dark'>((localStorage.getItem('theme') as 'light' | 'dark') || 'light');

  t(pt: string, en: string): string {
    return this.lang() === 'pt' ? pt : en;
  }

  setLang(lang: 'pt' | 'en') {
    this.lang.set(lang);
    localStorage.setItem('lang', lang);
  }

  toggleTheme() {
    const next = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(next);
    localStorage.setItem('theme', next);
    document.body.classList.toggle('dark', next === 'dark');
  }

  initTheme() {
    document.body.classList.toggle('dark', this.theme() === 'dark');
  }
}

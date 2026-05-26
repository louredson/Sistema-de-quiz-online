import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../core/api.service';
import { SessionService } from '../core/session.service';
import { ToastService } from '../core/toast.service';
import { UiService } from '../core/ui.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-enter dashboard-grid">
      <article class="hero-card">
        <span class="inline-tag">Explorar</span>
        <h1 class="hero-title">{{ ui.t('Descobre quizzes publicados em formato de feed.', 'Discover published quizzes in a feed layout.') }}</h1>
        <p class="hero-copy">{{ ui.t('Uma organizacao inspirada em plataformas de comunidade: destaques, categorias e quizzes recentes num fluxo simples de percorrer.', 'A community-inspired layout with highlights, categories, and recent quizzes in a simple browsing flow.') }}</p>
        <div class="filter-row" style="margin-top:1rem;">
          <div style="flex:2; min-width:220px;">
            <label class="field-label">{{ ui.t('Pesquisar', 'Search') }}</label>
            <input [(ngModel)]="query" [placeholder]="ui.t('Titulo, categoria ou autor', 'Title, category, or author')">
          </div>
          <div style="flex:1; min-width:220px;">
            <label class="field-label">{{ ui.t('Categoria', 'Category') }}</label>
            <select [(ngModel)]="selectedCategory">
              <option value="">{{ ui.t('Todas', 'All') }}</option>
              <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
            </select>
          </div>
        </div>
      </article>

      <section class="surface-card">
        <div class="card-header-inline">
          <div>
            <span class="eyebrow">{{ ui.t('Resultados', 'Results') }}</span>
            <h2>{{ filteredQuizzes.length }} {{ ui.t('quizzes encontrados', 'quizzes found') }}</h2>
          </div>
        </div>

        <div class="quiz-card-grid" *ngIf="filteredQuizzes.length; else noResults">
          <article class="quiz-card" *ngFor="let quiz of filteredQuizzes">
            <img class="quiz-card-image" [src]="quizImage(quiz)" [alt]="quiz.title">
            <div class="quiz-card-body">
              <div>
                <strong>{{ quiz.title }}</strong>
                <p class="card-description">{{ quiz.description || ui.t('Quiz publicado pela comunidade.', 'Quiz published by the community.') }}</p>
              </div>
              <div class="quiz-card-meta">
                <span class="badge">{{ quiz.category }}</span>
                <span class="badge">{{ quiz.question_count || 0 }} {{ ui.t('perguntas', 'questions') }}</span>
              </div>
              <div class="card-footer">
                <div class="card-footer-meta">
                  <span class="muted">{{ ui.t('Por', 'By') }} {{ quiz.author }}</span>
                  <span class="muted">{{ formatPublishedAt(quiz.created_at) }}</span>
                </div>
                <button class="action-pill" type="button" (click)="openQuiz(quiz.id)">{{ ui.t('Fazer quiz', 'Take quiz') }}</button>
              </div>
            </div>
          </article>
        </div>

        <ng-template #noResults>
          <div class="empty-state">{{ ui.t('Nenhum quiz corresponde aos filtros atuais.', 'No quiz matches the current filters.') }}</div>
        </ng-template>
      </section>
    </section>
  `
})
export class ExplorePageComponent {
  readonly api = inject(ApiService);
  readonly session = inject(SessionService);
  readonly router = inject(Router);
  readonly toast = inject(ToastService);
  readonly ui = inject(UiService);

  quizzes: any[] = [];
  query = '';
  selectedCategory = '';

  constructor() {
    this.loadQuizzes();
  }

  get categories() {
    return Array.from(new Set(this.quizzes.map((quiz) => quiz.category || 'Geral'))).sort();
  }

  get filteredQuizzes() {
    const term = this.query.trim().toLowerCase();
    return this.quizzes.filter((quiz) => {
      const matchesCategory = !this.selectedCategory || (quiz.category || 'Geral') === this.selectedCategory;
      const haystack = `${quiz.title || ''} ${quiz.category || ''} ${quiz.author || ''}`.toLowerCase();
      const matchesTerm = !term || haystack.includes(term);
      return matchesCategory && matchesTerm;
    });
  }

  quizImage(quiz: any) {
    const title = encodeURIComponent(quiz?.title || 'QuizVerse');
    const category = encodeURIComponent(quiz?.category || 'Quiz');
    return `https://placehold.co/640x400/e2e8f0/1f2937?text=${title}%0A${category}`;
  }

  formatPublishedAt(value: string) {
    if (!value) {
      return this.ui.t('Agora mesmo', 'Just now');
    }

    return new Date(value).toLocaleString(this.ui.locale(), {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  loadQuizzes() {
    this.api.quizzes().subscribe({
      next: (response) => this.quizzes = response.quizzes || [],
      error: () => this.toast.error(this.ui.t('Conexao perdida', 'Connection lost'), this.ui.t('Nao foi possivel carregar os quizzes publicados.', 'Could not load published quizzes.'))
    });
  }

  openQuiz(id: number) {
    if (!this.session.user()) {
      this.toast.info(this.ui.t('Login necessario', 'Login required'), this.ui.t('Entra primeiro para responder ao quiz.', 'Sign in first to answer the quiz.'));
      this.router.navigateByUrl('/login');
      return;
    }

    if (this.session.user()?.role === 'admin') {
      this.toast.warning(this.ui.t('Area reservada', 'Restricted area'), this.ui.t('O administrador nao participa nos quizzes.', 'The administrator cannot participate in quizzes.'));
      this.router.navigateByUrl('/admin');
      return;
    }

    this.router.navigate(['/'], { queryParams: { play: id } });
  }
}

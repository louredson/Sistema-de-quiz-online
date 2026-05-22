import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../core/api.service';
import { SessionService } from '../core/session.service';
import { ToastService } from '../core/toast.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-enter dashboard-grid">
      <article class="hero-card">
        <span class="inline-tag">Explorar</span>
        <h1 class="hero-title">Descobre quizzes publicados em formato de feed.</h1>
        <p class="hero-copy">Uma organizacao inspirada em plataformas de comunidade: destaques, categorias e quizzes recentes num fluxo simples de percorrer.</p>
        <div class="filter-row" style="margin-top:1rem;">
          <div style="flex:2; min-width:220px;">
            <label class="field-label">Pesquisar</label>
            <input [(ngModel)]="query" placeholder="Titulo, categoria ou autor">
          </div>
          <div style="flex:1; min-width:220px;">
            <label class="field-label">Categoria</label>
            <select [(ngModel)]="selectedCategory">
              <option value="">Todas</option>
              <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
            </select>
          </div>
        </div>
      </article>

      <section class="surface-card">
        <div class="card-header-inline">
          <div>
            <span class="eyebrow">Resultados</span>
            <h2>{{ filteredQuizzes.length }} quizzes encontrados</h2>
          </div>
        </div>

        <div class="quiz-card-grid" *ngIf="filteredQuizzes.length; else noResults">
          <article class="quiz-card" *ngFor="let quiz of filteredQuizzes">
            <img class="quiz-card-image" [src]="quizImage(quiz)" [alt]="quiz.title">
            <div class="quiz-card-body">
              <div>
                <strong>{{ quiz.title }}</strong>
                <p class="card-description">{{ quiz.description || 'Quiz publicado pela comunidade.' }}</p>
              </div>
              <div class="quiz-card-meta">
                <span class="badge">{{ quiz.category }}</span>
                <span class="badge">{{ quiz.question_count || 0 }} perguntas</span>
              </div>
              <div class="card-footer">
                <div class="card-footer-meta">
                  <span class="muted">Por {{ quiz.author }}</span>
                  <span class="muted">{{ formatPublishedAt(quiz.created_at) }}</span>
                </div>
                <button class="action-pill" type="button" (click)="openQuiz(quiz.id)">Fazer quiz</button>
              </div>
            </div>
          </article>
        </div>

        <ng-template #noResults>
          <div class="empty-state">Nenhum quiz corresponde aos filtros atuais.</div>
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
      return 'Agora mesmo';
    }

    return new Date(value).toLocaleString('pt-PT', {
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
      error: () => this.toast.error('Conexao perdida', 'Nao foi possivel carregar os quizzes publicados.')
    });
  }

  openQuiz(id: number) {
    if (!this.session.user()) {
      this.toast.info('Login necessario', 'Entra primeiro para responder ao quiz.');
      this.router.navigateByUrl('/login');
      return;
    }

    if (this.session.user()?.role === 'admin') {
      this.toast.warning('Area reservada', 'O administrador nao participa nos quizzes.');
      this.router.navigateByUrl('/admin');
      return;
    }

    this.router.navigate(['/'], { queryParams: { play: id } });
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { ToastService } from '../core/toast.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page-enter">
      <article class="hero-card">
        <span class="inline-tag">Dashboard</span>
        <h1 class="hero-title">Gestao completa da plataforma QuizVerse.</h1>
        <p class="hero-copy">Aqui acompanhas utilizadores, relatorios e quizzes publicados num layout mais responsivo, sem separar a experiencia do resto da aplicacao.</p>
        <div class="hero-actions">
          <a routerLink="/create-quiz" class="primary-button">Criar quiz</a>
          <a routerLink="/explore" class="secondary-button">Explorar quizzes</a>
        </div>
        <div class="stat-cluster">
          <div class="stat-card"><strong>{{ summary.users }}</strong><span>Total de users</span></div>
          <div class="stat-card"><strong>{{ summary.quizzes }}</strong><span>Total de quizzes</span></div>
          <div class="stat-card"><strong>{{ bestScorer.name || 'Sem dados' }}</strong><span>Melhor pontuador</span></div>
        </div>
      </article>

      <section class="admin-grid" style="margin-top:1.25rem;">
        <article class="surface-card">
          <div class="card-header-inline">
            <div>
              <span class="eyebrow">Quizzes publicados</span>
              <h2>Catalogo da plataforma</h2>
            </div>
            <span class="pill-status status-success">{{ filteredQuizzes.length }} visiveis</span>
          </div>
          <div class="filter-row" style="margin-bottom:1rem;">
            <div style="flex:1; min-width:220px;">
              <label class="field-label">Filtrar por categoria</label>
              <select [(ngModel)]="selectedCategory">
                <option value="">Todas</option>
                <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
              </select>
            </div>
          </div>
          <div class="quiz-card-grid" *ngIf="filteredQuizzes.length; else noQuizzes">
            <article class="quiz-card" *ngFor="let quiz of filteredQuizzes">
              <img class="quiz-card-image" [src]="quizImage(quiz)" [alt]="quiz.title">
              <div class="quiz-card-body">
                <div>
                  <strong>{{ quiz.title }}</strong>
                  <p class="card-description">{{ quiz.description || 'Quiz publicado na plataforma.' }}</p>
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
                </div>
              </div>
            </article>
          </div>
          <ng-template #noQuizzes><div class="empty-state">Sem quizzes publicados para mostrar.</div></ng-template>
        </article>

        <article class="table-card">
          <div class="card-header-inline">
            <div>
              <span class="eyebrow">Users management</span>
              <h2>Bloquear e desbloquear utilizadores</h2>
            </div>
            <span class="pill-status status-success">{{ users.length }} contas</span>
          </div>
          <div class="table-wrap">
            <table class="table-modern" *ngIf="users.length; else noUsers">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Estado</th>
                  <th>Acao</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of users">
                  <td>{{ user.name }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span class="pill-status" [class.status-success]="user.status === 'active'" [class.status-danger]="user.status !== 'active'">
                      {{ user.status === 'active' ? 'ativo' : 'bloqueado' }}
                    </span>
                  </td>
                  <td>
                    <button class="secondary-button" type="button" (click)="toggleUser(user)">
                      {{ user.status === 'active' ? 'Bloquear' : 'Desbloquear' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <ng-template #noUsers><div class="empty-state">Sem utilizadores encontrados.</div></ng-template>
        </article>

        <article class="table-card">
          <div class="card-header-inline">
            <div>
              <span class="eyebrow">System report</span>
              <h2>Gerar relatorio PDF</h2>
            </div>
          </div>
          <div class="form-stack">
            <p class="helper-copy">O relatorio inclui total de users, total de quizzes, melhor pontuador, data de emissao e ranking geral limitado pelo numero de participantes escolhido.</p>
            <div>
              <label class="field-label">Numero de participantes no ranking impresso</label>
              <input type="number" min="1" max="100" [(ngModel)]="participants">
            </div>
            <button class="primary-button" type="button" (click)="downloadReport()">Gerar PDF</button>
          </div>
        </article>
      </section>
    </section>
  `
})
export class AdminPageComponent {
  users: any[] = [];
  quizzes: any[] = [];
  summary = { users: 0, quizzes: 0 };
  bestScorer: any = { name: 'Sem dados' };
  participants = 10;
  selectedCategory = '';
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  constructor() {
    this.loadDashboard();
    this.loadUsers();
    this.loadQuizzes();
  }

  get categories() {
    return Array.from(new Set(this.quizzes.map((quiz) => quiz.category || 'Geral'))).sort();
  }

  get filteredQuizzes() {
    return this.quizzes.filter((quiz) => !this.selectedCategory || (quiz.category || 'Geral') === this.selectedCategory);
  }

  loadDashboard() {
    this.api.adminDashboard().subscribe({
      next: (response) => {
        this.summary = {
          users: response.summary?.users || 0,
          quizzes: response.summary?.quizzes || 0
        };
        this.bestScorer = response.best_scorer || { name: 'Sem dados' };
      },
      error: () => this.toast.error('Erro', 'Nao foi possivel carregar o painel administrativo.')
    });
  }

  loadUsers() {
    this.api.adminUsers().subscribe({
      next: (response) => {
        this.users = (response.users || []).filter((user: any) => user.role === 'user');
      },
      error: () => this.toast.error('Erro', 'Nao foi possivel carregar os utilizadores.')
    });
  }

  loadQuizzes() {
    this.api.quizzes().subscribe({
      next: (response) => this.quizzes = response.quizzes || [],
      error: () => this.toast.error('Erro', 'Nao foi possivel carregar os quizzes publicados.')
    });
  }

  toggleUser(user: any) {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    this.api.updateAdminUser(user.id, { status: nextStatus }).subscribe({
      next: () => {
        this.toast.success('Utilizador atualizado', nextStatus === 'inactive' ? 'Conta bloqueada com sucesso.' : 'Conta desbloqueada com sucesso.');
        this.loadUsers();
        this.loadDashboard();
      },
      error: (e) => this.toast.error('Falha na atualizacao', e.error?.message || 'Nao foi possivel atualizar o utilizador.')
    });
  }

  downloadReport() {
    this.api.adminReport({ participants: this.participants }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quizverse-relatorio-${new Date().toISOString().slice(0, 10)}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toast.success('Relatorio gerado', 'O PDF do sistema foi descarregado com sucesso.');
      },
      error: () => this.toast.error('Falha ao gerar PDF', 'Nao foi possivel emitir o relatorio do sistema.')
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
}

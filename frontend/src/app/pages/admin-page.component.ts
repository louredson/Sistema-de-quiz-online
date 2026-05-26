import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { ToastService } from '../core/toast.service';
import { UiService } from '../core/ui.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page-enter">
      <article class="hero-card">
        <span class="inline-tag">Dashboard</span>
        <h1 class="hero-title">{{ ui.t('Gestao completa da plataforma QuizVerse.', 'Complete QuizVerse platform management.') }}</h1>
        <p class="hero-copy">{{ ui.t('Aqui acompanhas utilizadores, relatorios e quizzes publicados num layout mais responsivo, sem separar a experiencia do resto da aplicacao.', 'Here you track users, reports, and published quizzes in a responsive layout without separating the experience from the rest of the app.') }}</p>
        <div class="hero-actions">
          <a routerLink="/create-quiz" class="primary-button">{{ ui.t('Criar quiz', 'Create quiz') }}</a>
          <a routerLink="/explore" class="secondary-button">{{ ui.t('Explorar quizzes', 'Explore quizzes') }}</a>
        </div>
        <div class="stat-cluster">
          <div class="stat-card"><strong>{{ summary.users }}</strong><span>{{ ui.t('Total de utilizadores', 'Total users') }}</span></div>
          <div class="stat-card"><strong>{{ summary.quizzes }}</strong><span>{{ ui.t('Total de quizzes', 'Total quizzes') }}</span></div>
          <div class="stat-card"><strong>{{ bestScorer.name || ui.t('Sem dados', 'No data') }}</strong><span>{{ ui.t('Melhor pontuador', 'Top scorer') }}</span></div>
        </div>
      </article>

      <section class="admin-grid" style="margin-top:1.25rem;">
        <article class="surface-card">
          <div class="card-header-inline">
            <div>
              <span class="eyebrow">{{ ui.t('Quizzes publicados', 'Published quizzes') }}</span>
              <h2>{{ ui.t('Catalogo da plataforma', 'Platform catalog') }}</h2>
            </div>
            <span class="pill-status status-success">{{ filteredQuizzes.length }} {{ ui.t('visiveis', 'visible') }}</span>
          </div>
          <div class="filter-row" style="margin-bottom:1rem;">
            <div style="flex:1; min-width:220px;">
              <label class="field-label">{{ ui.t('Filtrar por categoria', 'Filter by category') }}</label>
              <select [(ngModel)]="selectedCategory">
                <option value="">{{ ui.t('Todas', 'All') }}</option>
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
                  <p class="card-description">{{ quiz.description || ui.t('Quiz publicado na plataforma.', 'Quiz published on the platform.') }}</p>
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
                </div>
              </div>
            </article>
          </div>
          <ng-template #noQuizzes><div class="empty-state">{{ ui.t('Sem quizzes publicados para mostrar.', 'No published quizzes to show.') }}</div></ng-template>
        </article>

        <article class="table-card">
          <div class="card-header-inline">
            <div>
              <span class="eyebrow">{{ ui.t('Gestao de utilizadores', 'User management') }}</span>
              <h2>{{ ui.t('Bloquear e desbloquear utilizadores', 'Block and unblock users') }}</h2>
            </div>
            <span class="pill-status status-success">{{ users.length }} {{ ui.t('contas', 'accounts') }}</span>
          </div>
          <div class="table-wrap">
            <table class="table-modern" *ngIf="users.length; else noUsers">
              <thead>
                <tr>
                  <th>{{ ui.t('Nome', 'Name') }}</th>
                  <th>Email</th>
                  <th>{{ ui.t('Estado', 'Status') }}</th>
                  <th>{{ ui.t('Acao', 'Action') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of users">
                  <td>{{ user.name }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span class="pill-status" [class.status-success]="user.status === 'active'" [class.status-danger]="user.status !== 'active'">
                      {{ user.status === 'active' ? ui.t('Ativo', 'Active') : ui.t('Bloqueado', 'Blocked') }}
                    </span>
                  </td>
                  <td>
                    <button class="secondary-button" type="button" (click)="toggleUser(user)">
                      {{ user.status === 'active' ? ui.t('Bloquear', 'Block') : ui.t('Desbloquear', 'Unblock') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <ng-template #noUsers><div class="empty-state">{{ ui.t('Sem utilizadores encontrados.', 'No users found.') }}</div></ng-template>
        </article>

        <article class="table-card">
          <div class="card-header-inline">
            <div>
              <span class="eyebrow">{{ ui.t('Relatorio do sistema', 'System report') }}</span>
              <h2>{{ ui.t('Gerar relatorio PDF', 'Generate PDF report') }}</h2>
            </div>
          </div>
          <div class="form-stack">
            <p class="helper-copy">{{ ui.t('O relatorio inclui total de utilizadores, total de quizzes, melhor pontuador, data de emissao e ranking geral limitado pelo numero de participantes escolhido.', 'The report includes total users, total quizzes, top scorer, issue date, and a general ranking limited by the chosen number of participants.') }}</p>
            <div>
              <label class="field-label">{{ ui.t('Numero de participantes no ranking impresso', 'Number of participants in the printed ranking') }}</label>
              <input type="number" min="1" max="100" [(ngModel)]="participants">
            </div>
            <button class="primary-button" type="button" (click)="downloadReport()">{{ ui.t('Gerar PDF', 'Generate PDF') }}</button>
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
  readonly ui = inject(UiService);
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  constructor() {
    this.loadDashboard();
    this.loadUsers();
    this.loadQuizzes();
  }

  get categories() {
    return Array.from(new Set(this.quizzes.map((quiz) => quiz.category || this.ui.t('Conhecimento geral', 'General knowledge')))).sort();
  }

  get filteredQuizzes() {
    return this.quizzes.filter((quiz) => !this.selectedCategory || (quiz.category || this.ui.t('Conhecimento geral', 'General knowledge')) === this.selectedCategory);
  }

  loadDashboard() {
    this.api.adminDashboard().subscribe({
      next: (response) => {
        this.summary = {
          users: response.summary?.users || 0,
          quizzes: response.summary?.quizzes || 0
        };
        this.bestScorer = response.best_scorer || { name: this.ui.t('Sem dados', 'No data') };
      },
      error: () => this.toast.error(this.ui.t('Erro', 'Error'), this.ui.t('Nao foi possivel carregar o painel administrativo.', 'Could not load the administrative dashboard.'))
    });
  }

  loadUsers() {
    this.api.adminUsers().subscribe({
      next: (response) => {
        this.users = (response.users || []).filter((user: any) => user.role === 'user');
      },
      error: () => this.toast.error(this.ui.t('Erro', 'Error'), this.ui.t('Nao foi possivel carregar os utilizadores.', 'Could not load users.'))
    });
  }

  loadQuizzes() {
    this.api.quizzes().subscribe({
      next: (response) => this.quizzes = response.quizzes || [],
      error: () => this.toast.error(this.ui.t('Erro', 'Error'), this.ui.t('Nao foi possivel carregar os quizzes publicados.', 'Could not load published quizzes.'))
    });
  }

  toggleUser(user: any) {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    this.api.updateAdminUser(user.id, { status: nextStatus }).subscribe({
      next: () => {
        this.toast.success(this.ui.t('Utilizador atualizado', 'User updated'), nextStatus === 'inactive' ? this.ui.t('Conta bloqueada com sucesso.', 'Account blocked successfully.') : this.ui.t('Conta desbloqueada com sucesso.', 'Account unblocked successfully.'));
        this.loadUsers();
        this.loadDashboard();
      },
      error: (e) => this.toast.error(this.ui.t('Falha na atualizacao', 'Update failed'), e.error?.message || this.ui.t('Nao foi possivel atualizar o utilizador.', 'Could not update the user.'))
    });
  }

  downloadReport() {
    this.api.adminReport({ participants: this.participants }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quizverse-report-${new Date().toISOString().slice(0, 10)}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toast.success(this.ui.t('Relatorio gerado', 'Report generated'), this.ui.t('O PDF do sistema foi descarregado com sucesso.', 'The system PDF was downloaded successfully.'));
      },
      error: () => this.toast.error(this.ui.t('Falha ao gerar PDF', 'Failed to generate PDF'), this.ui.t('Nao foi possivel emitir o relatorio do sistema.', 'Could not generate the system report.'))
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
}

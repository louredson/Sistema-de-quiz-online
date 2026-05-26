import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ApiService } from '../core/api.service';
import { UiService } from '../core/ui.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-enter ranking-layout">
      <article class="panel-card">
        <div class="card-header">
          <div>
            <span class="eyebrow">{{ ui.t('Ranking global', 'Global leaderboard') }}</span>
            <h2>{{ ui.t('Top jogadores da plataforma', 'Top players on the platform') }}</h2>
            <p class="helper-copy">{{ ui.t('Ranking baseado em pontuacao total, melhor score e media de desempenho.', 'Leaderboard based on total score, best score, and average performance.') }}</p>
          </div>
        </div>

        <div class="ranking-podium" *ngIf="rows.length; else noRanking">
          <div class="rank-podium-item" *ngFor="let row of rows.slice(0, 3); let idx = index">
            <div class="topbar-left">
              <span class="rank-badge" [class.rank-gold]="idx === 0" [class.rank-silver]="idx === 1" [class.rank-bronze]="idx === 2">{{ row.position }}</span>
              <div class="quiz-meta">
                <strong>{{ row.name }}</strong>
                <span>{{ row.attempts }} {{ ui.t('tentativas', 'attempts') }} · {{ ui.t('media', 'average') }} {{ row.avg_score }} pts</span>
              </div>
            </div>
            <span class="pill-status status-success">{{ row.total_score }} pts</span>
          </div>
        </div>

        <ng-template #noRanking>
          <div class="empty-state">{{ ui.t('O ranking global ainda nao tem dados suficientes.', 'The global leaderboard does not have enough data yet.') }}</div>
        </ng-template>
      </article>

      <article class="table-card">
        <div class="card-header-inline">
          <div>
            <span class="eyebrow">{{ ui.t('Tabela do ranking', 'Ranking table') }}</span>
            <h2>{{ ui.t('Tabela completa', 'Full table') }}</h2>
          </div>
          <span class="pill-status status-warning">Top 100</span>
        </div>

        <div class="table-wrap">
          <table class="table-modern" *ngIf="rows.length; else noTable">
            <thead>
              <tr>
                <th>#</th>
                <th>{{ ui.t('Jogador', 'Player') }}</th>
                <th>{{ ui.t('Total', 'Total') }}</th>
                <th>{{ ui.t('Melhor', 'Best') }}</th>
                <th>{{ ui.t('Media', 'Average') }}</th>
                <th>{{ ui.t('Tentativas', 'Attempts') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of rows">
                <td>{{ row.position }}</td>
                <td>{{ row.name }}</td>
                <td>{{ row.total_score }}</td>
                <td>{{ row.best_score }} pts</td>
                <td>{{ row.avg_score }} pts</td>
                <td>{{ row.attempts }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #noTable>
          <div class="empty-state">{{ ui.t('Ainda nao existem jogadores suficientes para apresentar a tabela.', 'There are not enough players yet to show the table.') }}</div>
        </ng-template>
      </article>
    </section>
  `
})
export class RankingPageComponent {
  rows: any[] = [];
  private readonly api = inject(ApiService);
  readonly ui = inject(UiService);

  constructor() {
    this.api.ranking().subscribe((response) => this.rows = response.ranking || []);
  }
}

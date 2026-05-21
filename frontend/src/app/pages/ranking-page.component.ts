import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ApiService } from '../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-enter ranking-layout">
      <article class="panel-card">
        <div class="card-header">
          <div>
            <span class="eyebrow">Global leaderboard</span>
            <h2>Top jogadores da plataforma</h2>
            <p class="helper-copy">Ranking baseado em pontuacao total, melhor score e media de desempenho.</p>
          </div>
        </div>

        <div class="ranking-podium" *ngIf="rows.length; else noRanking">
          <div class="rank-podium-item" *ngFor="let row of rows.slice(0, 3); let idx = index">
            <div class="topbar-left">
              <span class="rank-badge" [class.rank-gold]="idx === 0" [class.rank-silver]="idx === 1" [class.rank-bronze]="idx === 2">{{ row.position }}</span>
              <div class="quiz-meta">
                <strong>{{ row.name }}</strong>
                <span>{{ row.attempts }} tentativas · media {{ row.avg_score }}%</span>
              </div>
            </div>
            <span class="pill-status status-success">{{ row.total_score }} pts</span>
          </div>
        </div>

        <ng-template #noRanking>
          <div class="empty-state">O ranking global ainda nao tem dados suficientes.</div>
        </ng-template>
      </article>

      <article class="table-card">
        <div class="card-header-inline">
          <div>
            <span class="eyebrow">Ranking table</span>
            <h2>Tabela completa</h2>
          </div>
          <span class="pill-status status-warning">Top 100</span>
        </div>

        <div class="table-wrap">
          <table class="table-modern" *ngIf="rows.length; else noTable">
            <thead>
              <tr>
                <th>#</th>
                <th>Jogador</th>
                <th>Total</th>
                <th>Melhor</th>
                <th>Media</th>
                <th>Tentativas</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of rows">
                <td>{{ row.position }}</td>
                <td>{{ row.name }}</td>
                <td>{{ row.total_score }}</td>
                <td>{{ row.best_score }}%</td>
                <td>{{ row.avg_score }}%</td>
                <td>{{ row.attempts }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #noTable>
          <div class="empty-state">Ainda nao existem jogadores suficientes para apresentar a tabela.</div>
        </ng-template>
      </article>
    </section>
  `
})
export class RankingPageComponent {
  rows: any[] = [];
  private readonly api = inject(ApiService);

  constructor() {
    this.api.ranking().subscribe((response) => this.rows = response.ranking || []);
  }
}
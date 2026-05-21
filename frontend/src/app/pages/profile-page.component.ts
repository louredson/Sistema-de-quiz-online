import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ApiService } from '../core/api.service';
import { SessionService } from '../core/session.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-enter profile-grid">
      <article class="hero-card">
        <span class="inline-tag">Player profile</span>
        <h1 class="hero-title">{{ data?.profile?.name || session.user()?.name }}</h1>
        <p class="hero-copy">Centro pessoal com estatisticas, posicao global e informacao da conta.</p>
        <div class="stat-cluster">
          <div class="stat-card"><strong>#{{ data?.stats?.global_rank || '-' }}</strong><span>Ranking global</span></div>
          <div class="stat-card"><strong>{{ data?.stats?.best_score || 0 }}%</strong><span>Melhor score</span></div>
          <div class="stat-card"><strong>{{ data?.stats?.total_attempts || 0 }}</strong><span>Total de jogos</span></div>
        </div>
      </article>

      <article class="panel-card">
        <div class="card-header">
          <div>
            <span class="eyebrow">Account details</span>
            <h2>Informacoes do perfil</h2>
          </div>
        </div>
        <div class="feed-list">
          <div class="feed-item"><strong>Email</strong><span>{{ data?.profile?.email }}</span></div>
          <div class="feed-item"><strong>Tipo de conta</strong><span>{{ data?.profile?.role }}</span></div>
          <div class="feed-item"><strong>Media geral</strong><span>{{ data?.stats?.avg_score || 0 }}%</span></div>
          <div class="feed-item"><strong>Criada em</strong><span>{{ data?.profile?.created_at | date:'medium' }}</span></div>
        </div>
      </article>
    </section>
  `
})
export class ProfilePageComponent {
  data: any = null;
  readonly session = inject(SessionService);
  private readonly api = inject(ApiService);

  constructor() {
    this.api.profile().subscribe((response) => this.data = response);
  }
}
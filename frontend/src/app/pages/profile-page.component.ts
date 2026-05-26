import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ApiService } from '../core/api.service';
import { SessionService } from '../core/session.service';
import { UiService } from '../core/ui.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-enter profile-grid">
      <article class="hero-card">
        <span class="inline-tag">{{ ui.t('Perfil do jogador', 'Player profile') }}</span>
        <h1 class="hero-title">{{ data?.profile?.name || session.user()?.name }}</h1>
        <p class="hero-copy">{{ ui.t('Centro pessoal com estatisticas, posicao global e informacao da conta.', 'Personal hub with stats, global ranking, and account information.') }}</p>
        <div class="stat-cluster">
          <div class="stat-card"><strong>#{{ data?.stats?.global_rank || '-' }}</strong><span>{{ ui.t('Ranking global', 'Global ranking') }}</span></div>
          <div class="stat-card"><strong>{{ data?.stats?.best_score || 0 }} pts</strong><span>{{ ui.t('Melhor score', 'Best score') }}</span></div>
          <div class="stat-card"><strong>{{ data?.stats?.total_attempts || 0 }}</strong><span>{{ ui.t('Total de jogos', 'Total games') }}</span></div>
        </div>
      </article>

      <article class="panel-card">
        <div class="card-header">
          <div>
            <span class="eyebrow">{{ ui.t('Detalhes da conta', 'Account details') }}</span>
            <h2>{{ ui.t('Informacoes do perfil', 'Profile information') }}</h2>
          </div>
        </div>
        <div class="feed-list">
          <div class="feed-item"><strong>Email</strong><span>{{ data?.profile?.email }}</span></div>
          <div class="feed-item"><strong>{{ ui.t('Tipo de conta', 'Account type') }}</strong><span>{{ data?.profile?.role }}</span></div>
          <div class="feed-item"><strong>{{ ui.t('Media geral', 'Average score') }}</strong><span>{{ data?.stats?.avg_score || 0 }} pts</span></div>
          <div class="feed-item"><strong>{{ ui.t('Criada em', 'Created at') }}</strong><span>{{ data?.profile?.created_at | date:'medium' }}</span></div>
        </div>
      </article>
    </section>
  `
})
export class ProfilePageComponent {
  data: any = null;
  readonly session = inject(SessionService);
  readonly ui = inject(UiService);
  private readonly api = inject(ApiService);

  constructor() {
    this.api.profile().subscribe((response) => this.data = response);
  }
}

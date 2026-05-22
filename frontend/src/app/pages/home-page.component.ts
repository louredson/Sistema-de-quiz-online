import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { SessionService } from '../core/session.service';
import { ToastService } from '../core/toast.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-enter" *ngIf="!session.user(); else dashboardView">
      <article class="hero-card">
        <span class="inline-tag">QuizVerse</span>
        <h1 class="hero-title">Quizzes da comunidade, organizados para explorar e competir.</h1>
        <p class="hero-copy">
          Descobre quizzes em destaque, acompanha categorias populares e entra numa plataforma onde estudar e competir acontecem no mesmo fluxo.
        </p>
        <div class="hero-actions">
          <a routerLink="/register" class="primary-button">Criar conta</a>
          <a routerLink="/explore" class="secondary-button">Explorar quizzes</a>
        </div>
        <div class="badge-row">
          <span class="badge">{{ quizzes.length }} quizzes publicados</span>
          <span class="badge">Ranking global em tempo real</span>
          <span class="badge">Criacao de quizzes com IA</span>
        </div>
      </article>

      <section class="surface-card" style="margin-top:1.25rem;">
        <div class="card-header-inline">
          <div>
            <span class="eyebrow">Destaques</span>
            <h2>Quizzes para comecar agora</h2>
          </div>
          <a routerLink="/explore" class="secondary-button">Ver tudo</a>
        </div>
        <div class="quiz-card-grid" *ngIf="featuredQuizzes.length; else noQuizGuest">
          <article class="quiz-card" *ngFor="let quiz of featuredQuizzes">
            <img class="quiz-card-image" [src]="quizImage(quiz)" [alt]="quiz.title">
            <div class="quiz-card-body">
              <div>
                <strong>{{ quiz.title }}</strong>
                <p class="card-description">{{ quiz.description || 'Quiz publicado pela comunidade para praticar e competir.' }}</p>
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
                <button class="action-pill" type="button" (click)="goToLoginForQuiz()">Fazer quiz</button>
              </div>
            </div>
          </article>
        </div>
        <ng-template #noQuizGuest>
          <div class="empty-state">Ainda nao ha quizzes publicados.</div>
        </ng-template>
      </section>

      <section class="dashboard-grid" style="margin-top:1.25rem;">
        <article class="surface-card">
          <div class="card-header">
            <div>
              <span class="eyebrow">Categorias</span>
              <h2>Temas mais ativos</h2>
            </div>
          </div>
          <div class="chip-grid" *ngIf="categorySummaries.length; else noCategoryGuest">
            <div class="category-chip" *ngFor="let item of categorySummaries">
              <strong>{{ item.name }}</strong>
              <span>{{ item.count }} quizzes</span>
            </div>
          </div>
          <ng-template #noCategoryGuest>
            <div class="empty-state">As categorias vao aparecer assim que houver mais quizzes publicados.</div>
          </ng-template>
        </article>

        <article class="surface-card">
          <div class="card-header">
            <div>
              <span class="eyebrow">Como funciona</span>
              <h2>Fluxo simples da plataforma</h2>
            </div>
          </div>
          <div class="feed-list">
            <article class="feed-item compact-feed-item">
              <strong>1. Explora quizzes publicados</strong>
              <span>Encontra temas em alta, recentes e organizados por categoria.</span>
            </article>
            <article class="feed-item compact-feed-item">
              <strong>2. Entra e participa</strong>
              <span>As tuas pontuacoes, historico e ranking ficam ligados ao teu perfil.</span>
            </article>
            <article class="feed-item compact-feed-item">
              <strong>3. Cria com IA</strong>
              <span>Gera novos quizzes com Gemini API e publica quando estiveres pronto.</span>
            </article>
          </div>
        </article>
      </section>
    </section>

    <ng-template #dashboardView>
      <section class="page-enter" *ngIf="session.user()?.role === 'admin'; else playerDashboard">
        <article class="hero-card">
          <span class="inline-tag">Administracao</span>
          <h1 class="hero-title">Area reservada ao administrador.</h1>
          <p class="hero-copy">O administrador gere utilizadores, relatorios e tambem pode criar quizzes para a plataforma a partir da mesma experiencia visual.</p>
          <div class="hero-actions">
            <a routerLink="/admin" class="primary-button">Abrir dashboard</a>
            <a routerLink="/create-quiz" class="secondary-button">Criar quiz</a>
          </div>
        </article>
      </section>

      <ng-template #playerDashboard>
      <section class="page-enter">
        <article class="hero-card">
          <span class="inline-tag">Dashboard pessoal</span>
          <h1 class="hero-title">Bem-vindo, {{ session.user()?.name }}.</h1>
          <p class="hero-copy">Explora quizzes em feed, acompanha o teu ranking e cria novos desafios com apoio de IA.</p>
          <div class="hero-actions">
            <a routerLink="/create-quiz" class="primary-button">Criar quiz com IA</a>
            <a routerLink="/explore" class="secondary-button">Explorar quizzes</a>
          </div>
          <div class="stat-cluster">
            <div class="stat-card"><strong>{{ profile?.stats?.best_score || 0 }}%</strong><span>Melhor score</span></div>
            <div class="stat-card"><strong>#{{ profile?.stats?.global_rank || '-' }}</strong><span>Posicao global</span></div>
            <div class="stat-card"><strong>{{ profile?.stats?.total_attempts || 0 }}</strong><span>Tentativas</span></div>
          </div>
        </article>

        <section class="surface-card" style="margin-top:1.25rem;">
          <div class="card-header-inline">
            <div>
              <span class="eyebrow">Feed de quizzes</span>
              <h2>Publicado recentemente</h2>
            </div>
            <span class="timer-chip" *ngIf="currentQuiz">Tempo {{ timer }}s</span>
          </div>

          <div class="quiz-card-grid" *ngIf="!currentQuiz && featuredQuizzes.length; else quizStageOrEmpty">
            <article class="quiz-card" *ngFor="let quiz of featuredQuizzes">
              <img class="quiz-card-image" [src]="quizImage(quiz)" [alt]="quiz.title">
              <div class="quiz-card-body">
                <div>
                  <strong>{{ quiz.title }}</strong>
                  <p class="card-description">{{ quiz.description || 'Quiz pronto para jogar e somar pontos no ranking.' }}</p>
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
                  <button class="action-pill" type="button" (click)="start(quiz.id)">Iniciar quiz</button>
                </div>
              </div>
            </article>
          </div>

          <ng-template #quizStageOrEmpty>
            <div class="empty-state" *ngIf="!currentQuiz && !featuredQuizzes.length">Nao existem quizzes publicados.</div>
            <article class="quiz-stage" *ngIf="currentQuiz">
              <div>
                <div class="card-header-inline">
                  <div>
                    <span class="eyebrow">{{ currentQuiz.category }}</span>
                    <h2>{{ currentQuiz.title }}</h2>
                  </div>
                  <span class="pill-status" [class.status-warning]="timer <= 15" [class.status-success]="timer > 15">{{ answeredCount }}/{{ totalQuestions }} respondidas</span>
                </div>
                <div class="progress-shell"><div class="progress-bar" [style.width.%]="progress"></div></div>
              </div>

              <div class="question-card" *ngFor="let question of currentQuiz.questions; let i = index">
                <strong>{{ i + 1 }}. {{ question.question_text }}</strong>
                <div class="list-stack" style="margin-top:0.9rem;">
                  <label class="answer-choice" *ngFor="let option of question.options" [class.active]="answers[question.id] === option.id">
                    <input type="radio" [name]="'q' + question.id" [checked]="answers[question.id] === option.id" (change)="selectOption(question.id, option.id)">
                    <span>{{ option.option_text }}</span>
                  </label>
                </div>
              </div>

              <button class="primary-button" type="button" (click)="submit()">Submeter respostas</button>
              <div class="result-banner" *ngIf="result">
                <span class="eyebrow">Resultado</span>
                <strong>{{ result.score }}%</strong>
                <span>Acertaste {{ result.correct_answers }} de {{ result.total_questions }} perguntas.</span>
              </div>
            </article>
          </ng-template>
        </section>
      </section>
      </ng-template>
    </ng-template>
  `
})
export class HomePageComponent implements OnInit, OnDestroy {
  readonly api = inject(ApiService);
  readonly session = inject(SessionService);
  readonly toast = inject(ToastService);
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);

  quizzes: any[] = [];
  ranking: any[] = [];
  profile: any = null;
  currentQuiz: any = null;
  answers: Record<string, number> = {};
  result: any = null;
  timer = 60;
  pendingQuizId: number | null = null;
  private timerRef: any = null;

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const play = Number(params.get('play'));
      this.pendingQuizId = Number.isFinite(play) && play > 0 ? play : null;
      if (this.pendingQuizId && this.session.user()?.role === 'user' && this.quizzes.length) {
        this.start(this.pendingQuizId);
      }
    });
  }

  ngOnInit() {
    this.loadQuizzes();
    if (this.session.user()) {
      this.loadPrivateData();
    }
  }

  get answeredCount() {
    return Object.keys(this.answers).length;
  }

  get totalQuestions() {
    return this.currentQuiz?.questions?.length || 0;
  }

  get progress() {
    if (!this.totalQuestions) {
      return 0;
    }
    return Math.round((this.answeredCount / this.totalQuestions) * 100);
  }

  get featuredQuizzes() {
    return this.quizzes.slice(0, 6);
  }

  get categorySummaries() {
    const map = new Map<string, number>();
    for (const quiz of this.quizzes) {
      const key = quiz.category || 'Geral';
      map.set(key, (map.get(key) || 0) + 1);
    }

    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
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
      next: (response) => {
        this.quizzes = response.quizzes || [];
        if (this.pendingQuizId && this.session.user()?.role === 'user') {
          this.start(this.pendingQuizId);
          this.pendingQuizId = null;
        }
      },
      error: () => this.toast.error('Conexao perdida', 'Nao foi possivel carregar os quizzes.')
    });
  }

  loadPrivateData() {
    this.api.profile().subscribe({ next: (response) => this.profile = response });
    this.api.ranking().subscribe({ next: (response) => this.ranking = response.ranking || [] });
  }

  goToLoginForQuiz() {
    this.toast.info('Login necessario', 'Entra primeiro para responder a este quiz.');
    this.router.navigateByUrl('/login');
  }

  start(id: number) {
    this.answers = {};
    this.result = null;
    this.api.quiz(id).subscribe({
      next: (response) => {
        this.currentQuiz = response.quiz;
        this.timer = Math.max(30, (this.currentQuiz.questions?.length || 1) * 20);
        this.startTimer();
        this.toast.info('Quiz iniciado', 'Boa sorte. O tempo ja comecou a contar.');
      },
      error: () => this.toast.error('Erro', 'Nao foi possivel abrir o quiz selecionado.')
    });
  }

  selectOption(questionId: number, optionId: number) {
    this.answers = { ...this.answers, [questionId]: optionId };
  }

  submit() {
    if (!this.currentQuiz) {
      return;
    }

    this.api.submit(this.currentQuiz.id, this.answers).subscribe({
      next: (response) => {
        this.result = response.result;
        this.stopTimer();
        this.toast.success('Quiz concluido', 'Pontuacao registada com sucesso.');
        this.loadPrivateData();
      },
      error: () => this.toast.error('Falha ao submeter', 'Verifica a ligacao e tenta novamente.')
    });
  }

  startTimer() {
    this.stopTimer();
    this.timerRef = setInterval(() => {
      this.timer -= 1;
      if (this.timer <= 0) {
        this.stopTimer();
        this.toast.warning('Tempo esgotado', 'O quiz foi submetido automaticamente.');
        this.submit();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerRef) {
      clearInterval(this.timerRef);
      this.timerRef = null;
    }
  }

  ngOnDestroy() {
    this.stopTimer();
  }
}

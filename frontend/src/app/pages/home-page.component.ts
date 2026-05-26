import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { SessionService } from '../core/session.service';
import { ToastService } from '../core/toast.service';
import { UiService } from '../core/ui.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-enter" *ngIf="!session.user(); else dashboardView">
      <article class="hero-card">
        <span class="inline-tag">QuizVerse</span>
        <h1 class="hero-title">{{ ui.t('Quizzes da comunidade, organizados para explorar e competir.', 'Community quizzes, organized for exploration and competition.') }}</h1>
        <p class="hero-copy">
          {{ ui.t('Descobre quizzes em destaque, acompanha categorias populares e entra numa plataforma onde estudar e competir acontecem no mesmo fluxo.', 'Discover featured quizzes, follow popular categories, and use a platform where learning and competition happen in the same flow.') }}
        </p>
        <div class="hero-actions">
          <a routerLink="/register" class="primary-button">{{ ui.t('Criar conta', 'Create account') }}</a>
          <a routerLink="/explore" class="secondary-button">{{ ui.t('Explorar quizzes', 'Explore quizzes') }}</a>
        </div>
        <div class="badge-row">
          <span class="badge">{{ quizzes.length }} {{ ui.t('quizzes publicados', 'published quizzes') }}</span>
          <span class="badge">{{ ui.t('Ranking global em tempo real', 'Real-time global leaderboard') }}</span>
          <span class="badge">{{ ui.t('Criacao de quizzes com IA', 'AI quiz creation') }}</span>
        </div>
      </article>

      <section class="surface-card" style="margin-top:1.25rem;">
        <div class="card-header-inline">
          <div>
            <span class="eyebrow">{{ ui.t('Destaques', 'Highlights') }}</span>
            <h2>{{ ui.t('Quizzes para comecar agora', 'Quizzes to start right now') }}</h2>
          </div>
          <a routerLink="/explore" class="secondary-button">{{ ui.t('Ver tudo', 'View all') }}</a>
        </div>
        <div class="quiz-card-grid" *ngIf="featuredQuizzes.length; else noQuizGuest">
          <article class="quiz-card" *ngFor="let quiz of featuredQuizzes">
            <img class="quiz-card-image" [src]="quizImage(quiz)" [alt]="quiz.title">
            <div class="quiz-card-body">
              <div>
                <strong>{{ quiz.title }}</strong>
                <p class="card-description">{{ quiz.description || ui.t('Quiz publicado pela comunidade para praticar e competir.', 'Quiz published by the community for practice and competition.') }}</p>
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
                <button class="action-pill" type="button" (click)="goToLoginForQuiz()">{{ ui.t('Fazer quiz', 'Take quiz') }}</button>
              </div>
            </div>
          </article>
        </div>
        <ng-template #noQuizGuest>
          <div class="empty-state">{{ ui.t('Ainda nao ha quizzes publicados.', 'There are no published quizzes yet.') }}</div>
        </ng-template>
      </section>

      <section class="dashboard-grid" style="margin-top:1.25rem;">
        <article class="surface-card">
          <div class="card-header">
            <div>
              <span class="eyebrow">{{ ui.t('Categorias', 'Categories') }}</span>
              <h2>{{ ui.t('Temas mais ativos', 'Most active topics') }}</h2>
            </div>
          </div>
          <div class="chip-grid" *ngIf="categorySummaries.length; else noCategoryGuest">
            <div class="category-chip" *ngFor="let item of categorySummaries">
              <strong>{{ item.name }}</strong>
              <span>{{ item.count }} {{ ui.t('quizzes', 'quizzes') }}</span>
            </div>
          </div>
          <ng-template #noCategoryGuest>
            <div class="empty-state">{{ ui.t('As categorias vao aparecer assim que houver mais quizzes publicados.', 'Categories will appear as soon as there are more published quizzes.') }}</div>
          </ng-template>
        </article>

        <article class="surface-card">
          <div class="card-header">
            <div>
              <span class="eyebrow">{{ ui.t('Como funciona', 'How it works') }}</span>
              <h2>{{ ui.t('Fluxo simples da plataforma', 'Simple platform flow') }}</h2>
            </div>
          </div>
          <div class="feed-list">
            <article class="feed-item compact-feed-item">
              <strong>{{ ui.t('1. Explora quizzes publicados', '1. Explore published quizzes') }}</strong>
              <span>{{ ui.t('Encontra temas em alta, recentes e organizados por categoria.', 'Find trending, recent quizzes organized by category.') }}</span>
            </article>
            <article class="feed-item compact-feed-item">
              <strong>{{ ui.t('2. Entra e participa', '2. Sign in and participate') }}</strong>
              <span>{{ ui.t('As tuas pontuacoes, historico e ranking ficam ligados ao teu perfil.', 'Your scores, history, and ranking stay connected to your profile.') }}</span>
            </article>
            <article class="feed-item compact-feed-item">
              <strong>{{ ui.t('3. Cria com IA', '3. Create with AI') }}</strong>
              <span>{{ ui.t('Gera novos quizzes com Gemini API e publica quando estiveres pronto.', 'Generate new quizzes with Gemini API and publish when you are ready.') }}</span>
            </article>
          </div>
        </article>
      </section>
    </section>

    <ng-template #dashboardView>
      <section class="page-enter" *ngIf="session.user()?.role === 'admin'; else playerDashboard">
        <article class="hero-card">
          <span class="inline-tag">{{ ui.t('Administracao', 'Administration') }}</span>
          <h1 class="hero-title">{{ ui.t('Area reservada ao administrador.', 'Area reserved for the administrator.') }}</h1>
          <p class="hero-copy">{{ ui.t('O administrador gere utilizadores, relatorios e tambem pode criar quizzes para a plataforma a partir da mesma experiencia visual.', 'The administrator manages users, reports, and can also create quizzes for the platform from the same visual experience.') }}</p>
          <div class="hero-actions">
            <a routerLink="/admin" class="primary-button">{{ ui.t('Abrir dashboard', 'Open dashboard') }}</a>
            <a routerLink="/create-quiz" class="secondary-button">{{ ui.t('Criar quiz', 'Create quiz') }}</a>
          </div>
        </article>
      </section>

      <ng-template #playerDashboard>
        <section class="page-enter">
          <article class="hero-card">
            <span class="inline-tag">{{ ui.t('Dashboard pessoal', 'Personal dashboard') }}</span>
            <h1 class="hero-title">{{ ui.t('Bem-vindo,', 'Welcome,') }} {{ session.user()?.name }}.</h1>
            <p class="hero-copy">{{ ui.t('Explora quizzes em feed, acompanha o teu ranking e cria novos desafios com apoio de IA.', 'Explore quizzes in a feed, track your ranking, and create new challenges with AI support.') }}</p>
            <div class="hero-actions">
              <a routerLink="/create-quiz" class="primary-button">{{ ui.t('Criar quiz com IA', 'Create quiz with AI') }}</a>
              <a routerLink="/explore" class="secondary-button">{{ ui.t('Explorar quizzes', 'Explore quizzes') }}</a>
            </div>
            <div class="stat-cluster">
              <div class="stat-card"><strong>{{ profile?.stats?.best_score || 0 }}%</strong><span>{{ ui.t('Melhor score', 'Best score') }}</span></div>
              <div class="stat-card"><strong>#{{ profile?.stats?.global_rank || '-' }}</strong><span>{{ ui.t('Posicao global', 'Global rank') }}</span></div>
              <div class="stat-card"><strong>{{ profile?.stats?.total_attempts || 0 }}</strong><span>{{ ui.t('Tentativas', 'Attempts') }}</span></div>
            </div>
          </article>

          <section class="surface-card" style="margin-top:1.25rem;">
            <div class="card-header-inline">
              <div>
                <span class="eyebrow">{{ ui.t('Feed de quizzes', 'Quiz feed') }}</span>
                <h2>{{ ui.t('Publicado recentemente', 'Recently published') }}</h2>
              </div>
              <span class="timer-chip" *ngIf="currentQuiz">{{ ui.t('Tempo', 'Time') }} {{ timer }}s</span>
            </div>

            <div class="quiz-card-grid" *ngIf="!currentQuiz && featuredQuizzes.length; else quizStageOrEmpty">
              <article class="quiz-card" *ngFor="let quiz of featuredQuizzes">
                <img class="quiz-card-image" [src]="quizImage(quiz)" [alt]="quiz.title">
                <div class="quiz-card-body">
                  <div>
                    <strong>{{ quiz.title }}</strong>
                    <p class="card-description">{{ quiz.description || ui.t('Quiz pronto para jogar e somar pontos no ranking.', 'Quiz ready to play and earn ranking points.') }}</p>
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
                    <button class="action-pill" type="button" (click)="start(quiz.id)">{{ ui.t('Iniciar quiz', 'Start quiz') }}</button>
                  </div>
                </div>
              </article>
            </div>

            <ng-template #quizStageOrEmpty>
              <div class="empty-state" *ngIf="!currentQuiz && !featuredQuizzes.length">{{ ui.t('Nao existem quizzes publicados.', 'There are no published quizzes.') }}</div>
              <article class="quiz-stage" *ngIf="currentQuiz">
                <div>
                  <div class="card-header-inline">
                    <div>
                      <span class="eyebrow">{{ currentQuiz.category }}</span>
                      <h2>{{ currentQuiz.title }}</h2>
                    </div>
                    <span class="pill-status" [class.status-warning]="timer <= 15" [class.status-success]="timer > 15">{{ answeredCount }}/{{ totalQuestions }} {{ ui.t('respondidas', 'answered') }}</span>
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

                <button class="primary-button" type="button" (click)="submit()">{{ ui.t('Submeter respostas', 'Submit answers') }}</button>
                <div class="result-banner" *ngIf="result">
                  <span class="eyebrow">{{ ui.t('Resultado', 'Result') }}</span>
                  <strong>{{ result.score }}%</strong>
                  <span>{{ ui.t('Acertaste', 'You got') }} {{ result.correct_answers }} {{ ui.t('de', 'out of') }} {{ result.total_questions }} {{ ui.t('perguntas.', 'questions.') }}</span>
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
  readonly ui = inject(UiService);

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
      const key = quiz.category || this.ui.t('Conhecimento geral', 'General knowledge');
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
      next: (response) => {
        this.quizzes = response.quizzes || [];
        if (this.pendingQuizId && this.session.user()?.role === 'user') {
          this.start(this.pendingQuizId);
          this.pendingQuizId = null;
        }
      },
      error: () => this.toast.error(this.ui.t('Conexao perdida', 'Connection lost'), this.ui.t('Nao foi possivel carregar os quizzes.', 'Could not load the quizzes.'))
    });
  }

  loadPrivateData() {
    this.api.profile().subscribe({ next: (response) => this.profile = response });
    this.api.ranking().subscribe({ next: (response) => this.ranking = response.ranking || [] });
  }

  goToLoginForQuiz() {
    this.toast.info(this.ui.t('Login necessario', 'Login required'), this.ui.t('Entra primeiro para responder a este quiz.', 'Sign in first to answer this quiz.'));
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
        this.toast.info(this.ui.t('Quiz iniciado', 'Quiz started'), this.ui.t('Boa sorte. O tempo ja comecou a contar.', 'Good luck. The timer has already started.'));
      },
      error: () => this.toast.error(this.ui.t('Erro', 'Error'), this.ui.t('Nao foi possivel abrir o quiz selecionado.', 'Could not open the selected quiz.'))
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
        this.toast.success(this.ui.t('Quiz concluido', 'Quiz completed'), this.ui.t('Pontuacao registada com sucesso.', 'Score recorded successfully.'));
        this.loadPrivateData();
      },
      error: () => this.toast.error(this.ui.t('Falha ao submeter', 'Failed to submit'), this.ui.t('Verifica a ligacao e tenta novamente.', 'Check your connection and try again.'))
    });
  }

  startTimer() {
    this.stopTimer();
    this.timerRef = setInterval(() => {
      this.timer -= 1;
      if (this.timer <= 0) {
        this.stopTimer();
        this.toast.warning(this.ui.t('Tempo esgotado', 'Time is up'), this.ui.t('O quiz foi submetido automaticamente.', 'The quiz was submitted automatically.'));
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

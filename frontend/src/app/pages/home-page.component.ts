import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
        <h1 class="hero-title">Estuda, responde e sobe no ranking.</h1>
        <p class="hero-copy">
          O QuizVerse e uma plataforma de quiz online com quizzes publicados, ranking global e historico de resultados num ambiente simples e moderno.
        </p>
        <div class="hero-actions">
          <a routerLink="/register" class="primary-button">Criar conta</a>
          <a routerLink="/login" class="secondary-button">Entrar</a>
        </div>
        <div class="stat-cluster">
          <div class="stat-card"><strong>{{ quizzes.length }}</strong><span>Quizzes publicados</span></div>
          <div class="stat-card"><strong>Ranking</strong><span>Competicao global entre jogadores</span></div>
          <div class="stat-card"><strong>Online</strong><span>Disponivel em qualquer dispositivo</span></div>
        </div>
      </article>

      <section class="surface-card" style="margin-top:1.25rem;">
        <div class="card-header">
          <div>
            <span class="eyebrow">Quizzes</span>
            <h2>Escolhe um quiz para comecar</h2>
          </div>
        </div>
        <div class="quiz-list" *ngIf="quizzes.length; else noQuizGuest">
          <div class="quiz-list-item" *ngFor="let quiz of quizzes">
            <div class="quiz-meta">
              <strong>{{ quiz.title }}</strong>
              <span>{{ quiz.category }} · por {{ quiz.author }}</span>
            </div>
            <button class="action-pill" type="button" (click)="goToLoginForQuiz()">Fazer quiz</button>
          </div>
        </div>
        <ng-template #noQuizGuest>
          <div class="empty-state">Ainda nao ha quizzes publicados.</div>
        </ng-template>
      </section>
    </section>

    <ng-template #dashboardView>
      <section class="page-enter">
        <article class="hero-card">
          <span class="inline-tag">Dashboard pessoal</span>
          <h1 class="hero-title">Bem-vindo, {{ session.user()?.name }}.</h1>
          <p class="hero-copy">Joga, cria e acompanha o teu progresso num ambiente fluido, competitivo e orientado a performance.</p>
          <div class="hero-actions">
            <a routerLink="/create-quiz" class="primary-button">Criar novo quiz</a>
            <a routerLink="/ranking" class="secondary-button">Ver ranking global</a>
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
              <span class="eyebrow">Play now</span>
              <h2>Escolhe um quiz</h2>
            </div>
            <span class="timer-chip" *ngIf="currentQuiz">Tempo {{ timer }}s</span>
          </div>

          <div class="quiz-list" *ngIf="!currentQuiz && quizzes.length; else quizStageOrEmpty">
            <div class="quiz-list-item" *ngFor="let quiz of quizzes">
              <div class="quiz-meta">
                <strong>{{ quiz.title }}</strong>
                <span>{{ quiz.category }} · {{ quiz.author }}</span>
              </div>
              <button class="action-pill" type="button" (click)="start(quiz.id)">Iniciar quiz</button>
            </div>
          </div>

          <ng-template #quizStageOrEmpty>
            <div class="empty-state" *ngIf="!currentQuiz && !quizzes.length">Nao existem quizzes publicados.</div>
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
  `
})
export class HomePageComponent implements OnDestroy {
  readonly api = inject(ApiService);
  readonly session = inject(SessionService);
  readonly toast = inject(ToastService);
  readonly router = inject(Router);

  quizzes: any[] = [];
  ranking: any[] = [];
  profile: any = null;
  currentQuiz: any = null;
  answers: Record<string, number> = {};
  result: any = null;
  timer = 60;
  private timerRef: any = null;

  constructor() {
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

  loadQuizzes() {
    this.api.quizzes().subscribe({
      next: (response) => this.quizzes = response.quizzes || [],
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
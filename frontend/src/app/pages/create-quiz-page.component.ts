import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { ToastService } from '../core/toast.service';
import { UiService } from '../core/ui.service';
import { DEFAULT_QUIZ_CATEGORY, QUIZ_CATEGORIES } from '../core/quiz-categories';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-enter dashboard-grid">
      <article class="form-panel">
        <div class="card-header">
          <div>
            <span class="eyebrow">{{ ui.t('Criar com IA', 'Create with AI') }}</span>
            <h2>{{ ui.t('Gerar quiz com Gemini API', 'Generate quiz with Gemini API') }}</h2>
            <p class="helper-copy">{{ ui.t('Preenche o tema, define o nivel e deixa a base pronta para a Gemini gerar um quiz completo e gravar diretamente na tua base de dados.', 'Fill in the topic, choose the difficulty, and let Gemini generate a complete quiz directly into your database.') }}</p>
          </div>
          <span class="pill-status" [class.status-success]="geminiReady" [class.status-warning]="!geminiReady">
            {{ geminiReady ? ui.t('Gemini configurada', 'Gemini configured') : ui.t('Gemini pendente', 'Gemini pending') }}
          </span>
        </div>

        <div class="empty-state" *ngIf="!geminiReady" style="text-align:left; margin-bottom:1rem;">
          {{ ui.t('A base da integracao ja esta pronta. Falta apenas colocares a tua chave em', 'The integration is ready. You only need to add your key in') }}
          <strong>backend/config/config.local.php</strong>
          {{ ui.t('no campo', 'under the') }} <code>gemini_api_key</code>.
        </div>

        <div class="form-stack">
          <div>
            <label class="field-label">{{ ui.t('Tema principal', 'Main topic') }}</label>
            <input [(ngModel)]="generatorForm.topic" [placeholder]="ui.t('Ex.: Redes de computadores, Historia de Angola, Matematica basica', 'Example: Computer networks, World history, Basic math')">
          </div>

          <div class="input-row">
            <div style="flex:1; min-width:220px;">
              <label class="field-label">{{ ui.t('Titulo sugerido', 'Suggested title') }}</label>
              <input [(ngModel)]="generatorForm.title" [placeholder]="ui.t('Ex.: Desafio de Redes 2026', 'Example: Network Challenge 2026')">
            </div>
            <div style="flex:1; min-width:220px;">
              <label class="field-label">{{ ui.t('Categoria', 'Category') }}</label>
              <select [(ngModel)]="generatorForm.category">
                <option *ngFor="let category of fixedCategories" [value]="category">{{ category }}</option>
              </select>
            </div>
          </div>

          <div class="input-row">
            <div style="flex:1; min-width:220px;">
              <label class="field-label">{{ ui.t('Publico-alvo', 'Target audience') }}</label>
              <input [(ngModel)]="generatorForm.audience" [placeholder]="ui.t('Ex.: estudantes do medio, universitarios, iniciantes', 'Example: high-school students, college students, beginners')">
            </div>
          </div>

          <div class="input-row">
            <div style="flex:1; min-width:220px;">
              <label class="field-label">{{ ui.t('Dificuldade', 'Difficulty') }}</label>
              <select [(ngModel)]="generatorForm.difficulty">
                <option value="easy">{{ ui.t('Facil', 'Easy') }}</option>
                <option value="medium">{{ ui.t('Media', 'Medium') }}</option>
                <option value="hard">{{ ui.t('Dificil', 'Hard') }}</option>
              </select>
            </div>
            <div style="flex:1; min-width:220px;">
              <label class="field-label">{{ ui.t('Quantidade de perguntas', 'Number of questions') }}</label>
              <input [(ngModel)]="generatorForm.amount" type="number" min="3" max="15">
            </div>
          </div>

          <div>
            <label class="field-label">{{ ui.t('Descricao base', 'Base description') }}</label>
            <textarea [(ngModel)]="generatorForm.description" [placeholder]="ui.t('Breve contexto para orientar a geracao do quiz', 'Brief context to guide quiz generation')"></textarea>
          </div>

          <div class="section-actions">
            <button class="primary-button" type="button" (click)="generateQuiz()">{{ ui.t('Gerar quiz com IA', 'Generate quiz with AI') }}</button>
          </div>
        </div>
      </article>

      <article class="panel-card">
        <div class="card-header-inline">
          <div>
            <span class="eyebrow">{{ ui.t('Organizacao', 'Organization') }}</span>
            <h2>{{ ui.t('Os teus quizzes', 'Your quizzes') }}</h2>
          </div>
          <span class="pill-status status-success">{{ myQuizzes.length }} {{ ui.t('quizzes', 'quizzes') }}</span>
        </div>

        <div class="filter-row" style="margin-bottom:1rem;">
          <div style="flex:1; min-width:220px;">
            <label class="field-label">{{ ui.t('Filtrar por categoria', 'Filter by category') }}</label>
            <select [(ngModel)]="selectedCategory">
              <option value="">{{ ui.t('Todas', 'All') }}</option>
              <option *ngFor="let category of quizCategories" [value]="category">{{ category }}</option>
            </select>
          </div>
        </div>

        <div class="quiz-card-grid" *ngIf="publishedQuizzes.length; else noPublished">
          <article class="quiz-card" *ngFor="let quiz of publishedQuizzes">
            <img class="quiz-card-image" [src]="quizImage(quiz)" [alt]="quiz.title">
            <div class="quiz-card-body">
              <div>
                <strong>{{ quiz.title }}</strong>
                <p class="card-description">{{ quiz.description || ui.t('Quiz publicado e pronto para receber participantes.', 'Published quiz ready for participants.') }}</p>
              </div>
              <div class="quiz-card-meta">
                <span class="badge">{{ quiz.category }}</span>
                <span class="badge">{{ ui.t('Publicado', 'Published') }}</span>
              </div>
              <div class="card-footer">
                <div class="card-footer-meta">
                  <span class="muted">{{ ui.t('Por', 'By') }} {{ quiz.author }}</span>
                  <span class="muted">{{ formatPublishedAt(quiz.created_at) }}</span>
                </div>
                <div class="section-actions">
                  <button class="secondary-button" type="button" (click)="loadQuizForEdit(quiz.id)">{{ ui.t('Editar', 'Edit') }}</button>
                  <button class="ghost-button" type="button" (click)="deleteQuiz(quiz.id)">{{ ui.t('Apagar', 'Delete') }}</button>
                </div>
              </div>
            </div>
          </article>
        </div>
        <ng-template #noPublished>
          <div class="empty-state">{{ ui.t('Ainda nao tens quizzes publicados.', 'You do not have published quizzes yet.') }}</div>
        </ng-template>

        <div class="card-header-inline" style="margin-top:1.2rem;">
          <div>
            <span class="eyebrow">{{ ui.t('Rascunhos', 'Drafts') }}</span>
            <h2>{{ ui.t('Prontos para revisar', 'Ready to review') }}</h2>
          </div>
        </div>
        <div class="quiz-card-grid" *ngIf="draftQuizzes.length; else noDrafts">
          <article class="quiz-card" *ngFor="let quiz of draftQuizzes">
            <img class="quiz-card-image" [src]="quizImage(quiz)" [alt]="quiz.title">
            <div class="quiz-card-body">
              <div>
                <strong>{{ quiz.title }}</strong>
                <p class="card-description">{{ quiz.description || ui.t('Rascunho pronto para revisao e publicacao.', 'Draft ready for review and publishing.') }}</p>
              </div>
              <div class="quiz-card-meta">
                <span class="badge">{{ quiz.category }}</span>
                <span class="badge">{{ ui.t('Rascunho', 'Draft') }}</span>
              </div>
              <div class="card-footer">
                <div class="card-footer-meta">
                  <span class="muted">{{ ui.t('Por', 'By') }} {{ quiz.author }}</span>
                  <span class="muted">{{ formatPublishedAt(quiz.created_at) }}</span>
                </div>
                <div class="section-actions">
                  <button class="secondary-button" type="button" (click)="loadQuizForEdit(quiz.id)">{{ ui.t('Editar', 'Edit') }}</button>
                  <button class="ghost-button" type="button" (click)="deleteQuiz(quiz.id)">{{ ui.t('Apagar', 'Delete') }}</button>
                </div>
              </div>
            </div>
          </article>
        </div>
        <ng-template #noDrafts>
          <div class="empty-state">{{ ui.t('Nao tens rascunhos neste momento.', 'You do not have drafts right now.') }}</div>
        </ng-template>
      </article>

      <article class="table-card" *ngIf="editModel">
        <div class="card-header">
          <div>
            <span class="eyebrow">{{ ui.t('Editar quiz', 'Edit quiz') }}</span>
            <h2>{{ editModel.title }}</h2>
            <p class="helper-copy">{{ ui.t('Depois de gerado, podes rever perguntas, trocar opcoes e publicar quando estiver tudo certo.', 'After generation, you can review questions, change options, and publish when everything looks right.') }}</p>
          </div>
        </div>

        <div class="form-stack">
          <div>
            <label class="field-label">{{ ui.t('Titulo', 'Title') }}</label>
            <input [(ngModel)]="editModel.title" [placeholder]="ui.t('Titulo do quiz', 'Quiz title')">
          </div>

          <div class="input-row">
            <div style="flex:1; min-width:220px;">
              <label class="field-label">{{ ui.t('Categoria', 'Category') }}</label>
              <select [(ngModel)]="editModel.category">
                <option *ngFor="let category of fixedCategories" [value]="category">{{ category }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="field-label">{{ ui.t('Descricao', 'Description') }}</label>
            <textarea [(ngModel)]="editModel.description" [placeholder]="ui.t('Descricao do quiz', 'Quiz description')"></textarea>
          </div>

          <div class="question-card" *ngFor="let question of editModel.questions; let i = index">
            <div class="card-header-inline">
              <strong>{{ ui.t('Pergunta', 'Question') }} {{ i + 1 }}</strong>
              <button class="ghost-button" type="button" (click)="removeQuestion(i)">{{ ui.t('Remover', 'Remove') }}</button>
            </div>
            <div class="form-stack">
              <textarea [(ngModel)]="question.question_text" [placeholder]="ui.t('Texto da pergunta', 'Question text')"></textarea>
              <div *ngFor="let option of question.options; let optionIndex = index" class="input-row">
                <div style="flex:1; min-width:220px;">
                  <input [(ngModel)]="question.options[optionIndex]" [placeholder]="ui.t('Opcao', 'Option')">
                </div>
                <div style="width:160px;">
                  <label class="field-label">{{ ui.t('Correta?', 'Correct?') }}</label>
                  <select [(ngModel)]="question.correct_index">
                    <option *ngFor="let selector of question.options; let selectorIndex = index" [ngValue]="selectorIndex">{{ ui.t('Opcao', 'Option') }} {{ selectorIndex + 1 }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="section-actions">
            <button class="secondary-button" type="button" (click)="addQuestion()">{{ ui.t('Adicionar pergunta', 'Add question') }}</button>
            <button class="primary-button" type="button" (click)="saveEdit()">{{ ui.t('Guardar alteracoes', 'Save changes') }}</button>
          </div>
        </div>
      </article>
    </section>
  `
})
export class CreateQuizPageComponent {
  readonly api = inject(ApiService);
  readonly toast = inject(ToastService);
  readonly ui = inject(UiService);
  myQuizzes: any[] = [];
  editModel: any = null;
  geminiReady = false;
  selectedCategory = '';
  readonly fixedCategories = [...QUIZ_CATEGORIES];

  generatorForm = {
    topic: '',
    title: '',
    category: DEFAULT_QUIZ_CATEGORY,
    audience: 'estudantes e curiosos',
    difficulty: 'medium',
    amount: 8,
    description: ''
  };

  constructor() {
    this.loadGeminiStatus();
    this.loadMyQuizzes();
  }

  get publishedQuizzes() {
    return this.filteredQuizzes.filter((quiz) => quiz.status === 'published');
  }

  get draftQuizzes() {
    return this.filteredQuizzes.filter((quiz) => quiz.status !== 'published');
  }

  get quizCategories() {
    return Array.from(new Set(this.myQuizzes.map((quiz) => quiz.category || DEFAULT_QUIZ_CATEGORY))).sort();
  }

  get filteredQuizzes() {
    return this.myQuizzes.filter((quiz) => !this.selectedCategory || (quiz.category || DEFAULT_QUIZ_CATEGORY) === this.selectedCategory);
  }

  loadGeminiStatus() {
    this.api.geminiStatus().subscribe({
      next: (response) => this.geminiReady = !!response.configured,
      error: () => this.geminiReady = false
    });
  }

  loadMyQuizzes() {
    this.api.myQuizzes().subscribe({
      next: (response) => this.myQuizzes = response.quizzes || [],
      error: () => this.toast.error(this.ui.t('Erro ao listar quizzes', 'Error loading quizzes'), this.ui.t('Nao foi possivel carregar os teus quizzes.', 'Could not load your quizzes.'))
    });
  }

  generateQuiz() {
    this.api.generateAiQuiz({ ...this.generatorForm, language: this.ui.lang(), status: 'published' }).subscribe({
      next: (response) => {
        this.toast.success(this.ui.t('Quiz gerado com sucesso', 'Quiz generated successfully'), `${response.questions_generated} ${this.ui.t('perguntas criadas com Gemini API.', 'questions created with Gemini API.')}`);
        this.loadMyQuizzes();
        this.loadQuizForEdit(response.quiz_id);
      },
      error: (e) => this.toast.error(this.ui.t('Falha na geracao', 'Generation failed'), e.error?.message || this.ui.t('Nao foi possivel gerar o quiz com a Gemini API.', 'Could not generate the quiz with the Gemini API.'))
    });
  }

  loadQuizForEdit(id: number) {
    this.api.myQuiz(id).subscribe({
      next: (response) => {
        const quiz = response.quiz;
        this.editModel = {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description || '',
          category: quiz.category || DEFAULT_QUIZ_CATEGORY,
          status: quiz.status || 'draft',
          questions: (quiz.questions || []).map((question: any) => ({
            question_text: question.question_text,
            options: (question.options || []).map((option: any) => option.option_text ?? option),
            correct_index: Math.max(0, (question.options || []).findIndex((option: any) => Number(option.is_correct) === 1))
          }))
        };
        this.toast.info(this.ui.t('Quiz carregado', 'Quiz loaded'), this.ui.t('Podes editar e guardar as alteracoes.', 'You can edit and save your changes.'));
      },
      error: (e) => this.toast.error(this.ui.t('Falha ao abrir quiz', 'Failed to open quiz'), e.error?.message || this.ui.t('Nao foi possivel abrir esse quiz.', 'Could not open that quiz.'))
    });
  }

  addQuestion() {
    if (!this.editModel) {
      return;
    }

    this.editModel.questions.push({
      question_text: '',
      options: ['', ''],
      correct_index: 0
    });
  }

  removeQuestion(index: number) {
    if (!this.editModel) {
      return;
    }

    this.editModel.questions.splice(index, 1);
  }

  saveEdit() {
    if (!this.editModel) {
      return;
    }

    this.api.updateMyQuiz(this.editModel.id, this.editModel).subscribe({
      next: () => {
        this.toast.success(this.ui.t('Quiz atualizado', 'Quiz updated'), this.ui.t('As alteracoes foram guardadas na base de dados.', 'Changes were saved to the database.'));
        this.loadMyQuizzes();
      },
      error: (e) => this.toast.error(this.ui.t('Falha ao guardar', 'Failed to save'), e.error?.message || this.ui.t('Nao foi possivel atualizar o quiz.', 'Could not update the quiz.'))
    });
  }

  deleteQuiz(id: number) {
    this.api.deleteMyQuiz(id).subscribe({
      next: () => {
        if (this.editModel?.id === id) {
          this.editModel = null;
        }
        this.toast.success(this.ui.t('Quiz apagado', 'Quiz deleted'), this.ui.t('O quiz foi removido com sucesso.', 'The quiz was removed successfully.'));
        this.loadMyQuizzes();
      },
      error: (e) => this.toast.error(this.ui.t('Falha ao apagar', 'Failed to delete'), e.error?.message || this.ui.t('Nao foi possivel remover o quiz.', 'Could not remove the quiz.'))
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

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { ToastService } from '../core/toast.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-enter dashboard-grid">
      <article class="form-panel">
        <div class="card-header">
          <div>
            <span class="eyebrow">Criar com IA</span>
            <h2>Gerar quiz com Gemini API</h2>
            <p class="helper-copy">Preenche o tema, define o nivel e deixa a base pronta para a Gemini gerar um quiz completo e gravar diretamente na tua base de dados.</p>
          </div>
          <span class="pill-status" [class.status-success]="geminiReady" [class.status-warning]="!geminiReady">
            {{ geminiReady ? 'Gemini configurada' : 'Gemini pendente' }}
          </span>
        </div>

        <div class="empty-state" *ngIf="!geminiReady" style="text-align:left; margin-bottom:1rem;">
          A base da integracao ja esta pronta. Falta apenas colocares a tua chave em <strong>backend/config/config.php</strong> no campo <code>gemini_api_key</code>.
        </div>

        <div class="form-stack">
          <div>
            <label class="field-label">Tema principal</label>
            <input [(ngModel)]="generatorForm.topic" placeholder="Ex.: Redes de computadores, Historia de Angola, Matematica basica">
          </div>

          <div class="input-row">
            <div style="flex:1; min-width:220px;">
              <label class="field-label">Titulo sugerido</label>
              <input [(ngModel)]="generatorForm.title" placeholder="Ex.: Desafio de Redes 2026">
            </div>
            <div style="flex:1; min-width:220px;">
              <label class="field-label">Categoria</label>
              <input [(ngModel)]="generatorForm.category" placeholder="Tecnologia, Ciencias, Cultura geral">
            </div>
          </div>

          <div class="input-row">
            <div style="flex:1; min-width:220px;">
              <label class="field-label">Publico-alvo</label>
              <input [(ngModel)]="generatorForm.audience" placeholder="Ex.: estudantes do medio, universitarios, iniciantes">
            </div>
            <div style="flex:1; min-width:220px;">
              <label class="field-label">Idioma</label>
              <select [(ngModel)]="generatorForm.language">
                <option value="pt">Portugues</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div class="input-row">
            <div style="flex:1; min-width:220px;">
              <label class="field-label">Dificuldade</label>
              <select [(ngModel)]="generatorForm.difficulty">
                <option value="easy">Facil</option>
                <option value="medium">Media</option>
                <option value="hard">Dificil</option>
              </select>
            </div>
            <div style="flex:1; min-width:220px;">
              <label class="field-label">Quantidade de perguntas</label>
              <input [(ngModel)]="generatorForm.amount" type="number" min="3" max="15">
            </div>
            <div style="flex:1; min-width:220px;">
              <label class="field-label">Estado</label>
              <select [(ngModel)]="generatorForm.status">
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
              </select>
            </div>
          </div>

          <div>
            <label class="field-label">Descricao base</label>
            <textarea [(ngModel)]="generatorForm.description" placeholder="Breve contexto para orientar a geracao do quiz"></textarea>
          </div>

          <div class="section-actions">
            <button class="primary-button" type="button" (click)="generateQuiz()">Gerar quiz com IA</button>
          </div>
        </div>
      </article>

      <article class="panel-card">
        <div class="card-header-inline">
          <div>
            <span class="eyebrow">Organizacao</span>
            <h2>Os teus quizzes</h2>
          </div>
          <span class="pill-status status-success">{{ myQuizzes.length }} quizzes</span>
        </div>

        <div class="filter-row" style="margin-bottom:1rem;">
          <div style="flex:1; min-width:220px;">
            <label class="field-label">Filtrar por categoria</label>
            <select [(ngModel)]="selectedCategory">
              <option value="">Todas</option>
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
                <p class="card-description">{{ quiz.description || 'Quiz publicado e pronto para receber participantes.' }}</p>
              </div>
              <div class="quiz-card-meta">
                <span class="badge">{{ quiz.category }}</span>
                <span class="badge">Publicado</span>
              </div>
              <div class="card-footer">
                <div class="card-footer-meta">
                  <span class="muted">Por {{ quiz.author }}</span>
                  <span class="muted">{{ formatPublishedAt(quiz.created_at) }}</span>
                </div>
                <div class="section-actions">
                  <button class="secondary-button" type="button" (click)="loadQuizForEdit(quiz.id)">Editar</button>
                  <button class="ghost-button" type="button" (click)="deleteQuiz(quiz.id)">Apagar</button>
                </div>
              </div>
            </div>
          </article>
        </div>
        <ng-template #noPublished>
          <div class="empty-state">Ainda nao tens quizzes publicados.</div>
        </ng-template>

        <div class="card-header-inline" style="margin-top:1.2rem;">
          <div>
            <span class="eyebrow">Rascunhos</span>
            <h2>Prontos para revisar</h2>
          </div>
        </div>
        <div class="quiz-card-grid" *ngIf="draftQuizzes.length; else noDrafts">
          <article class="quiz-card" *ngFor="let quiz of draftQuizzes">
            <img class="quiz-card-image" [src]="quizImage(quiz)" [alt]="quiz.title">
            <div class="quiz-card-body">
              <div>
                <strong>{{ quiz.title }}</strong>
                <p class="card-description">{{ quiz.description || 'Rascunho pronto para revisao e publicacao.' }}</p>
              </div>
              <div class="quiz-card-meta">
                <span class="badge">{{ quiz.category }}</span>
                <span class="badge">Rascunho</span>
              </div>
              <div class="card-footer">
                <div class="card-footer-meta">
                  <span class="muted">Por {{ quiz.author }}</span>
                  <span class="muted">{{ formatPublishedAt(quiz.created_at) }}</span>
                </div>
                <div class="section-actions">
                  <button class="secondary-button" type="button" (click)="loadQuizForEdit(quiz.id)">Editar</button>
                  <button class="ghost-button" type="button" (click)="deleteQuiz(quiz.id)">Apagar</button>
                </div>
              </div>
            </div>
          </article>
        </div>
        <ng-template #noDrafts>
          <div class="empty-state">Nao tens rascunhos neste momento.</div>
        </ng-template>
      </article>

      <article class="table-card" *ngIf="editModel">
        <div class="card-header">
          <div>
            <span class="eyebrow">Editar quiz</span>
            <h2>{{ editModel.title }}</h2>
            <p class="helper-copy">Depois de gerado, podes rever perguntas, trocar opcoes e publicar quando estiver tudo certo.</p>
          </div>
        </div>

        <div class="form-stack">
          <div>
            <label class="field-label">Titulo</label>
            <input [(ngModel)]="editModel.title" placeholder="Titulo do quiz">
          </div>

          <div class="input-row">
            <div style="flex:1; min-width:220px;">
              <label class="field-label">Categoria</label>
              <input [(ngModel)]="editModel.category" placeholder="Categoria">
            </div>
            <div style="flex:1; min-width:220px;">
              <label class="field-label">Estado</label>
              <select [(ngModel)]="editModel.status">
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
              </select>
            </div>
          </div>

          <div>
            <label class="field-label">Descricao</label>
            <textarea [(ngModel)]="editModel.description" placeholder="Descricao do quiz"></textarea>
          </div>

          <div class="question-card" *ngFor="let question of editModel.questions; let i = index">
            <div class="card-header-inline">
              <strong>Pergunta {{ i + 1 }}</strong>
              <button class="ghost-button" type="button" (click)="removeQuestion(i)">Remover</button>
            </div>
            <div class="form-stack">
              <textarea [(ngModel)]="question.question_text" placeholder="Texto da pergunta"></textarea>
              <div *ngFor="let option of question.options; let optionIndex = index" class="input-row">
                <div style="flex:1; min-width:220px;">
                  <input [(ngModel)]="question.options[optionIndex]" placeholder="Opcao">
                </div>
                <div style="width:160px;">
                  <label class="field-label">Correta?</label>
                  <select [(ngModel)]="question.correct_index">
                    <option *ngFor="let selector of question.options; let selectorIndex = index" [ngValue]="selectorIndex">Opcao {{ selectorIndex + 1 }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="section-actions">
            <button class="secondary-button" type="button" (click)="addQuestion()">Adicionar pergunta</button>
            <button class="primary-button" type="button" (click)="saveEdit()">Guardar alteracoes</button>
          </div>
        </div>
      </article>
    </section>
  `
})
export class CreateQuizPageComponent {
  readonly api = inject(ApiService);
  readonly toast = inject(ToastService);
  myQuizzes: any[] = [];
  editModel: any = null;
  geminiReady = false;
  selectedCategory = '';

  generatorForm = {
    topic: '',
    title: '',
    category: '',
    audience: 'estudantes e curiosos',
    language: 'pt',
    difficulty: 'medium',
    amount: 8,
    status: 'draft',
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
    return Array.from(new Set(this.myQuizzes.map((quiz) => quiz.category || 'Geral'))).sort();
  }

  get filteredQuizzes() {
    return this.myQuizzes.filter((quiz) => !this.selectedCategory || (quiz.category || 'Geral') === this.selectedCategory);
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
      error: () => this.toast.error('Erro ao listar quizzes', 'Nao foi possivel carregar os teus quizzes.')
    });
  }

  generateQuiz() {
    this.api.generateAiQuiz(this.generatorForm).subscribe({
      next: (response) => {
        this.toast.success('Quiz gerado com sucesso', `${response.questions_generated} perguntas criadas com Gemini API.`);
        this.loadMyQuizzes();
        this.loadQuizForEdit(response.quiz_id);
      },
      error: (e) => this.toast.error('Falha na geracao', e.error?.message || 'Nao foi possivel gerar o quiz com a Gemini API.')
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
          category: quiz.category || 'Geral',
          status: quiz.status || 'draft',
          questions: (quiz.questions || []).map((question: any) => ({
            question_text: question.question_text,
            options: (question.options || []).map((option: any) => option.option_text ?? option),
            correct_index: Math.max(0, (question.options || []).findIndex((option: any) => Number(option.is_correct) === 1))
          }))
        };
        this.toast.info('Quiz carregado', 'Podes editar e guardar as alteracoes.');
      },
      error: (e) => this.toast.error('Falha ao abrir quiz', e.error?.message || 'Nao foi possivel abrir esse quiz.')
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
        this.toast.success('Quiz atualizado', 'As alteracoes foram guardadas na base de dados.');
        this.loadMyQuizzes();
      },
      error: (e) => this.toast.error('Falha ao guardar', e.error?.message || 'Nao foi possivel atualizar o quiz.')
    });
  }

  deleteQuiz(id: number) {
    this.api.deleteMyQuiz(id).subscribe({
      next: () => {
        if (this.editModel?.id === id) {
          this.editModel = null;
        }
        this.toast.success('Quiz apagado', 'O quiz foi removido com sucesso.');
        this.loadMyQuizzes();
      },
      error: (e) => this.toast.error('Falha ao apagar', e.error?.message || 'Nao foi possivel remover o quiz.')
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

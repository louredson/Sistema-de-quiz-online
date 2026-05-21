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
            <span class="eyebrow">Quiz import</span>
            <h2>Importar quiz online</h2>
            <p class="helper-copy">Busca perguntas automaticamente pela Open Trivia DB e guarda o quiz localmente na tua base de dados.</p>
          </div>
        </div>

        <div class="form-stack">
          <div>
            <label class="field-label">Titulo do quiz</label>
            <input [(ngModel)]="importForm.title" placeholder="Ex.: Ciencia Express">
          </div>

          <div class="input-row">
            <div style="flex:1; min-width:220px;">
              <label class="field-label">Categoria externa</label>
              <select [(ngModel)]="importForm.category">
                <option value="">Qualquer categoria</option>
                <option *ngFor="let category of categories" [value]="category.id">{{ category.name }}</option>
              </select>
            </div>
            <div style="flex:1; min-width:220px;">
              <label class="field-label">Dificuldade</label>
              <select [(ngModel)]="importForm.difficulty">
                <option value="">Qualquer</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div class="input-row">
            <div style="flex:1; min-width:220px;">
              <label class="field-label">Quantidade</label>
              <input [(ngModel)]="importForm.amount" type="number" min="1" max="20">
            </div>
            <div style="flex:1; min-width:220px;">
              <label class="field-label">Estado</label>
              <select [(ngModel)]="importForm.status">
                <option value="draft">Draft</option>
                <option value="published">Publicado</option>
              </select>
            </div>
          </div>

          <div>
            <label class="field-label">Descricao</label>
            <textarea [(ngModel)]="importForm.description" placeholder="Descricao opcional do quiz"></textarea>
          </div>

          <div class="section-actions">
            <button class="primary-button" type="button" (click)="importQuiz()">Importar perguntas online</button>
          </div>
        </div>
      </article>

      <article class="panel-card">
        <div class="card-header-inline">
          <div>
            <span class="eyebrow">My quizzes</span>
            <h2>CRUD completo dos teus quizzes</h2>
          </div>
          <span class="pill-status status-success">{{ myQuizzes.length }} quizzes</span>
        </div>

        <div class="quiz-list" *ngIf="myQuizzes.length; else noMine">
          <div class="quiz-list-item" *ngFor="let quiz of myQuizzes">
            <div class="quiz-meta">
              <strong>{{ quiz.title }}</strong>
              <span>{{ quiz.category }} · {{ quiz.status }} · {{ quiz.author }}</span>
            </div>
            <div class="section-actions">
              <button class="secondary-button" type="button" (click)="loadQuizForEdit(quiz.id)">Editar</button>
              <button class="ghost-button" type="button" (click)="deleteQuiz(quiz.id)">Apagar</button>
            </div>
          </div>
        </div>
        <ng-template #noMine>
          <div class="empty-state">Ainda nao tens quizzes guardados.</div>
        </ng-template>
      </article>

      <article class="table-card" *ngIf="editModel">
        <div class="card-header">
          <div>
            <span class="eyebrow">Edit quiz</span>
            <h2>{{ editModel.title }}</h2>
            <p class="helper-copy">Podes alterar titulo, descricao, categoria, estado e todo o conteudo das perguntas.</p>
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
                <option value="draft">Draft</option>
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
  categories: Array<{ id: number; name: string }> = [];
  myQuizzes: any[] = [];
  editModel: any = null;

  importForm = {
    title: '',
    category: '',
    difficulty: '',
    amount: 10,
    status: 'draft',
    description: ''
  };

  constructor() {
    this.loadCategories();
    this.loadMyQuizzes();
  }

  loadCategories() {
    this.api.triviaCategories().subscribe({
      next: (response) => this.categories = response.categories || [],
      error: () => this.toast.error('API externa indisponivel', 'Nao foi possivel carregar as categorias da trivia.')
    });
  }

  loadMyQuizzes() {
    this.api.myQuizzes().subscribe({
      next: (response) => this.myQuizzes = response.quizzes || [],
      error: () => this.toast.error('Erro ao listar quizzes', 'Nao foi possivel carregar os teus quizzes.')
    });
  }

  importQuiz() {
    const selectedCategory = this.categories.find((item) => String(item.id) === String(this.importForm.category));
    const payload = {
      title: this.importForm.title,
      category: this.importForm.category,
      category_name: selectedCategory?.name || '',
      difficulty: this.importForm.difficulty,
      amount: this.importForm.amount,
      status: this.importForm.status,
      description: this.importForm.description
    };

    this.api.importQuiz(payload).subscribe({
      next: (response) => {
        this.toast.success('Quiz importado com sucesso', `${response.questions_imported} perguntas importadas da Open Trivia DB.`);
        this.loadMyQuizzes();
      },
      error: (e) => this.toast.error('Falha na importacao', e.error?.message || 'Nao foi possivel importar o quiz online.')
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
}
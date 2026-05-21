import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { ToastService } from '../core/toast.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-enter quiz-builder-grid">
      <article class="form-panel">
        <div class="card-header">
          <div>
            <span class="eyebrow">Quiz builder</span>
            <h2>Criar novo quiz</h2>
            <p class="helper-copy">Formulario leve para montar rapidamente um quiz inicial e guardar em draft.</p>
          </div>
        </div>

        <div class="form-stack">
          <label class="field-label">Titulo</label>
          <input [(ngModel)]="title" placeholder="Ex.: Matematica Rapida">

          <label class="field-label">Categoria</label>
          <input [(ngModel)]="category" placeholder="Ex.: Matematica">

          <label class="field-label">Pergunta</label>
          <textarea [(ngModel)]="q1" placeholder="Escreve a pergunta principal"></textarea>

          <div class="input-row">
            <div style="flex:1; min-width:240px;">
              <label class="field-label">Opcao correta</label>
              <input [(ngModel)]="o1" placeholder="Opcao correta">
            </div>
            <div style="flex:1; min-width:240px;">
              <label class="field-label">Opcao alternativa</label>
              <input [(ngModel)]="o2" placeholder="Opcao alternativa">
            </div>
          </div>

          <div class="section-actions">
            <button class="primary-button" type="button" (click)="save()">Guardar draft</button>
            <span class="success-text" *ngIf="msg">{{ msg }}</span>
          </div>
        </div>
      </article>

      <article class="panel-card">
        <div class="card-header">
          <div>
            <span class="eyebrow">Preview</span>
            <h2>Visao rapida do quiz</h2>
          </div>
        </div>
        <div class="question-card">
          <strong>{{ title || 'Titulo do quiz' }}</strong>
          <span class="muted">{{ category || 'Categoria' }}</span>
          <p>{{ q1 || 'A pergunta vai aparecer aqui assim que comecares a escrever.' }}</p>
          <div class="list-stack">
            <div class="answer-choice active"><span>1</span><span>{{ o1 || 'Opcao correta' }}</span></div>
            <div class="answer-choice"><span>2</span><span>{{ o2 || 'Opcao alternativa' }}</span></div>
          </div>
        </div>
      </article>
    </section>
  `
})
export class CreateQuizPageComponent {
  title = '';
  category = 'Geral';
  q1 = '';
  o1 = '';
  o2 = '';
  msg = '';
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  save() {
    const body = {
      title: this.title,
      category: this.category,
      description: '',
      status: 'draft',
      questions: [{ question_text: this.q1, options: [this.o1, this.o2], correct_index: 0 }]
    };

    this.api.createQuiz(body).subscribe({
      next: () => {
        this.msg = 'Quiz guardado em draft';
        this.toast.success('Quiz criado com sucesso', 'O novo quiz foi guardado na plataforma.');
      },
      error: (e) => this.toast.error('Erro ao criar quiz', e.error?.message || 'Verifica os campos e tenta novamente.')
    });
  }
}
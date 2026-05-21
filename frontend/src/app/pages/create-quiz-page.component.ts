import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';

@Component({ standalone: true, imports: [CommonModule, FormsModule], template: `
<div class='card form-card'><h2>Criar Quiz</h2>
<input [(ngModel)]='title' placeholder='Titulo'>
<input [(ngModel)]='category' placeholder='Categoria'>
<textarea [(ngModel)]='q1' placeholder='Pergunta'></textarea>
<input [(ngModel)]='o1' placeholder='Opcao 1 (correta)'>
<input [(ngModel)]='o2' placeholder='Opcao 2'>
<button (click)='save()'>Guardar (Draft)</button>
<p>{{msg}}</p></div>` })
export class CreateQuizPageComponent {
  title=''; category='Geral'; q1=''; o1=''; o2=''; msg=''; api=inject(ApiService);
  save(){ const body={title:this.title,category:this.category,description:'',status:'draft',questions:[{question_text:this.q1,options:[this.o1,this.o2],correct_index:0}]}; this.api.createQuiz(body).subscribe({next:()=>this.msg='Quiz criado',error:e=>this.msg=e.error?.message||'Erro'});}
}

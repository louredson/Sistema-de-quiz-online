import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';

@Component({ standalone: true, imports: [CommonModule], template: `
<div class='card'><h2>Quizzes</h2><div *ngFor='let q of quizzes' class='quiz-item'>
<h3>{{q.title}}</h3><p>{{q.category}} - {{q.author}}</p>
<button (click)='start(q.id)'>Iniciar</button></div></div>
<div *ngIf='currentQuiz' class='card'>
<h2>{{currentQuiz.title}}</h2>
<div *ngFor='let qu of currentQuiz.questions'>
<p><b>{{qu.question_text}}</b></p>
<label *ngFor='let op of qu.options' class='option'><input type='radio' [name]="'q'+qu.id" (change)='answers[qu.id]=op.id'> {{op.option_text}}</label>
</div>
<button (click)='submit()'>Submeter</button>
<p *ngIf='result'>Pontuacao: {{result.score}}%</p>
</div>` })
export class HomePageComponent {
  api=inject(ApiService); quizzes:any[]=[]; currentQuiz:any=null; answers:any={}; result:any=null;
  constructor(){this.api.quizzes().subscribe(r=>this.quizzes=r.quizzes||[]);}
  start(id:number){this.answers={};this.result=null;this.api.quiz(id).subscribe(r=>this.currentQuiz=r.quiz);}
  submit(){this.api.submit(this.currentQuiz.id,this.answers).subscribe(r=>this.result=r.result);}
}

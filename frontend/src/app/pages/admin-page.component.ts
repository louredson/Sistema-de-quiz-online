import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';

@Component({ standalone: true, imports: [CommonModule], template: `
<div class='card'><h2>Painel Admin</h2>
<h3>Utilizadores</h3><ul><li *ngFor='let u of users'>{{u.name}} ({{u.role}})</li></ul>
<h3>Quizzes</h3><ul><li *ngFor='let q of quizzes'>{{q.title}} - {{q.status}}</li></ul>
</div>` })
export class AdminPageComponent {
  users:any[]=[]; quizzes:any[]=[]; api=inject(ApiService);
  constructor(){this.api.adminUsers().subscribe(r=>this.users=r.users||[]);this.api.adminQuizzes().subscribe(r=>this.quizzes=r.quizzes||[]);}
}

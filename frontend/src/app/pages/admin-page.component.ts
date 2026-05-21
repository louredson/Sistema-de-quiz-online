import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ApiService } from '../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-enter admin-grid">
      <article class="table-card">
        <div class="card-header-inline">
          <div>
            <span class="eyebrow">Administration</span>
            <h2>Utilizadores da plataforma</h2>
          </div>
          <span class="pill-status status-success">{{ users.length }} contas</span>
        </div>
        <div class="table-wrap">
          <table class="table-modern" *ngIf="users.length; else noUsers">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Role</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.role }}</td>
                <td><span class="pill-status" [class.status-success]="user.status === 'active'" [class.status-danger]="user.status !== 'active'">{{ user.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #noUsers><div class="empty-state">Sem utilizadores encontrados.</div></ng-template>
      </article>

      <article class="table-card">
        <div class="card-header-inline">
          <div>
            <span class="eyebrow">Content control</span>
            <h2>Quizzes da plataforma</h2>
          </div>
          <span class="pill-status status-warning">{{ quizzes.length }} quizzes</span>
        </div>
        <div class="table-wrap">
          <table class="table-modern" *ngIf="quizzes.length; else noQuizzes">
            <thead>
              <tr>
                <th>Titulo</th>
                <th>Categoria</th>
                <th>Autor</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let quiz of quizzes">
                <td>{{ quiz.title }}</td>
                <td>{{ quiz.category }}</td>
                <td>{{ quiz.author }}</td>
                <td><span class="pill-status" [class.status-success]="quiz.status === 'published'" [class.status-warning]="quiz.status !== 'published'">{{ quiz.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #noQuizzes><div class="empty-state">Sem quizzes encontrados.</div></ng-template>
      </article>
    </section>
  `
})
export class AdminPageComponent {
  users: any[] = [];
  quizzes: any[] = [];
  private readonly api = inject(ApiService);

  constructor() {
    this.api.adminUsers().subscribe((response) => this.users = response.users || []);
    this.api.adminQuizzes().subscribe((response) => this.quizzes = response.quizzes || []);
  }
}
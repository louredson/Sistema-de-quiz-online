import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {
  base = 'http://localhost/sistema%20de%20quiz%20online/backend/api';
  constructor(private http: HttpClient) {}

  login(data: any) { return this.http.post<any>(`${this.base}/auth/login`, data); }
  register(data: any) { return this.http.post<any>(`${this.base}/auth/register`, data); }
  quizzes() { return this.http.get<any>(`${this.base}/quizzes`); }
  quiz(id: number) { return this.http.get<any>(`${this.base}/quizzes/${id}`); }
  submit(id: number, answers: any) { return this.http.post<any>(`${this.base}/quizzes/${id}/submit`, { answers }); }
  createQuiz(data: any) { return this.http.post<any>(`${this.base}/quizzes`, data); }
  profile() { return this.http.get<any>(`${this.base}/profile`); }
  ranking() { return this.http.get<any>(`${this.base}/ranking`); }
  adminUsers() { return this.http.get<any>(`${this.base}/admin/users`); }
  adminQuizzes() { return this.http.get<any>(`${this.base}/admin/quizzes`); }
}

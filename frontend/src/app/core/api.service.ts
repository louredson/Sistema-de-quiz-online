import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {
  base = 'http://localhost/sistema%20de%20quiz%20online/backend/api';
  constructor(private http: HttpClient) {}

  login(data: any) { return this.http.post<any>(`${this.base}/auth/login`, data); }
  adminLogin(data: any) { return this.http.post<any>(`${this.base}/auth/admin-login`, data); }
  register(data: any) { return this.http.post<any>(`${this.base}/auth/register`, data); }
  forgotPassword(data: any) { return this.http.post<any>(`${this.base}/auth/forgot-password`, data); }
  resetPassword(data: any) { return this.http.post<any>(`${this.base}/auth/reset-password`, data); }
  geminiStatus() { return this.http.get<any>(`${this.base}/ai/gemini/status`); }
  triviaCategories() { return this.http.get<any>(`${this.base}/trivia/categories`); }
  quizzes() { return this.http.get<any>(`${this.base}/quizzes`); }
  quiz(id: number) { return this.http.get<any>(`${this.base}/quizzes/${id}`); }
  submit(id: number, answers: any) { return this.http.post<any>(`${this.base}/quizzes/${id}/submit`, { answers }); }
  createQuiz(data: any) { return this.http.post<any>(`${this.base}/quizzes`, data); }
  importQuiz(data: any) { return this.http.post<any>(`${this.base}/quizzes/import`, data); }
  generateAiQuiz(data: any) { return this.http.post<any>(`${this.base}/quizzes/generate-ai`, data); }
  myQuizzes() { return this.http.get<any>(`${this.base}/my/quizzes`); }
  myQuiz(id: number) { return this.http.get<any>(`${this.base}/my/quizzes/${id}`); }
  updateMyQuiz(id: number, data: any) { return this.http.put<any>(`${this.base}/my/quizzes/${id}`, data); }
  deleteMyQuiz(id: number) { return this.http.delete<any>(`${this.base}/my/quizzes/${id}`); }
  quizAttempts(id: number) { return this.http.get<any>(`${this.base}/my/quizzes/${id}/attempts`); }
  profile() { return this.http.get<any>(`${this.base}/profile`); }
  ranking() { return this.http.get<any>(`${this.base}/ranking`); }
  adminUsers() { return this.http.get<any>(`${this.base}/admin/users`); }
  adminDashboard() { return this.http.get<any>(`${this.base}/admin/dashboard`); }
  updateAdminUser(id: number, data: any) { return this.http.put<any>(`${this.base}/admin/users/${id}`, data); }
  adminReport(data: any) { return this.http.post(`${this.base}/admin/report`, data, { responseType: 'blob' }); }
}
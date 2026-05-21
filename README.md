# QUIZ - Sistema de Quiz Online

## Stack
- Frontend: Angular
- Backend: PHP (API JSON)
- Base de dados: MySQL

## 1) Base de dados
Importa o ficheiro:
- `database/quiz_system.sql`

Credenciais demo:
- Admin: `admin@quiz.com` / `admin123`
- Utilizador: `user@quiz.com` / `user1234`

## 2) Backend (XAMPP)
O backend já está em:
- `backend/index.php`

API base:
- `http://localhost/sistema%20de%20quiz%20online/backend/api`

## 3) Frontend Angular
```bash
cd frontend
npm install
npm start
```

Abre:
- `http://localhost:4300`

## Funcionalidades implementadas
- Autenticação (login/registo)
- Utilizador cria quiz (draft)
- Lista e execução de quizzes publicados
- Submissão e cálculo de score
- Perfil com dados + ranking global
- Ranking global visível para admin e utilizadores
- Painel admin (listar utilizadores e quizzes)
- Tema claro/escuro
- Alternância de idioma PT/EN
- Branding `QUIZ` com ícone no cabeçalho

## Endpoints principais
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/quizzes`
- `GET /api/quizzes/{id}`
- `POST /api/quizzes/{id}/submit`
- `POST /api/quizzes`
- `GET /api/profile`
- `GET /api/ranking`
- `GET /api/admin/users`
- `GET /api/admin/quizzes`

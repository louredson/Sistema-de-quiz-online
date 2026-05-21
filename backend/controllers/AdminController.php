<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Request.php';
require_once __DIR__ . '/../core/Response.php';

class AdminController
{
    public static function users(): void
    {
        $db = Database::getConnection();
        $rows = $db->query('SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC')->fetchAll();
        Response::json(['users' => $rows]);
    }

    public static function updateUserRole(int $userId): void
    {
        $db = Database::getConnection();
        $data = Request::body();
        $role = ($data['role'] ?? '') === 'admin' ? 'admin' : 'user';
        $status = ($data['status'] ?? '') === 'inactive' ? 'inactive' : 'active';

        $stmt = $db->prepare('UPDATE users SET role = ?, status = ? WHERE id = ?');
        $stmt->execute([$role, $status, $userId]);

        Response::json(['message' => 'Utilizador atualizado']);
    }

    public static function quizzes(): void
    {
        $db = Database::getConnection();
        $sql = 'SELECT q.id, q.title, q.category, q.status, q.created_at, u.name AS author
                FROM quizzes q INNER JOIN users u ON u.id = q.created_by
                ORDER BY q.created_at DESC';
        Response::json(['quizzes' => $db->query($sql)->fetchAll()]);
    }

    public static function updateQuizStatus(int $quizId): void
    {
        $db = Database::getConnection();
        $data = Request::body();
        $status = ($data['status'] ?? '') === 'published' ? 'published' : 'draft';

        $stmt = $db->prepare('UPDATE quizzes SET status = ? WHERE id = ?');
        $stmt->execute([$status, $quizId]);

        Response::json(['message' => 'Quiz atualizado']);
    }
}

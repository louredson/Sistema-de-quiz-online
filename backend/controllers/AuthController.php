<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Request.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../core/Jwt.php';

class AuthController
{
    public static function register(): void
    {
        $db = Database::getConnection();
        $data = Request::body();

        $name = trim($data['name'] ?? '');
        $email = strtolower(trim($data['email'] ?? ''));
        $password = $data['password'] ?? '';

        if ($name === '' || $email === '' || strlen($password) < 6) {
            Response::json(['message' => 'Dados inválidos'], 422);
        }

        $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            Response::json(['message' => 'Email já existe'], 409);
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $db->prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, "user")');
        $stmt->execute([$name, $email, $hash]);

        Response::json(['message' => 'Conta criada com sucesso']);
    }

    public static function login(): void
    {
        $db = Database::getConnection();
        $data = Request::body();

        $email = strtolower(trim($data['email'] ?? ''));
        $password = $data['password'] ?? '';

        $stmt = $db->prepare('SELECT id, name, email, role, password_hash FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            Response::json(['message' => 'Credenciais inválidas'], 401);
        }

        $token = Jwt::encode([
            'id' => (int)$user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role']
        ]);

        Response::json([
            'token' => $token,
            'user' => [
                'id' => (int)$user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role']
            ]
        ]);
    }
}

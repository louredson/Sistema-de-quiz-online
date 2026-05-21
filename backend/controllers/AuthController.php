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
        self::handleLogin(false);
    }

    public static function adminLogin(): void
    {
        self::handleLogin(true);
    }

    public static function forgotPassword(): void
    {
        $db = Database::getConnection();
        self::ensurePasswordResetsTable($db);
        $data = Request::body();
        $email = strtolower(trim($data['email'] ?? ''));

        if ($email === '') {
            Response::json(['message' => 'Email inválido'], 422);
        }

        $stmt = $db->prepare('SELECT id, email FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::json(['message' => 'Se o email existir, o pedido foi registado']);
        }

        $token = bin2hex(random_bytes(16));
        $expiresAt = date('Y-m-d H:i:s', time() + 3600);

        $db->prepare('DELETE FROM password_resets WHERE email = ?')->execute([$email]);
        $db->prepare('INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)')
            ->execute([$email, $token, $expiresAt]);

        Response::json([
            'message' => 'Pedido de recuperação criado',
            'reset_token' => $token,
            'expires_at' => $expiresAt
        ]);
    }

    public static function resetPassword(): void
    {
        $db = Database::getConnection();
        self::ensurePasswordResetsTable($db);
        $data = Request::body();
        $token = trim($data['token'] ?? '');
        $password = $data['password'] ?? '';

        if ($token === '' || strlen($password) < 6) {
            Response::json(['message' => 'Dados inválidos'], 422);
        }

        $stmt = $db->prepare('SELECT email FROM password_resets WHERE token = ? AND expires_at >= NOW()');
        $stmt->execute([$token]);
        $reset = $stmt->fetch();

        if (!$reset) {
            Response::json(['message' => 'Token inválido ou expirado'], 400);
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $db->prepare('UPDATE users SET password_hash = ? WHERE email = ?')->execute([$hash, $reset['email']]);
        $db->prepare('DELETE FROM password_resets WHERE email = ?')->execute([$reset['email']]);

        Response::json(['message' => 'Senha redefinida com sucesso']);
    }

    private static function handleLogin(bool $requireAdmin): void
    {
        $db = Database::getConnection();
        $data = Request::body();

        $email = strtolower(trim($data['email'] ?? ''));
        $password = $data['password'] ?? '';

        $stmt = $db->prepare('SELECT id, name, email, role, status, password_hash FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            Response::json(['message' => 'Credenciais inválidas'], 401);
        }

        if (($user['status'] ?? 'active') !== 'active') {
            Response::json(['message' => 'Conta inativa'], 403);
        }

        if ($requireAdmin && ($user['role'] ?? '') !== 'admin') {
            Response::json(['message' => 'Acesso reservado ao admin'], 403);
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

    private static function ensurePasswordResetsTable(PDO $db): void
    {
        $db->exec('CREATE TABLE IF NOT EXISTS password_resets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(150) NOT NULL,
            token VARCHAR(64) NOT NULL UNIQUE,
            expires_at DATETIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');
    }
}

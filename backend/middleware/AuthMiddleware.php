<?php
require_once __DIR__ . '/../core/Request.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../core/Jwt.php';

class AuthMiddleware
{
    public static function user(): array
    {
        $token = Request::bearerToken();
        if (!$token) {
            Response::json(['message' => 'Token ausente'], 401);
        }

        $payload = Jwt::decode($token);
        if (!$payload) {
            Response::json(['message' => 'Token inválido'], 401);
        }

        return $payload;
    }

    public static function admin(): array
    {
        $user = self::user();
        if (($user['role'] ?? '') !== 'admin') {
            Response::json(['message' => 'Acesso negado'], 403);
        }
        return $user;
    }
}

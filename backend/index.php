<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/core/Response.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/QuizController.php';
require_once __DIR__ . '/controllers/UserController.php';
require_once __DIR__ . '/controllers/AdminController.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$method = $_SERVER['REQUEST_METHOD'];
$base = '/sistema de quiz online/backend';
$route = str_replace($base, '', $uri);

try {
    if ($route === '/api/auth/register' && $method === 'POST') {
        AuthController::register();
    }

    if ($route === '/api/auth/login' && $method === 'POST') {
        AuthController::login();
    }

    if ($route === '/api/quizzes' && $method === 'GET') {
        QuizController::listPublished();
    }

    if (preg_match('#^/api/quizzes/(\d+)$#', $route, $m) && $method === 'GET') {
        QuizController::getById((int)$m[1]);
    }

    if ($route === '/api/quizzes' && $method === 'POST') {
        $user = AuthMiddleware::user();
        QuizController::create((int)$user['id']);
    }

    if (preg_match('#^/api/quizzes/(\d+)/submit$#', $route, $m) && $method === 'POST') {
        $user = AuthMiddleware::user();
        QuizController::submit((int)$m[1], (int)$user['id']);
    }

    if ($route === '/api/profile' && $method === 'GET') {
        $user = AuthMiddleware::user();
        UserController::profile((int)$user['id']);
    }

    if ($route === '/api/ranking' && $method === 'GET') {
        AuthMiddleware::user();
        UserController::ranking();
    }

    if ($route === '/api/admin/users' && $method === 'GET') {
        AuthMiddleware::admin();
        AdminController::users();
    }

    if (preg_match('#^/api/admin/users/(\d+)$#', $route, $m) && $method === 'PUT') {
        AuthMiddleware::admin();
        AdminController::updateUserRole((int)$m[1]);
    }

    if ($route === '/api/admin/quizzes' && $method === 'GET') {
        AuthMiddleware::admin();
        AdminController::quizzes();
    }

    if (preg_match('#^/api/admin/quizzes/(\d+)$#', $route, $m) && $method === 'PUT') {
        AuthMiddleware::admin();
        AdminController::updateQuizStatus((int)$m[1]);
    }

    Response::json(['message' => 'Rota não encontrada', 'route' => $route], 404);
} catch (Throwable $e) {
    Response::json(['message' => 'Erro interno', 'error' => $e->getMessage()], 500);
}

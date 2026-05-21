<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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
$scriptName = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '');
$base = rtrim(str_replace('/index.php', '', $scriptName), '/');
$route = $uri;

if ($base !== '' && str_starts_with($route, $base)) {
    $route = substr($route, strlen($base));
}

if (str_starts_with($route, '/index.php')) {
    $route = substr($route, strlen('/index.php'));
}

if ($route === '') {
    $route = '/';
}

try {
    if ($route === '/api/auth/register' && $method === 'POST') {
        AuthController::register();
    }

    if ($route === '/api/auth/login' && $method === 'POST') {
        AuthController::login();
    }

    if ($route === '/api/auth/admin-login' && $method === 'POST') {
        AuthController::adminLogin();
    }

    if ($route === '/api/auth/forgot-password' && $method === 'POST') {
        AuthController::forgotPassword();
    }

    if ($route === '/api/auth/reset-password' && $method === 'POST') {
        AuthController::resetPassword();
    }

    if ($route === '/api/quizzes' && $method === 'GET') {
        QuizController::listPublished();
    }

    if ($route === '/api/trivia/categories' && $method === 'GET') {
        AuthMiddleware::user();
        QuizController::externalCategories();
    }

    if (preg_match('#^/api/quizzes/(\d+)$#', $route, $m) && $method === 'GET') {
        QuizController::getById((int)$m[1]);
    }

    if ($route === '/api/my/quizzes' && $method === 'GET') {
        $user = AuthMiddleware::user();
        QuizController::listMine((int)$user['id'], ($user['role'] ?? '') === 'admin');
    }

    if (preg_match('#^/api/my/quizzes/(\d+)$#', $route, $m) && $method === 'GET') {
        $user = AuthMiddleware::user();
        QuizController::getEditableById((int)$m[1], (int)$user['id'], ($user['role'] ?? '') === 'admin');
    }

    if ($route === '/api/quizzes' && $method === 'POST') {
        $user = AuthMiddleware::user();
        QuizController::create((int)$user['id']);
    }

    if ($route === '/api/quizzes/import' && $method === 'POST') {
        $user = AuthMiddleware::user();
        QuizController::importFromExternal((int)$user['id']);
    }

    if (preg_match('#^/api/my/quizzes/(\d+)$#', $route, $m) && $method === 'PUT') {
        $user = AuthMiddleware::user();
        QuizController::update((int)$m[1], (int)$user['id'], ($user['role'] ?? '') === 'admin');
    }

    if (preg_match('#^/api/my/quizzes/(\d+)$#', $route, $m) && $method === 'DELETE') {
        $user = AuthMiddleware::user();
        QuizController::delete((int)$m[1], (int)$user['id'], ($user['role'] ?? '') === 'admin');
    }

    if (preg_match('#^/api/my/quizzes/(\d+)/attempts$#', $route, $m) && $method === 'GET') {
        $user = AuthMiddleware::user();
        QuizController::attemptsForQuiz((int)$m[1], (int)$user['id'], ($user['role'] ?? '') === 'admin');
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

<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/ExternalTriviaService.php';
require_once __DIR__ . '/../core/GeminiQuizService.php';
require_once __DIR__ . '/../core/Request.php';
require_once __DIR__ . '/../core/Response.php';

class QuizController
{
    private static function ensureNonAdmin(int $userId): void
    {
        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT role FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $role = $stmt->fetchColumn();
        if ($role === 'admin') {
            Response::json(['message' => 'O administrador nao pode jogar ou criar quizzes'], 403);
        }
    }

    public static function listPublished(): void
    {
        $db = Database::getConnection();
        $sql = 'SELECT q.id, q.title, q.description, q.category, q.created_by, q.created_at, u.name AS author,
                       (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) AS question_count,
                       (SELECT COUNT(*) FROM quiz_attempts qa WHERE qa.quiz_id = q.id) AS attempts_count
                FROM quizzes q
                INNER JOIN users u ON u.id = q.created_by
                WHERE q.status = "published"
                ORDER BY q.created_at DESC';
        $rows = $db->query($sql)->fetchAll();
        Response::json(['quizzes' => $rows]);
    }

    public static function getById(int $id): void
    {
        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT id, title, description, category FROM quizzes WHERE id = ? AND status = "published"');
        $stmt->execute([$id]);
        $quiz = $stmt->fetch();

        if (!$quiz) {
            Response::json(['message' => 'Quiz nao encontrado'], 404);
        }

        $quiz['questions'] = self::loadQuestions($db, $id, false);
        Response::json(['quiz' => $quiz]);
    }

    public static function listMine(int $userId, bool $isAdmin = false): void
    {
        $db = Database::getConnection();
        $sql = 'SELECT q.id, q.title, q.description, q.category, q.status, q.created_at, u.name AS author,
                       (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) AS question_count,
                       (SELECT COUNT(*) FROM quiz_attempts qa WHERE qa.quiz_id = q.id) AS attempts_count
                FROM quizzes q
                INNER JOIN users u ON u.id = q.created_by
                WHERE q.created_by = :user_id';

        $sql .= ' ORDER BY q.created_at DESC';
        $stmt = $db->prepare($sql);
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();

        Response::json(['quizzes' => $stmt->fetchAll()]);
    }

    public static function getEditableById(int $id, int $userId, bool $isAdmin = false): void
    {
        $db = Database::getConnection();
        $quiz = self::fetchQuizForOwner($db, $id, $userId, $isAdmin);
        if (!$quiz) {
            Response::json(['message' => 'Quiz nao encontrado'], 404);
        }

        $quiz['questions'] = self::loadQuestions($db, $id, true);
        Response::json(['quiz' => $quiz]);
    }

    public static function submit(int $quizId, int $userId): void
    {
        self::ensureNonAdmin($userId);
        $db = Database::getConnection();
        $answers = Request::body()['answers'] ?? [];
        if (!is_array($answers) || count($answers) === 0) {
            Response::json(['message' => 'Respostas invalidas'], 422);
        }

        $stmt = $db->prepare('SELECT qq.id AS question_id, qo.id AS correct_option_id
                              FROM quiz_questions qq
                              INNER JOIN quiz_options qo ON qo.question_id = qq.id AND qo.is_correct = 1
                              WHERE qq.quiz_id = ?');
        $stmt->execute([$quizId]);
        $correctRows = $stmt->fetchAll();

        if (!$correctRows) {
            Response::json(['message' => 'Quiz sem perguntas'], 422);
        }

        $correctMap = [];
        foreach ($correctRows as $row) {
            $correctMap[(int)$row['question_id']] = (int)$row['correct_option_id'];
        }

        $total = count($correctMap);
        $correct = 0;
        foreach ($answers as $questionId => $optionId) {
            $q = (int)$questionId;
            if (isset($correctMap[$q]) && $correctMap[$q] === (int)$optionId) {
                $correct++;
            }
        }

        $score = (int)round(($correct / $total) * 100);

        $insert = $db->prepare('INSERT INTO quiz_attempts (quiz_id, user_id, total_questions, correct_answers, score) VALUES (?, ?, ?, ?, ?)');
        $insert->execute([$quizId, $userId, $total, $correct, $score]);

        Response::json([
            'result' => [
                'score' => $score,
                'correct_answers' => $correct,
                'total_questions' => $total
            ]
        ]);
    }

    public static function create(int $userId): void
    {
        $db = Database::getConnection();
        $data = Request::body();
        $quizId = self::persistQuiz($db, $data, $userId);
        Response::json(['message' => 'Quiz criado', 'quiz_id' => $quizId], 201);
    }

    public static function update(int $quizId, int $userId, bool $isAdmin = false): void
    {
        $db = Database::getConnection();
        if (!self::fetchQuizForOwner($db, $quizId, $userId, $isAdmin)) {
            Response::json(['message' => 'Quiz nao encontrado'], 404);
        }

        $data = Request::body();
        self::persistQuiz($db, $data, $userId, $quizId);
        Response::json(['message' => 'Quiz atualizado', 'quiz_id' => $quizId]);
    }

    public static function delete(int $quizId, int $userId, bool $isAdmin = false): void
    {
        $db = Database::getConnection();
        if (!self::fetchQuizForOwner($db, $quizId, $userId, $isAdmin)) {
            Response::json(['message' => 'Quiz nao encontrado'], 404);
        }

        $stmt = $db->prepare('DELETE FROM quizzes WHERE id = ?');
        $stmt->execute([$quizId]);
        Response::json(['message' => 'Quiz removido']);
    }

    public static function importFromExternal(int $userId): void
    {
        $db = Database::getConnection();
        $data = Request::body();
        $questions = ExternalTriviaService::questions($data);
        if (!$questions) {
            Response::json(['message' => 'A API externa nao devolveu perguntas'], 422);
        }

        $normalized = [];
        $title = trim($data['title'] ?? '');
        $category = trim($data['category_name'] ?? '');

        foreach ($questions as $row) {
            $decodedQuestion = urldecode((string)($row['question'] ?? ''));
            $correct = urldecode((string)($row['correct_answer'] ?? ''));
            $incorrect = array_map(static fn ($item) => urldecode((string)$item), $row['incorrect_answers'] ?? []);
            $options = $incorrect;
            $options[] = $correct;
            shuffle($options);

            $correctIndex = array_search($correct, $options, true);
            $normalized[] = [
                'question_text' => html_entity_decode($decodedQuestion, ENT_QUOTES | ENT_HTML5),
                'options' => array_map(static fn ($item) => html_entity_decode($item, ENT_QUOTES | ENT_HTML5), $options),
                'correct_index' => $correctIndex === false ? 0 : $correctIndex
            ];

            if ($title === '') {
                $title = 'Quiz Importado - ' . html_entity_decode(urldecode((string)($row['category'] ?? 'Trivia')), ENT_QUOTES | ENT_HTML5);
            }

            if ($category === '') {
                $category = html_entity_decode(urldecode((string)($row['category'] ?? 'Geral')), ENT_QUOTES | ENT_HTML5);
            }
        }

        $quizId = self::persistQuiz($db, [
            'title' => $title,
            'description' => trim($data['description'] ?? 'Importado automaticamente da Open Trivia DB'),
            'category' => $category !== '' ? $category : 'Geral',
            'status' => $data['status'] ?? 'draft',
            'questions' => $normalized
        ], $userId);

        Response::json([
            'message' => 'Quiz importado com sucesso',
            'quiz_id' => $quizId,
            'questions_imported' => count($normalized),
            'source' => 'Open Trivia DB'
        ], 201);
    }

    public static function generateWithGemini(int $userId): void
    {
        $db = Database::getConnection();
        $data = Request::body();
        $generated = GeminiQuizService::generate($data);
        $quizId = self::persistQuiz($db, [
            'title' => $generated['title'],
            'description' => $generated['description'],
            'category' => $generated['category'],
            'status' => $data['status'] ?? 'draft',
            'questions' => $generated['questions']
        ], $userId);

        Response::json([
            'message' => 'Quiz gerado com sucesso',
            'quiz_id' => $quizId,
            'questions_generated' => count($generated['questions']),
            'source' => 'Gemini API'
        ], 201);
    }

    public static function geminiStatus(): void
    {
        Response::json(GeminiQuizService::status());
    }

    public static function externalCategories(): void
    {
        Response::json(['categories' => ExternalTriviaService::categories()]);
    }

    public static function attemptsForQuiz(int $quizId, int $userId, bool $isAdmin = false): void
    {
        $db = Database::getConnection();
        if (!self::fetchQuizForOwner($db, $quizId, $userId, $isAdmin)) {
            Response::json(['message' => 'Quiz nao encontrado'], 404);
        }

        $stmt = $db->prepare('SELECT qa.id, qa.total_questions, qa.correct_answers, qa.score, qa.created_at, u.name AS player_name
                              FROM quiz_attempts qa
                              INNER JOIN users u ON u.id = qa.user_id
                              WHERE qa.quiz_id = ?
                              ORDER BY qa.created_at DESC');
        $stmt->execute([$quizId]);
        Response::json(['attempts' => $stmt->fetchAll()]);
    }

    private static function persistQuiz(PDO $db, array $data, int $userId, ?int $quizId = null): int
    {
        $title = trim($data['title'] ?? '');
        $category = trim($data['category'] ?? 'Geral');
        $description = trim($data['description'] ?? '');
        $questions = $data['questions'] ?? [];

        if ($title === '' || !is_array($questions) || count($questions) === 0) {
            Response::json(['message' => 'Dados do quiz invalidos'], 422);
        }

        $status = ($data['status'] ?? 'draft') === 'published' ? 'published' : 'draft';

        $db->beginTransaction();
        try {
            if ($quizId === null) {
                $stmt = $db->prepare('INSERT INTO quizzes (title, description, category, created_by, status) VALUES (?, ?, ?, ?, ?)');
                $stmt->execute([$title, $description, $category, $userId, $status]);
                $quizId = (int)$db->lastInsertId();
            } else {
                $stmt = $db->prepare('UPDATE quizzes SET title = ?, description = ?, category = ?, status = ? WHERE id = ?');
                $stmt->execute([$title, $description, $category, $status, $quizId]);
                $db->prepare('DELETE FROM quiz_questions WHERE quiz_id = ?')->execute([$quizId]);
            }

            foreach ($questions as $question) {
                self::insertQuestion($db, $quizId, $question);
            }

            $db->commit();
            return $quizId;
        } catch (Throwable $e) {
            $db->rollBack();
            Response::json(['message' => 'Falha ao guardar quiz', 'error' => $e->getMessage()], 500);
        }
    }

    private static function insertQuestion(PDO $db, int $quizId, array $question): void
    {
        $qText = trim($question['question_text'] ?? '');
        $options = $question['options'] ?? [];
        $correctIndex = (int)($question['correct_index'] ?? -1);

        if ($qText === '' || count($options) < 2 || $correctIndex < 0 || $correctIndex >= count($options)) {
            throw new Exception('Pergunta invalida');
        }

        $qStmt = $db->prepare('INSERT INTO quiz_questions (quiz_id, question_text) VALUES (?, ?)');
        $qStmt->execute([$quizId, $qText]);
        $questionId = (int)$db->lastInsertId();

        foreach ($options as $idx => $opt) {
            $oStmt = $db->prepare('INSERT INTO quiz_options (question_id, option_text, is_correct) VALUES (?, ?, ?)');
            $oStmt->execute([$questionId, trim((string)$opt), $idx === $correctIndex ? 1 : 0]);
        }
    }

    private static function loadQuestions(PDO $db, int $quizId, bool $includeAnswers = false): array
    {
        $stmt = $db->prepare('SELECT id, question_text FROM quiz_questions WHERE quiz_id = ? ORDER BY id ASC');
        $stmt->execute([$quizId]);
        $questions = $stmt->fetchAll();

        foreach ($questions as &$question) {
            $opt = $db->prepare('SELECT id, option_text, is_correct FROM quiz_options WHERE question_id = ? ORDER BY id ASC');
            $opt->execute([$question['id']]);
            $options = $opt->fetchAll();
            if (!$includeAnswers) {
                $options = array_map(static fn ($row) => [
                    'id' => $row['id'],
                    'option_text' => $row['option_text']
                ], $options);
            }
            $question['options'] = $options;
        }

        return $questions;
    }

    private static function fetchQuizForOwner(PDO $db, int $quizId, int $userId, bool $isAdmin = false): ?array
    {
        $sql = 'SELECT q.id, q.title, q.description, q.category, q.status, q.created_by, q.created_at, u.name AS author,
                       (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) AS question_count,
                       (SELECT COUNT(*) FROM quiz_attempts qa WHERE qa.quiz_id = q.id) AS attempts_count
                FROM quizzes q
                INNER JOIN users u ON u.id = q.created_by
                WHERE q.id = :quiz_id';

        if (!$isAdmin) {
            $sql .= ' AND q.created_by = :user_id';
        }

        $stmt = $db->prepare($sql);
        $stmt->bindValue(':quiz_id', $quizId, PDO::PARAM_INT);
        if (!$isAdmin) {
            $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        }
        $stmt->execute();

        return $stmt->fetch() ?: null;
    }
}

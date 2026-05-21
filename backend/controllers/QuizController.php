<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Request.php';
require_once __DIR__ . '/../core/Response.php';

class QuizController
{
    public static function listPublished(): void
    {
        $db = Database::getConnection();
        $sql = 'SELECT q.id, q.title, q.description, q.category, q.created_by, u.name AS author
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
            Response::json(['message' => 'Quiz não encontrado'], 404);
        }

        $stmt = $db->prepare('SELECT id, question_text FROM quiz_questions WHERE quiz_id = ? ORDER BY id ASC');
        $stmt->execute([$id]);
        $questions = $stmt->fetchAll();

        foreach ($questions as &$question) {
            $opt = $db->prepare('SELECT id, option_text FROM quiz_options WHERE question_id = ? ORDER BY id ASC');
            $opt->execute([$question['id']]);
            $question['options'] = $opt->fetchAll();
        }

        $quiz['questions'] = $questions;
        Response::json(['quiz' => $quiz]);
    }

    public static function submit(int $quizId, int $userId): void
    {
        $db = Database::getConnection();
        $answers = Request::body()['answers'] ?? [];
        if (!is_array($answers) || count($answers) === 0) {
            Response::json(['message' => 'Respostas inválidas'], 422);
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
        $title = trim($data['title'] ?? '');
        $category = trim($data['category'] ?? 'Geral');
        $description = trim($data['description'] ?? '');
        $questions = $data['questions'] ?? [];

        if ($title === '' || !is_array($questions) || count($questions) === 0) {
            Response::json(['message' => 'Dados do quiz inválidos'], 422);
        }

        $db->beginTransaction();
        try {
            $status = ($data['status'] ?? 'draft') === 'published' ? 'published' : 'draft';
            $stmt = $db->prepare('INSERT INTO quizzes (title, description, category, created_by, status) VALUES (?, ?, ?, ?, ?)');
            $stmt->execute([$title, $description, $category, $userId, $status]);
            $quizId = (int)$db->lastInsertId();

            foreach ($questions as $question) {
                $qText = trim($question['question_text'] ?? '');
                $options = $question['options'] ?? [];
                $correctIndex = (int)($question['correct_index'] ?? -1);

                if ($qText === '' || count($options) < 2 || $correctIndex < 0 || $correctIndex >= count($options)) {
                    throw new Exception('Pergunta inválida');
                }

                $qStmt = $db->prepare('INSERT INTO quiz_questions (quiz_id, question_text) VALUES (?, ?)');
                $qStmt->execute([$quizId, $qText]);
                $questionId = (int)$db->lastInsertId();

                foreach ($options as $idx => $opt) {
                    $oStmt = $db->prepare('INSERT INTO quiz_options (question_id, option_text, is_correct) VALUES (?, ?, ?)');
                    $oStmt->execute([$questionId, trim((string)$opt), $idx === $correctIndex ? 1 : 0]);
                }
            }

            $db->commit();
            Response::json(['message' => 'Quiz criado', 'quiz_id' => $quizId], 201);
        } catch (Throwable $e) {
            $db->rollBack();
            Response::json(['message' => 'Falha ao criar quiz', 'error' => $e->getMessage()], 500);
        }
    }
}

<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Request.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../core/SimplePdfReport.php';

class AdminController
{
    public static function users(): void
    {
        $db = Database::getConnection();
        $rows = $db->query('SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC')->fetchAll();
        Response::json(['users' => $rows]);
    }

    public static function updateUserAccess(int $userId): void
    {
        $db = Database::getConnection();
        $data = Request::body();
        $status = ($data['status'] ?? '') === 'inactive' ? 'inactive' : 'active';

        $stmt = $db->prepare('UPDATE users SET status = ? WHERE id = ? AND role = "user"');
        $stmt->execute([$status, $userId]);

        Response::json(['message' => $status === 'inactive' ? 'Utilizador bloqueado' : 'Utilizador desbloqueado']);
    }

    public static function dashboard(): void
    {
        $db = Database::getConnection();
        $totals = [
            'users' => (int)$db->query('SELECT COUNT(*) FROM users WHERE role = "user"')->fetchColumn(),
            'active_users' => (int)$db->query('SELECT COUNT(*) FROM users WHERE role = "user" AND status = "active"')->fetchColumn(),
            'inactive_users' => (int)$db->query('SELECT COUNT(*) FROM users WHERE role = "user" AND status = "inactive"')->fetchColumn(),
            'quizzes' => (int)$db->query('SELECT COUNT(*) FROM quizzes')->fetchColumn(),
            'published_quizzes' => (int)$db->query('SELECT COUNT(*) FROM quizzes WHERE status = "published"')->fetchColumn(),
            'attempts' => (int)$db->query('SELECT COUNT(*) FROM quiz_attempts')->fetchColumn()
        ];

        $bestStmt = $db->query('SELECT u.name, COALESCE(SUM(qa.score), 0) AS total_score
                                FROM users u
                                LEFT JOIN quiz_attempts qa ON qa.user_id = u.id
                                WHERE u.role = "user"
                                GROUP BY u.id, u.name
                                ORDER BY total_score DESC, u.name ASC
                                LIMIT 1');
        $best = $bestStmt->fetch() ?: ['name' => 'Sem dados', 'total_score' => 0];

        Response::json([
            'summary' => $totals,
            'best_scorer' => [
                'name' => $best['name'],
                'total_score' => (int)$best['total_score']
            ]
        ]);
    }

    public static function report(): void
    {
        $db = Database::getConnection();
        $data = Request::body();
        $participants = max(1, min(100, (int)($data['participants'] ?? 10)));
        $generatedAt = date('Y-m-d H:i:s');

        $summary = [
            'users' => (int)$db->query('SELECT COUNT(*) FROM users WHERE role = "user"')->fetchColumn(),
            'active_users' => (int)$db->query('SELECT COUNT(*) FROM users WHERE role = "user" AND status = "active"')->fetchColumn(),
            'inactive_users' => (int)$db->query('SELECT COUNT(*) FROM users WHERE role = "user" AND status = "inactive"')->fetchColumn(),
            'quizzes' => (int)$db->query('SELECT COUNT(*) FROM quizzes')->fetchColumn(),
            'published_quizzes' => (int)$db->query('SELECT COUNT(*) FROM quizzes WHERE status = "published"')->fetchColumn(),
            'attempts' => (int)$db->query('SELECT COUNT(*) FROM quiz_attempts')->fetchColumn()
        ];

        $bestStmt = $db->query('SELECT u.name,
                                       COUNT(qa.id) AS attempts,
                                       COALESCE(SUM(qa.score), 0) AS total_score,
                                       COALESCE(MAX(qa.score), 0) AS best_score
                                FROM users u
                                LEFT JOIN quiz_attempts qa ON qa.user_id = u.id
                                WHERE u.role = "user"
                                GROUP BY u.id, u.name
                                ORDER BY total_score DESC, best_score DESC, u.name ASC
                                LIMIT 1');
        $best = $bestStmt->fetch() ?: ['name' => 'Sem dados', 'attempts' => 0, 'total_score' => 0, 'best_score' => 0];

        $rankingStmt = $db->prepare('SELECT u.name,
                                            COUNT(qa.id) AS attempts,
                                            COALESCE(SUM(qa.score), 0) AS total_score,
                                            COALESCE(MAX(qa.score), 0) AS best_score,
                                            COALESCE(AVG(qa.score), 0) AS avg_score
                                     FROM users u
                                     LEFT JOIN quiz_attempts qa ON qa.user_id = u.id
                                     WHERE u.role = "user"
                                     GROUP BY u.id, u.name
                                     ORDER BY total_score DESC, best_score DESC, avg_score DESC, u.name ASC
                                     LIMIT ?');
        $rankingStmt->bindValue(1, $participants, PDO::PARAM_INT);
        $rankingStmt->execute();
        $ranking = $rankingStmt->fetchAll();

        $pdf = new SimplePdfReport();
        $pdf->setFont('Helvetica', 18);
        $pdf->line('QuizVerse - Relatorio do Sistema', 40, 800);
        $pdf->setFont('Helvetica', 10);
        $pdf->line('Gerado em: ' . $generatedAt, 40);
        $pdf->line('Participantes no ranking impresso: ' . $participants, 40);
        $pdf->spacer(8);

        $pdf->setFont('Helvetica', 13);
        $pdf->line('Resumo geral', 40);
        $pdf->setFont('Courier', 10);
        $pdf->line(sprintf('%-28s %s', 'Total de users:', $summary['users']), 45);
        $pdf->line(sprintf('%-28s %s', 'Users ativos:', $summary['active_users']), 45);
        $pdf->line(sprintf('%-28s %s', 'Users bloqueados:', $summary['inactive_users']), 45);
        $pdf->line(sprintf('%-28s %s', 'Total de quizzes:', $summary['quizzes']), 45);
        $pdf->line(sprintf('%-28s %s', 'Quizzes publicados:', $summary['published_quizzes']), 45);
        $pdf->line(sprintf('%-28s %s', 'Total de tentativas:', $summary['attempts']), 45);
        $pdf->spacer(8);

        $pdf->setFont('Helvetica', 13);
        $pdf->line('Melhor pontuador', 40);
        $pdf->setFont('Courier', 10);
        $pdf->line(sprintf('%-28s %s', 'Nome:', $best['name']), 45);
        $pdf->line(sprintf('%-28s %s', 'Pontuacao total:', (int)$best['total_score']), 45);
        $pdf->line(sprintf('%-28s %s', 'Melhor score:', (int)$best['best_score'] . '%'), 45);
        $pdf->line(sprintf('%-28s %s', 'Tentativas:', (int)$best['attempts']), 45);
        $pdf->spacer(10);

        $pdf->setFont('Helvetica', 13);
        $pdf->line('Ranking geral', 40);
        $pdf->setFont('Courier', 9);
        $pdf->line(sprintf('%-4s %-22s %-12s %-12s %-10s %-10s', '#', 'Jogador', 'Total', 'Melhor', 'Media', 'Tentativas'), 45);

        foreach ($ranking as $index => $row) {
            $line = sprintf(
                '%-4s %-22s %-12s %-12s %-10s %-10s',
                $index + 1,
                self::fitText($row['name'], 22),
                (int)$row['total_score'],
                (int)$row['best_score'] . '%',
                round((float)$row['avg_score'], 2) . '%',
                (int)$row['attempts']
            );
            $pdf->line($line, 45);
        }

        $pdf->spacer(8);
        $pdf->setFont('Helvetica', 9);
        $pdf->line('Relatorio emitido pelo modulo administrativo do QuizVerse.', 40);
        $pdf->output('quizverse-relatorio-' . date('Ymd-His') . '.pdf');
    }

    private static function fitText(string $text, int $limit): string
    {
        $text = trim($text);
        if (strlen($text) <= $limit) {
            return $text;
        }

        return substr($text, 0, max(0, $limit - 3)) . '...';
    }
}

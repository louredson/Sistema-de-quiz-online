<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Response.php';

class UserController
{
    public static function profile(int $userId): void
    {
        $db = Database::getConnection();

        $stmt = $db->prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (($user['role'] ?? '') === 'admin') {
            Response::json([
                'profile' => $user,
                'stats' => [
                    'total_attempts' => 0,
                    'best_score' => 0,
                    'avg_score' => 0,
                    'global_rank' => 0
                ]
            ]);
        }

        $stats = $db->prepare('SELECT COUNT(*) AS total_attempts, COALESCE(MAX(score), 0) AS best_score, COALESCE(AVG(score), 0) AS avg_score FROM quiz_attempts WHERE user_id = ?');
        $stats->execute([$userId]);
        $summary = $stats->fetch();

        $rankStmt = $db->prepare('SELECT rank_position FROM (
            SELECT user_id, DENSE_RANK() OVER (ORDER BY total_score DESC) AS rank_position
            FROM (
                SELECT user_id, SUM(score) AS total_score FROM quiz_attempts GROUP BY user_id
            ) points
        ) ranking WHERE user_id = ?');
        $rankStmt->execute([$userId]);
        $rank = $rankStmt->fetch();

        Response::json([
            'profile' => $user,
            'stats' => [
                'total_attempts' => (int)$summary['total_attempts'],
                'best_score' => round((float)$summary['best_score'], 4),
                'avg_score' => round((float)$summary['avg_score'], 4),
                'global_rank' => (int)($rank['rank_position'] ?? 0)
            ]
        ]);
    }

    public static function ranking(): void
    {
        $db = Database::getConnection();
        $sql = 'SELECT u.id, u.name,
                       COUNT(qa.id) AS attempts,
                       COALESCE(SUM(qa.score), 0) AS total_score,
                       COALESCE(MAX(qa.score), 0) AS best_score,
                       COALESCE(AVG(qa.score), 0) AS avg_score
                FROM users u
                LEFT JOIN quiz_attempts qa ON qa.user_id = u.id
                WHERE u.role = "user"
                GROUP BY u.id, u.name
                ORDER BY total_score DESC, best_score DESC, avg_score DESC
                LIMIT 100';

        $rows = $db->query($sql)->fetchAll();
        $ranked = [];
        foreach ($rows as $index => $row) {
            $row['position'] = $index + 1;
            $row['attempts'] = (int)$row['attempts'];
            $row['total_score'] = round((float)$row['total_score'], 4);
            $row['best_score'] = round((float)$row['best_score'], 4);
            $row['avg_score'] = round((float)$row['avg_score'], 4);
            $ranked[] = $row;
        }

        Response::json(['ranking' => $ranked]);
    }
}

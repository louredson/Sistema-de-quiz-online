<?php
require_once __DIR__ . '/Response.php';

class ExternalTriviaService
{
    private const BASE_URL = 'https://opentdb.com';

    public static function categories(): array
    {
        $data = self::request(self::BASE_URL . '/api_category.php');
        return $data['trivia_categories'] ?? [];
    }

    public static function questions(array $filters): array
    {
        $params = [
            'amount' => max(1, min(20, (int)($filters['amount'] ?? 10))),
            'encode' => 'url3986'
        ];

        if (!empty($filters['category'])) {
            $params['category'] = (int)$filters['category'];
        }

        if (!empty($filters['difficulty'])) {
            $params['difficulty'] = $filters['difficulty'];
        }

        if (!empty($filters['type'])) {
            $params['type'] = $filters['type'];
        }

        $url = self::BASE_URL . '/api.php?' . http_build_query($params);
        $data = self::request($url);

        $responseCode = (int)($data['response_code'] ?? -1);
        if ($responseCode !== 0) {
            Response::json([
                'message' => 'A API externa não conseguiu devolver perguntas',
                'response_code' => $responseCode
            ], 422);
        }

        return $data['results'] ?? [];
    }

    private static function request(string $url): array
    {
        $raw = null;

        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 15,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_SSL_VERIFYPEER => true,
                CURLOPT_HTTPHEADER => ['Accept: application/json']
            ]);
            $raw = curl_exec($ch);
            $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);

            if ($raw === false || $status >= 400) {
                Response::json([
                    'message' => 'Falha ao contactar a API externa',
                    'error' => $error ?: ('HTTP ' . $status)
                ], 502);
            }
        } else {
            $context = stream_context_create([
                'http' => [
                    'method' => 'GET',
                    'timeout' => 15,
                    'header' => "Accept: application/json\r\n"
                ]
            ]);
            $raw = @file_get_contents($url, false, $context);
            if ($raw === false) {
                Response::json(['message' => 'Falha ao contactar a API externa'], 502);
            }
        }

        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) {
            Response::json(['message' => 'Resposta inválida da API externa'], 502);
        }

        return $decoded;
    }
}

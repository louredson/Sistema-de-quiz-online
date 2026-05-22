<?php
require_once __DIR__ . '/Response.php';

class GeminiQuizService
{
    public static function status(): array
    {
        $config = require __DIR__ . '/../config/config.php';

        return [
            'configured' => trim((string)($config['gemini_api_key'] ?? '')) !== '',
            'model' => $config['gemini_model'] ?? 'gemini-2.5-flash'
        ];
    }

    public static function generate(array $input): array
    {
        $config = require __DIR__ . '/../config/config.php';
        $apiKey = trim((string)($config['gemini_api_key'] ?? ''));
        $model = trim((string)($config['gemini_model'] ?? 'gemini-2.5-flash'));

        if ($apiKey === '') {
            throw new RuntimeException('A chave da Gemini API ainda nao foi configurada.');
        }

        $amount = max(3, min(15, (int)($input['amount'] ?? 8)));
        $topic = trim((string)($input['topic'] ?? 'Conhecimentos gerais'));
        $title = trim((string)($input['title'] ?? ''));
        $category = trim((string)($input['category'] ?? $topic));
        $difficulty = trim((string)($input['difficulty'] ?? 'medium'));
        $language = trim((string)($input['language'] ?? 'pt'));
        $audience = trim((string)($input['audience'] ?? 'estudantes e curiosos'));
        $description = trim((string)($input['description'] ?? ''));

        $prompt = "Cria um quiz original e equilibrado para uma plataforma online. "
            . "Tema principal: {$topic}. "
            . "Categoria: {$category}. "
            . "Publico-alvo: {$audience}. "
            . "Dificuldade: {$difficulty}. "
            . "Idioma de saida: {$language}. "
            . "Quantidade de perguntas: {$amount}. "
            . "Cada pergunta deve ter 4 opcoes curtas, apenas 1 correta e um indice correto entre 0 e 3. "
            . "Evita perguntas ambigueas, repetidas ou demasiado obvias. "
            . ($title !== '' ? "Usa como titulo base: {$title}. " : '')
            . ($description !== '' ? "Descricao base: {$description}. " : '')
            . "Responde apenas em JSON valido seguindo exatamente o schema pedido.";

        $payload = [
            'contents' => [[
                'parts' => [[
                    'text' => $prompt
                ]]
            ]],
            'generationConfig' => [
                'temperature' => 0.7,
                'responseMimeType' => 'application/json',
                'responseSchema' => [
                    'type' => 'OBJECT',
                    'properties' => [
                        'title' => ['type' => 'STRING'],
                        'description' => ['type' => 'STRING'],
                        'category' => ['type' => 'STRING'],
                        'questions' => [
                            'type' => 'ARRAY',
                            'items' => [
                                'type' => 'OBJECT',
                                'properties' => [
                                    'question_text' => ['type' => 'STRING'],
                                    'options' => [
                                        'type' => 'ARRAY',
                                        'items' => ['type' => 'STRING']
                                    ],
                                    'correct_index' => ['type' => 'INTEGER'],
                                    'explanation' => ['type' => 'STRING']
                                ],
                                'required' => ['question_text', 'options', 'correct_index']
                            ]
                        ]
                    ],
                    'required' => ['title', 'description', 'category', 'questions']
                ]
            ]
        ];

        $url = 'https://generativelanguage.googleapis.com/v1beta/models/' . rawurlencode($model) . ':generateContent?key=' . rawurlencode($apiKey);
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            CURLOPT_TIMEOUT => 45
        ]);

        $raw = curl_exec($ch);
        $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($raw === false || $curlError !== '') {
            throw new RuntimeException('Falha ao comunicar com a Gemini API.');
        }

        $decoded = json_decode($raw, true);
        if ($httpCode >= 400) {
            $message = $decoded['error']['message'] ?? 'A Gemini API devolveu um erro.';
            throw new RuntimeException($message);
        }

        $text = $decoded['candidates'][0]['content']['parts'][0]['text'] ?? '';
        if (!is_string($text) || trim($text) === '') {
            throw new RuntimeException('A Gemini API nao devolveu conteudo utilizavel.');
        }

        $quiz = json_decode($text, true);
        if (!is_array($quiz)) {
            throw new RuntimeException('A resposta da Gemini API nao veio em JSON valido.');
        }

        return self::normalizeQuiz($quiz, $input);
    }

    private static function normalizeQuiz(array $quiz, array $input): array
    {
        $fallbackTitle = trim((string)($input['title'] ?? 'Quiz gerado por IA'));
        $fallbackCategory = trim((string)($input['category'] ?? 'Geral'));
        $fallbackDescription = trim((string)($input['description'] ?? 'Quiz criado automaticamente com Gemini API'));

        $questions = [];
        foreach (($quiz['questions'] ?? []) as $question) {
            $questionText = trim((string)($question['question_text'] ?? ''));
            $options = array_values(array_filter(array_map(
                static fn ($option) => trim((string)$option),
                is_array($question['options'] ?? null) ? $question['options'] : []
            ), static fn ($option) => $option !== ''));
            $correctIndex = (int)($question['correct_index'] ?? -1);

            if ($questionText === '' || count($options) < 2 || $correctIndex < 0 || $correctIndex >= count($options)) {
                continue;
            }

            $questions[] = [
                'question_text' => $questionText,
                'options' => $options,
                'correct_index' => $correctIndex
            ];
        }

        if (count($questions) === 0) {
            throw new RuntimeException('A Gemini API nao gerou perguntas validas.');
        }

        return [
            'title' => trim((string)($quiz['title'] ?? '')) ?: $fallbackTitle,
            'description' => trim((string)($quiz['description'] ?? '')) ?: $fallbackDescription,
            'category' => trim((string)($quiz['category'] ?? '')) ?: $fallbackCategory,
            'questions' => $questions
        ];
    }
}
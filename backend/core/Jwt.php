<?php
class Jwt
{
    public static function encode(array $payload): string
    {
        $config = require __DIR__ . '/../config/config.php';
        $header = self::base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload['iss'] = $config['jwt_issuer'];
        $payload['iat'] = time();
        $payload['exp'] = time() + 60 * 60 * 24;
        $body = self::base64UrlEncode(json_encode($payload));
        $signature = hash_hmac('sha256', $header . '.' . $body, $config['jwt_secret'], true);
        return $header . '.' . $body . '.' . self::base64UrlEncode($signature);
    }

    public static function decode(string $token): ?array
    {
        $config = require __DIR__ . '/../config/config.php';
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$header, $payload, $signature] = $parts;
        $validSignature = self::base64UrlEncode(hash_hmac('sha256', $header . '.' . $payload, $config['jwt_secret'], true));
        if (!hash_equals($validSignature, $signature)) {
            return null;
        }

        $decoded = json_decode(self::base64UrlDecode($payload), true);
        if (!is_array($decoded) || ($decoded['exp'] ?? 0) < time()) {
            return null;
        }

        return $decoded;
    }

    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}

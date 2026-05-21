<?php
class Request
{
    public static function body(): array
    {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    public static function bearerToken(): ?string
    {
        $headers = getallheaders();
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? null;
        if (!$auth || stripos($auth, 'Bearer ') !== 0) {
            return null;
        }
        return substr($auth, 7);
    }
}

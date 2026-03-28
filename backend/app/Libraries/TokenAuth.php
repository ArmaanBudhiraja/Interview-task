<?php

namespace App\Libraries;

use App\Models\AuthUserModel;

class TokenAuth
{
    public function __construct(private readonly AuthUserModel $users = new AuthUserModel())
    {
    }

    public function issueToken(int $userId): string
    {
        $plainToken = 'faculty_' . bin2hex(random_bytes(32));

        $this->users->update($userId, [
            'api_token_hash' => hash('sha256', $plainToken),
            'api_token_expires_at' => gmdate('Y-m-d H:i:s', time() + (60 * 60 * 24 * 7)),
        ]);

        return $plainToken;
    }

    public function revokeToken(int $userId): void
    {
        $this->users->update($userId, [
            'api_token_hash' => null,
            'api_token_expires_at' => null,
        ]);
    }

    public function authenticate(string $authorizationHeader): ?array
    {
        $token = $this->extractBearerToken($authorizationHeader);

        if ($token === null) {
            return null;
        }

        $user = $this->users
            ->where('api_token_hash', hash('sha256', $token))
            ->first();

        if ($user === null || empty($user['api_token_expires_at'])) {
            return null;
        }

        if (strtotime($user['api_token_expires_at']) < time()) {
            return null;
        }

        return $user;
    }

    private function extractBearerToken(string $authorizationHeader): ?string
    {
        if ($authorizationHeader === '') {
            return null;
        }

        if (! preg_match('/Bearer\s+(\S+)/i', $authorizationHeader, $matches)) {
            return null;
        }

        return $matches[1] ?? null;
    }
}

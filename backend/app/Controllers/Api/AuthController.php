<?php

namespace App\Controllers\Api;

use App\Models\AuthUserModel;

class AuthController extends BaseApiController
{
    private AuthUserModel $users;

    public function __construct()
    {
        $this->users = new AuthUserModel();
    }

    public function register()
    {
        $payload = $this->getPayload();

        $rules = [
            'email' => 'required|valid_email|is_unique[auth_user.email]|max_length[150]',
            'first_name' => 'required|min_length[2]|max_length[80]',
            'last_name' => 'required|min_length[2]|max_length[80]',
            'password' => 'required|min_length[8]|max_length[72]',
            'phone_number' => 'required|min_length[8]|max_length[20]',
        ];

        if (! $this->validateData($payload, $rules)) {
            return $this->validationErrorResponse();
        }

        $userId = $this->users->insert([
            'email' => strtolower(trim($payload['email'])),
            'first_name' => trim($payload['first_name']),
            'last_name' => trim($payload['last_name']),
            'password' => password_hash($payload['password'], PASSWORD_DEFAULT),
            'phone_number' => trim($payload['phone_number']),
        ], true);

        if ($userId === false) {
            return $this->respond([
                'message' => 'Unable to create the user record.',
                'errors' => $this->users->errors(),
            ], 422);
        }

        $token = $this->tokenAuth->issueToken((int) $userId);
        $user = $this->users->find($userId);

        return $this->respondCreated([
            'message' => 'Registration successful.',
            'token' => $token,
            'token_type' => 'Bearer',
            'expires_at' => $user['api_token_expires_at'],
            'user' => $this->sanitizeUser($user),
        ]);
    }

    public function login()
    {
        $payload = $this->getPayload();

        $rules = [
            'email' => 'required|valid_email|max_length[150]',
            'password' => 'required|min_length[8]|max_length[72]',
        ];

        if (! $this->validateData($payload, $rules)) {
            return $this->validationErrorResponse();
        }

        $user = $this->users
            ->where('email', strtolower(trim($payload['email'])))
            ->first();

        if ($user === null || ! password_verify($payload['password'], $user['password'])) {
            return $this->respond([
                'message' => 'Invalid email or password.',
            ], 401);
        }

        $token = $this->tokenAuth->issueToken((int) $user['id']);
        $freshUser = $this->users->find($user['id']);

        return $this->respond([
            'message' => 'Login successful.',
            'token' => $token,
            'token_type' => 'Bearer',
            'expires_at' => $freshUser['api_token_expires_at'],
            'user' => $this->sanitizeUser($freshUser),
        ]);
    }

    public function me()
    {
        $user = $this->currentUser();

        return $this->respond([
            'message' => 'Authenticated user fetched successfully.',
            'user' => $user,
        ]);
    }

    public function logout()
    {
        $user = $this->tokenAuth->authenticate($this->request->getHeaderLine('Authorization'));

        if ($user !== null) {
            $this->tokenAuth->revokeToken((int) $user['id']);
        }

        return $this->respond([
            'message' => 'Logged out successfully.',
        ]);
    }
}

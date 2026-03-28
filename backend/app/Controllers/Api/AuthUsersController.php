<?php

namespace App\Controllers\Api;

use App\Models\AuthUserModel;

class AuthUsersController extends BaseApiController
{
    private AuthUserModel $users;

    public function __construct()
    {
        $this->users = new AuthUserModel();
    }

    public function index()
    {
        $users = $this->users
            ->select('id, email, first_name, last_name, phone_number, created_at, updated_at')
            ->orderBy('id', 'DESC')
            ->findAll();

        return $this->respond([
            'message' => 'Auth users fetched successfully.',
            'data' => $users,
        ]);
    }
}

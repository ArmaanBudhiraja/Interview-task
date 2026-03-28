<?php

namespace App\Models;

use CodeIgniter\Model;

class AuthUserModel extends Model
{
    protected $table = 'auth_user';
    protected $primaryKey = 'id';
    protected $returnType = 'array';
    protected $protectFields = true;
    protected $allowedFields = [
        'email',
        'first_name',
        'last_name',
        'password',
        'phone_number',
        'api_token_hash',
        'api_token_expires_at',
    ];
    protected $useTimestamps = true;
    protected $dateFormat = 'datetime';
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
}

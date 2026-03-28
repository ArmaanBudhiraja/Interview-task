<?php

namespace App\Models;

use CodeIgniter\Model;

class TeacherModel extends Model
{
    protected $table = 'teachers';
    protected $primaryKey = 'id';
    protected $returnType = 'array';
    protected $protectFields = true;
    protected $allowedFields = [
        'user_id',
        'university_name',
        'gender',
        'year_joined',
        'department',
        'employee_code',
        'qualification',
    ];
    protected $useTimestamps = true;
    protected $dateFormat = 'datetime';
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
}

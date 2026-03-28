<?php

namespace App\Controllers\Api;

use App\Models\AuthUserModel;
use App\Models\TeacherModel;
use Config\Database;
use Throwable;

class TeachersController extends BaseApiController
{
    private AuthUserModel $users;
    private TeacherModel $teachers;

    public function __construct()
    {
        $this->users = new AuthUserModel();
        $this->teachers = new TeacherModel();
    }

    public function index()
    {
        $teachers = $this->teachers
            ->select([
                'teachers.id',
                'teachers.user_id',
                'teachers.university_name',
                'teachers.gender',
                'teachers.year_joined',
                'teachers.department',
                'teachers.employee_code',
                'teachers.qualification',
                'teachers.created_at',
                'teachers.updated_at',
                'auth_user.email',
                'auth_user.first_name',
                'auth_user.last_name',
                'auth_user.phone_number',
            ])
            ->join('auth_user', 'auth_user.id = teachers.user_id')
            ->orderBy('teachers.id', 'DESC')
            ->findAll();

        return $this->respond([
            'message' => 'Teachers fetched successfully.',
            'data' => $teachers,
        ]);
    }

    public function store()
    {
        $payload = $this->getPayload();

        $rules = [
            'email' => 'required|valid_email|is_unique[auth_user.email]|max_length[150]',
            'first_name' => 'required|min_length[2]|max_length[80]',
            'last_name' => 'required|min_length[2]|max_length[80]',
            'password' => 'required|min_length[8]|max_length[72]',
            'phone_number' => 'required|min_length[8]|max_length[20]',
            'university_name' => 'required|min_length[3]|max_length[150]',
            'gender' => 'required|in_list[male,female,non-binary,prefer-not-to-say]',
            'year_joined' => 'required|integer|greater_than_equal_to[1950]|less_than_equal_to[2100]',
            'department' => 'required|min_length[2]|max_length[100]',
            'employee_code' => 'required|alpha_numeric_punct|is_unique[teachers.employee_code]|max_length[50]',
            'qualification' => 'required|min_length[2]|max_length[100]',
        ];

        if (! $this->validateData($payload, $rules)) {
            return $this->validationErrorResponse();
        }

        $db = Database::connect();
        $db->transBegin();

        try {
            $userId = $this->users->insert([
                'email' => strtolower(trim($payload['email'])),
                'first_name' => trim($payload['first_name']),
                'last_name' => trim($payload['last_name']),
                'password' => password_hash($payload['password'], PASSWORD_DEFAULT),
                'phone_number' => trim($payload['phone_number']),
            ], true);

            if ($userId === false) {
                $db->transRollback();

                return $this->respond([
                    'message' => 'Unable to create the auth user record.',
                    'errors' => $this->users->errors(),
                ], 422);
            }

            $teacherId = $this->teachers->insert([
                'user_id' => (int) $userId,
                'university_name' => trim($payload['university_name']),
                'gender' => $payload['gender'],
                'year_joined' => (int) $payload['year_joined'],
                'department' => trim($payload['department']),
                'employee_code' => trim($payload['employee_code']),
                'qualification' => trim($payload['qualification']),
            ], true);

            if ($teacherId === false) {
                $db->transRollback();

                return $this->respond([
                    'message' => 'Unable to create the teacher record.',
                    'errors' => $this->teachers->errors(),
                ], 422);
            }

            $db->transCommit();

            return $this->respondCreated([
                'message' => 'Teacher account created successfully.',
                'data' => [
                    'auth_user' => $this->sanitizeUser($this->users->find($userId)),
                    'teacher' => $this->teachers->find($teacherId),
                ],
            ]);
        } catch (Throwable $exception) {
            if ($db->transStatus()) {
                $db->transRollback();
            }

            return $this->respond([
                'message' => 'A server error occurred while creating the linked records.',
                'error' => $exception->getMessage(),
            ], 500);
        }
    }
}

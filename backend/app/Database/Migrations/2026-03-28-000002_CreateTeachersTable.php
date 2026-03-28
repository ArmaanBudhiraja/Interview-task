<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateTeachersTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type' => 'BIGINT',
                'constraint' => 20,
                'unsigned' => true,
                'auto_increment' => true,
            ],
            'user_id' => [
                'type' => 'BIGINT',
                'constraint' => 20,
                'unsigned' => true,
            ],
            'university_name' => [
                'type' => 'VARCHAR',
                'constraint' => 150,
            ],
            'gender' => [
                'type' => 'VARCHAR',
                'constraint' => 30,
            ],
            'year_joined' => [
                'type' => 'SMALLINT',
                'constraint' => 4,
                'unsigned' => true,
            ],
            'department' => [
                'type' => 'VARCHAR',
                'constraint' => 100,
            ],
            'employee_code' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
            ],
            'qualification' => [
                'type' => 'VARCHAR',
                'constraint' => 100,
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => false,
            ],
            'updated_at' => [
                'type' => 'DATETIME',
                'null' => false,
            ],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('user_id');
        $this->forge->addUniqueKey('employee_code');
        $this->forge->addForeignKey('user_id', 'auth_user', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('teachers', true);
    }

    public function down()
    {
        $this->forge->dropTable('teachers', true);
    }
}

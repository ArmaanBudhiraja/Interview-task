<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateAuthUserTable extends Migration
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
            'email' => [
                'type' => 'VARCHAR',
                'constraint' => 150,
            ],
            'first_name' => [
                'type' => 'VARCHAR',
                'constraint' => 80,
            ],
            'last_name' => [
                'type' => 'VARCHAR',
                'constraint' => 80,
            ],
            'password' => [
                'type' => 'VARCHAR',
                'constraint' => 255,
            ],
            'phone_number' => [
                'type' => 'VARCHAR',
                'constraint' => 20,
            ],
            'api_token_hash' => [
                'type' => 'VARCHAR',
                'constraint' => 255,
                'null' => true,
            ],
            'api_token_expires_at' => [
                'type' => 'DATETIME',
                'null' => true,
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
        $this->forge->addUniqueKey('email');
        $this->forge->addKey('api_token_hash');
        $this->forge->createTable('auth_user', true);
    }

    public function down()
    {
        $this->forge->dropTable('auth_user', true);
    }
}

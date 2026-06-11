<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin account (idempotent — safe to run on every deploy/boot).
        User::firstOrCreate(
            ['email' => 'admin@guardykids.ma'],
            [
                'role'       => 'admin',
                'first_name' => 'Admin',
                'last_name'  => 'GuardyKids',
                'password'   => Hash::make('admin123'),
                'phone'      => '0600000000',
            ]
        );

        // Demo data: nursery owner, parents, children, nurseries, reservations.
        $this->call(DemoSeeder::class);
    }
}

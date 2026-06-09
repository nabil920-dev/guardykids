<?php

namespace Database\Seeders;

use App\Models\Nursery;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin account
        User::create([
            'role'       => 'admin',
            'first_name' => 'Admin',
            'last_name'  => 'GuardyKids',
            'email'      => 'admin@guardykids.ma',
            'password'   => Hash::make('admin123'),
            'phone'      => '0600000000',
        ]);

        // Sample nursery owner
        $owner = User::create([
            'role'       => 'nursery_owner',
            'first_name' => 'Fatima',
            'last_name'  => 'Bennani',
            'email'      => 'owner@guardykids.ma',
            'password'   => Hash::make('owner123'),
            'phone'      => '0612345678',
        ]);

        // Sample parent
        User::create([
            'role'       => 'parent',
            'first_name' => 'Karim',
            'last_name'  => 'Alami',
            'email'      => 'parent@guardykids.ma',
            'password'   => Hash::make('parent123'),
            'phone'      => '0698765432',
        ]);

        // Sample nurseries
        $nurseries = [
            [
                'name'         => 'Mini Monde Hay Hassani',
                'description'  => 'Une garderie chaleureuse et sécurisée pour les enfants de 6 mois à 6 ans. Personnels qualifiés et activités éducatives.',
                'address'      => '12 Rue des Fleurs, Hay Hassani',
                'city'         => 'Casablanca',
                'neighborhood' => 'Hay Hassani',
                'latitude'     => 33.5559,
                'longitude'    => -7.6830,
                'capacity'     => 30,
                'hourly_price' => 35.00,
                'opening_time' => '08:00',
                'closing_time' => '19:00',
            ],
            [
                'name'         => 'Happy Kids Maarif',
                'description'  => 'Garderie moderne avec espace de jeux, activités créatives et repas équilibrés. Proche du centre commercial Morocco Mall.',
                'address'      => '5 Boulevard de la Résistance, Maarif',
                'city'         => 'Casablanca',
                'neighborhood' => 'Maarif',
                'latitude'     => 33.5731,
                'longitude'    => -7.6298,
                'capacity'     => 25,
                'hourly_price' => 45.00,
                'opening_time' => '07:30',
                'closing_time' => '20:00',
            ],
            [
                'name'         => 'Les Petits Anges Ain Diab',
                'description'  => 'Garderie premium face à la mer. Environnement calme et sécurisé pour votre enfant pendant vos sorties.',
                'address'      => '30 Boulevard de la Corniche, Ain Diab',
                'city'         => 'Casablanca',
                'neighborhood' => 'Ain Diab',
                'latitude'     => 33.5939,
                'longitude'    => -7.6956,
                'capacity'     => 20,
                'hourly_price' => 55.00,
                'opening_time' => '09:00',
                'closing_time' => '18:00',
            ],
            [
                'name'         => 'Jardin d\'Enfants Sidi Bernoussi',
                'description'  => 'Garderie abordable et accessible. Personnel expérimenté, ambiance familiale.',
                'address'      => '8 Rue Ibn Batouta, Sidi Bernoussi',
                'city'         => 'Casablanca',
                'neighborhood' => 'Sidi Bernoussi',
                'latitude'     => 33.6036,
                'longitude'    => -7.5321,
                'capacity'     => 35,
                'hourly_price' => 25.00,
                'opening_time' => '08:00',
                'closing_time' => '18:30',
            ],
            [
                'name'         => 'Étoile d\'Or Anfa',
                'description'  => 'Garderie haut de gamme dans le quartier Anfa. Suivi pédagogique individualisé, activités Montessori.',
                'address'      => '15 Rue Moulay Youssef, Anfa',
                'city'         => 'Casablanca',
                'neighborhood' => 'Anfa',
                'latitude'     => 33.5965,
                'longitude'    => -7.6521,
                'capacity'     => 18,
                'hourly_price' => 65.00,
                'opening_time' => '08:30',
                'closing_time' => '19:30',
            ],
        ];

        foreach ($nurseries as $data) {
            Nursery::create(array_merge($data, ['owner_id' => $owner->id]));
        }
    }
}

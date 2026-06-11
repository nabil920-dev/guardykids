<?php

namespace Database\Seeders;

use App\Models\Child;
use App\Models\Nursery;
use App\Models\Reservation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class DemoSeeder extends Seeder
{
    /**
     * Inserts demo data: 5 Casablanca nurseries (same picture, different info),
     * 3 parents, 5 children and 5 reservations with different statuses.
     * Uses firstOrCreate everywhere so it is safe to run more than once.
     */
    public function run(): void
    {
        // 1) Shared picture for the 5 nurseries.
        //    Use the demo image bundled with the repo so it works on a fresh
        //    deploy; fall back to any already-uploaded image if present.
        $image = 'nurseries/demo.jpg';
        if (! Storage::disk('public')->exists($image)) {
            $bundled = database_path('seeders/assets/demo-nursery.jpg');
            if (file_exists($bundled)) {
                Storage::disk('public')->put($image, file_get_contents($bundled));
            } else {
                $existing = collect(Storage::disk('public')->files('nurseries'))
                    ->first(fn ($f) => $f !== $image);
                if ($existing) {
                    Storage::disk('public')->copy($existing, $image);
                }
            }
        }

        // 2) Owner that holds the nurseries (reuse the existing one if present).
        $owner = User::firstOrCreate(
            ['email' => 'owner@guardykids.ma'],
            [
                'role'       => 'nursery_owner',
                'first_name' => 'Fatima',
                'last_name'  => 'Bennani',
                'password'   => Hash::make('owner123'),
                'phone'      => '0612345678',
            ]
        );

        // 3) Five nurseries, all in Casablanca, same picture, different info.
        $nurseriesData = [
            ['Mini Monde Hay Hassani',   'Hay Hassani',     '12 Rue des Fleurs',            33.5559, -7.6830, 30, 35.00, '08:00', '19:00'],
            ['Happy Kids Maarif',        'Maarif',          '5 Bd de la Résistance',        33.5731, -7.6298, 25, 45.00, '07:30', '20:00'],
            ['Les Petits Anges Ain Diab','Ain Diab',        '30 Bd de la Corniche',         33.5939, -7.6956, 20, 55.00, '09:00', '18:00'],
            ['Jardin Sidi Bernoussi',    'Sidi Bernoussi',  '8 Rue Ibn Batouta',            33.6036, -7.5321, 35, 25.00, '08:00', '18:30'],
            ['Étoile d\'Or Anfa',        'Anfa',            '15 Rue Moulay Youssef',        33.5965, -7.6521, 18, 65.00, '08:30', '19:30'],
        ];

        $nurseries = [];
        foreach ($nurseriesData as $d) {
            $nurseries[] = Nursery::firstOrCreate(
                ['name' => $d[0]],
                [
                    'owner_id'     => $owner->id,
                    'description'  => 'Garderie située à ' . $d[1] . ', Casablanca. Personnel qualifié et activités éducatives.',
                    'address'      => $d[2] . ', ' . $d[1],
                    'city'         => 'Casablanca',
                    'neighborhood' => $d[1],
                    'latitude'     => $d[3],
                    'longitude'    => $d[4],
                    'capacity'     => $d[5],
                    'hourly_price' => $d[6],
                    'opening_time' => $d[7],
                    'closing_time' => $d[8],
                    'image'        => $image,
                ]
            );
        }

        // 4) Three parents.
        $parentsData = [
            ['Karim',   'Alami',    'karim.alami@guardykids.ma',   '0698765401'],
            ['Sara',    'Idrissi',  'sara.idrissi@guardykids.ma',  '0698765402'],
            ['Youssef', 'Tazi',     'youssef.tazi@guardykids.ma',  '0698765403'],
        ];

        $parents = [];
        foreach ($parentsData as $p) {
            $parents[] = User::firstOrCreate(
                ['email' => $p[2]],
                [
                    'role'       => 'parent',
                    'first_name' => $p[0],
                    'last_name'  => $p[1],
                    'password'   => Hash::make('parent123'),
                    'phone'      => $p[3],
                ]
            );
        }

        // 5) Five children spread across the three parents.
        $childrenData = [
            ['Yasmine', 3, 0],
            ['Adam',    4, 0],
            ['Lina',    2, 1],
            ['Rayan',   5, 1],
            ['Nour',    3, 2],
        ];

        $children = [];
        foreach ($childrenData as $c) {
            $children[] = Child::firstOrCreate(
                ['name' => $c[0], 'parent_id' => $parents[$c[2]]->id],
                ['age' => $c[1]]
            );
        }

        // 6) Five reservations with different statuses.
        //    Price is computed exactly like the controller: always positive.
        $reservations = [
            // [status,      child index, nursery index, date,       start,   end]
            ['pending',   0, 0, '+2 days', '09:00', '12:00'],
            ['confirmed', 1, 1, '+3 days', '08:30', '17:30'],
            ['rejected',  2, 2, '+4 days', '10:00', '13:00'],
            ['cancelled', 3, 3, '+5 days', '08:00', '11:30'],
            ['confirmed', 4, 4, '+6 days', '09:00', '16:00'],
        ];

        foreach ($reservations as $i => $r) {
            [$status, $childIdx, $nurseryIdx, $date, $start, $end] = $r;

            $child   = $children[$childIdx];
            $nursery = $nurseries[$nurseryIdx];

            $duration = round(
                Carbon::createFromFormat('H:i', $start)
                    ->diffInMinutes(Carbon::createFromFormat('H:i', $end), true) / 60,
                2
            );
            $price = round($duration * $nursery->hourly_price, 2);

            Reservation::firstOrCreate(
                ['payment_reference' => 'GK-DEMO-' . ($i + 1)],
                [
                    'parent_id'        => $child->parent_id,
                    'nursery_id'       => $nursery->id,
                    'child_id'         => $child->id,
                    'reservation_date' => Carbon::parse($date)->toDateString(),
                    'start_time'       => $start,
                    'end_time'         => $end,
                    'duration_hours'   => $duration,
                    'total_price'      => $price,
                    'status'           => $status,
                    'payment_status'   => 'paid',
                ]
            );
        }
    }
}

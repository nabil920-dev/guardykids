<?php

namespace Tests\Feature;

use App\Models\Child;
use App\Models\Nursery;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReservationPriceTest extends TestCase
{
    use RefreshDatabase;

    private function setUpParentAndNursery(): array
    {
        $owner = User::create([
            'role' => 'nursery_owner', 'first_name' => 'O', 'last_name' => 'W',
            'email' => 'o' . uniqid() . '@t.com', 'password' => 'x', 'phone' => '06',
        ]);
        $nursery = $owner->nurseries()->create([
            'name' => 'N', 'address' => 'a', 'city' => 'Casa', 'neighborhood' => 'Maarif',
            'capacity' => 10, 'hourly_price' => 30, 'opening_time' => '08:00', 'closing_time' => '20:00',
        ]);
        $parent = User::create([
            'role' => 'parent', 'first_name' => 'P', 'last_name' => 'A',
            'email' => 'p' . uniqid() . '@t.com', 'password' => 'x', 'phone' => '06',
        ]);
        $child = $parent->children()->create(['name' => 'Kid', 'age' => 3]);

        return [$parent, $nursery, $child];
    }

    /** 10:00 -> 12:00 at 30 MAD/h must give duration 2.0 and total 60 (positive). */
    public function test_price_and_duration_are_positive(): void
    {
        [$parent, $nursery, $child] = $this->setUpParentAndNursery();
        Sanctum::actingAs($parent);

        $res = $this->postJson('/api/reservations', [
            'nursery_id'       => $nursery->id,
            'child_id'         => $child->id,
            'reservation_date' => now()->addDay()->toDateString(),
            'start_time'       => '10:00',
            'end_time'         => '12:00',
        ]);

        $res->assertCreated();
        $this->assertSame(2.0, (float) $res->json('duration_hours'));
        $this->assertSame(60.0, (float) $res->json('total_price'));
        $this->assertGreaterThan(0, $res->json('total_price'));
    }

    /** end_time <= start_time must be rejected by validation (no negative duration). */
    public function test_end_before_start_is_rejected(): void
    {
        [$parent, $nursery, $child] = $this->setUpParentAndNursery();
        Sanctum::actingAs($parent);

        $res = $this->postJson('/api/reservations', [
            'nursery_id'       => $nursery->id,
            'child_id'         => $child->id,
            'reservation_date' => now()->addDay()->toDateString(),
            'start_time'       => '12:00',
            'end_time'         => '10:00',
        ]);

        $res->assertStatus(422);
        $res->assertJsonValidationErrors('end_time');
    }
}

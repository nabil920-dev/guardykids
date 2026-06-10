<?php

namespace Tests\Feature;

use App\Models\Nursery;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NurseryUpdateTest extends TestCase
{
    use RefreshDatabase;

    private function owner(): User
    {
        return User::create([
            'role'       => 'nursery_owner',
            'first_name' => 'Owner',
            'last_name'  => 'Test',
            'email'      => 'owner' . uniqid() . '@test.com',
            'password'   => 'secret123',
            'phone'      => '0600000000',
        ]);
    }

    private function makeNursery(User $owner, ?string $image = null): Nursery
    {
        return $owner->nurseries()->create([
            'name'         => 'Old Name',
            'description'  => 'Old desc',
            'address'      => 'Old address',
            'city'         => 'Casablanca',
            'neighborhood' => 'Maarif',
            'latitude'     => 33.5,
            'longitude'    => -7.6,
            'capacity'     => 10,
            'hourly_price' => 20,
            'opening_time' => '08:00',
            'closing_time' => '18:00',
            'image'        => $image,
        ]);
    }

    /**
     * Every editable field must update. Times are sent as "HH:MM:SS" exactly like
     * the React form does after loading them from MySQL (TIME columns return seconds).
     */
    public function test_update_saves_all_fields(): void
    {
        $owner = $this->owner();
        Sanctum::actingAs($owner);
        $nursery = $this->makeNursery($owner);

        $res = $this->putJson("/api/nurseries/{$nursery->id}", [
            'name'         => 'New Name',
            'description'  => 'New desc',
            'address'      => 'New address',
            'city'         => 'Rabat',
            'neighborhood' => 'Agdal',
            'latitude'     => 34.01,
            'longitude'    => -6.83,
            'capacity'     => 40,
            'hourly_price' => 55.5,
            'opening_time' => '07:30:00',   // value as returned by the DB
            'closing_time' => '19:30:00',
        ]);

        $res->assertOk();
        $nursery->refresh();

        $this->assertSame('New Name', $nursery->name);
        $this->assertSame('New desc', $nursery->description);
        $this->assertSame('New address', $nursery->address);
        $this->assertSame('Rabat', $nursery->city);
        $this->assertSame('Agdal', $nursery->neighborhood);
        $this->assertEquals(34.01, $nursery->latitude);
        $this->assertEquals(-6.83, $nursery->longitude);
        $this->assertSame(40, $nursery->capacity);
        $this->assertEquals(55.5, $nursery->hourly_price);
        $this->assertStringStartsWith('07:30', $nursery->opening_time);
        $this->assertStringStartsWith('19:30', $nursery->closing_time);
    }

    /** Replacing the image: new one stored, old one deleted, path updated. */
    public function test_update_replaces_image(): void
    {
        Storage::fake('public');
        $owner = $this->owner();
        Sanctum::actingAs($owner);

        $old = UploadedFile::fake()->create('old.jpg', 50, 'image/jpeg')->store('nurseries', 'public');
        $nursery = $this->makeNursery($owner, $old);

        $res = $this->putJson("/api/nurseries/{$nursery->id}", [
            'image' => UploadedFile::fake()->create('new.jpg', 50, 'image/jpeg'),
        ]);

        $res->assertOk();
        $nursery->refresh();

        $this->assertNotSame($old, $nursery->image);
        Storage::disk('public')->assertExists($nursery->image);
        Storage::disk('public')->assertMissing($old);
    }
}

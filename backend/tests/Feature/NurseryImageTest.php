<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NurseryImageTest extends TestCase
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

    private function payload(UploadedFile $image): array
    {
        return [
            'name'         => 'Happy Kids Maarif',
            'description'  => 'Test nursery',
            'address'      => '5 Bd Test',
            'city'         => 'Casablanca',
            'neighborhood' => 'Maarif',
            'capacity'     => 25,
            'hourly_price' => 45,
            'opening_time' => '08:00',
            'closing_time' => '18:00',
            'image'        => $image,
        ];
    }

    /** Upload on create: stored on the public disk + API returns a dynamic image_url. */
    public function test_create_stores_image_and_returns_dynamic_url(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->owner());

        $res = $this->postJson('/api/nurseries', $this->payload(
            UploadedFile::fake()->create('photo.jpg', 100, 'image/jpeg')
        ));

        $res->assertCreated();
        $path = $res->json('image');

        $this->assertStringStartsWith('nurseries/', $path);
        // image_url is derived dynamically from the public disk (APP_URL + /storage/<path>).
        $this->assertSame(Storage::disk('public')->url($path), $res->json('image_url'));
        $this->assertStringEndsWith('/storage/' . $path, $res->json('image_url'));
        Storage::disk('public')->assertExists($path);
    }

    /** Each nursery keeps its own distinct image — nothing shared/static. */
    public function test_each_nursery_gets_a_different_image(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->owner());

        $a = $this->postJson('/api/nurseries', $this->payload(
            UploadedFile::fake()->create('a.jpg', 100, 'image/jpeg')
        ));
        $b = $this->postJson('/api/nurseries', $this->payload(
            UploadedFile::fake()->create('b.jpg', 100, 'image/jpeg')
        ));

        $this->assertNotSame($a->json('image'), $b->json('image'));
        $this->assertNotSame($a->json('image_url'), $b->json('image_url'));
    }

    /** Updating replaces the file: new one stored, old one deleted, url changes. */
    public function test_update_replaces_the_image(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->owner());

        $created = $this->postJson('/api/nurseries', $this->payload(
            UploadedFile::fake()->create('old.jpg', 100, 'image/jpeg')
        ));
        $id  = $created->json('id');
        $old = $created->json('image');

        $updated = $this->putJson("/api/nurseries/{$id}", [
            'image' => UploadedFile::fake()->create('new.jpg', 100, 'image/jpeg'),
        ]);

        $updated->assertOk();
        $new = $updated->json('image');

        $this->assertNotSame($old, $new);
        Storage::disk('public')->assertExists($new);
        Storage::disk('public')->assertMissing($old);   // old image is removed
        $this->assertNotSame($created->json('image_url'), $updated->json('image_url'));
    }

    /** A nursery with no image exposes image_url = null (fallback handled in React). */
    public function test_nursery_without_image_has_null_url(): void
    {
        Storage::fake('public');
        $owner = $this->owner();
        $nursery = $owner->nurseries()->create([
            'name'         => 'No Image',
            'address'      => 'x',
            'city'         => 'Casablanca',
            'neighborhood' => 'Maarif',
            'capacity'     => 10,
            'hourly_price' => 20,
            'opening_time' => '08:00',
            'closing_time' => '18:00',
        ]);

        $res = $this->getJson("/api/nurseries/{$nursery->id}");

        $res->assertOk();
        $this->assertNull($res->json('image'));
        $this->assertNull($res->json('image_url'));
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Nursery extends Model
{
    use HasFactory;

    /**
     * Always expose a ready-to-use, absolute image URL in JSON responses.
     */
    protected $appends = ['image_url'];

    protected $fillable = [
        'owner_id',
        'name',
        'description',
        'address',
        'city',
        'neighborhood',
        'latitude',
        'longitude',
        'capacity',
        'hourly_price',
        'opening_time',
        'closing_time',
        'image',
    ];

    protected $casts = [
        'latitude'     => 'float',
        'longitude'    => 'float',
        'hourly_price' => 'float',
        'capacity'     => 'integer',
    ];

    /**
     * Full public URL for the stored image (null when no image was uploaded).
     * Relies on `php artisan storage:link` and the "public" disk URL.
     */
    public function getImageUrlAttribute(): ?string
    {
        return $this->image
            ? Storage::disk('public')->url($this->image)
            : null;
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}

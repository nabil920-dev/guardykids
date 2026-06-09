<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Nursery extends Model
{
    use HasFactory;

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

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}

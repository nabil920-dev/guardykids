<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'nursery_id',
        'child_id',
        'reservation_date',
        'start_time',
        'end_time',
        'duration_hours',
        'total_price',
        'status',
        'payment_status',
        'payment_reference',
    ];

    protected $casts = [
        'reservation_date' => 'date',
        'duration_hours'   => 'float',
        'total_price'      => 'float',
    ];

    public function parent()
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function nursery()
    {
        return $this->belongsTo(Nursery::class);
    }

    public function child()
    {
        return $this->belongsTo(Child::class);
    }
}

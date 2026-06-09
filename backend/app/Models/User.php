<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'role',
        'first_name',
        'last_name',
        'email',
        'password',
        'phone',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function nurseries()
    {
        return $this->hasMany(Nursery::class, 'owner_id');
    }

    public function children()
    {
        return $this->hasMany(Child::class, 'parent_id');
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class, 'parent_id');
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isParent(): bool
    {
        return $this->role === 'parent';
    }

    public function isNurseryOwner(): bool
    {
        return $this->role === 'nursery_owner';
    }
}

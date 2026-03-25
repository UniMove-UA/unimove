<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ride extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'origin',
        'destination',
        'departure_time',
        'available_seats',
        'price',
    ];

    protected $casts = [
        'departure_time' => 'datetime',
        'price' => 'decimal:2',
    ];

    public function conductor()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function reservas()
    {
        return $this->hasMany(Booking::class);
    }
}

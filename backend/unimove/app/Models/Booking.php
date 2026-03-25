<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'ride_id',
        'passenger_id',
        'status',
    ];

    public function viaje()
    {
        return $this->belongsTo(Ride::class);
    }

    public function pasajero()
    {
        return $this->belongsTo(User::class, 'passenger_id');
    }
}

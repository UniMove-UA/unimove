<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Travel extends Model
{
    protected $fillable = [
        'driver_id', 'vehicle_id', 'origin', 'destination',
        'departure_time', 'available_seats', 'price', 'status'
    ];

    public function driver() {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function vehicle() {
        return $this->belongsTo(Vehicle::class);
    }

}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = ['travel_id', 'passenger_id', 'status'];

    public function travel() {
        return $this->belongsTo(Travel::class);
    }

    public function passenger() {
        return $this->belongsTo(User::class, 'passenger_id');
    }
}

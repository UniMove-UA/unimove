<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = ['trip_id', 'passenger_id', 'status'];

    public function trip() {
        return $this->belongsTo(Trip::class);
    }

    public function passenger() {
        return $this->belongsTo(User::class, 'passenger_id');
    }
}
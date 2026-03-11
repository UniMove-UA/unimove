<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'phone', 'rating_avg'];

    public function vehicles() {
        return $this->hasMany(Vehicle::class);
    }

    public function tripsAsDriver() {
        return $this->hasMany(Trip::class, 'driver_id');
    }

    public function bookings() {
        return $this->hasMany(Booking::class, 'passenger_id');
    }

    public function reviewsReceived() {
        return $this->hasMany(Review::class, 'reviewee_id');
    }

    public function reviewsGiven() {
        return $this->hasMany(Review::class, 'reviewer_id');
    }
}


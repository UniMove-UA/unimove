<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'correo_institucional' ,'password', 'phone', 'rating_avg'];

    public function vehicles() {
        return $this->hasMany(Vehicle::class);
    }

    public function travelAsDriver() {
        return $this->hasMany(Travel::class, 'driver_id');
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

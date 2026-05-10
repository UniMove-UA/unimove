<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vmp extends Model
{
    protected $fillable = ['code', 'status', 'battery_level', 'price_per_minute', 'latitude', 'longitude'];

    public function rentals() {
        return $this->hasMany(VmpRental::class);
    }
}

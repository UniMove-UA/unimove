<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = ['user_id', 'brand', 'model', 'plate', 'total_seats'];

    public function owner() {
        return $this->belongsTo(User::class, 'user_id');
    }
}

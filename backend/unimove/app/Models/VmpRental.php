<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VmpRental extends Model
{
    protected $fillable = ['user_id', 'vmp_id', 'start_time', 'end_time', 'status', 'total_cost'];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function vmp() {
        return $this->belongsTo(Vmp::class);
    }
}

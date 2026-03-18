<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_id', 
        'reviewer_id', 
        'reviewee_id', 
        'rating', 
        'comment'
    ];

    // El viaje al que pertenece la reseña
    public function trip() {
        return $this->belongsTo(Trip::class);
    }

    public function author() {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function recipient() {
        return $this->belongsTo(User::class, 'reviewee_id');
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'travel_id',
        'reviewer_id',
        'reviewee_id',
        'rating',
        'comment'
    ];

    public function travel() {
        return $this->belongsTo(Travel::class);
    }

    public function author() {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function recipient() {
        return $this->belongsTo(User::class, 'reviewee_id');
    }
}

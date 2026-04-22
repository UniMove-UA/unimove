<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shape extends Model
{
    protected $connection = 'gtfs';
    protected $table = 'shapes';
    public $primaryKey = null;
    public $incrementing = false;
    public $timestamps = false;
    protected $guarded = [];
}

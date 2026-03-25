<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stop extends Model
{
    protected $connection = 'gtfs';
    protected $table = 'stops';
    protected $primaryKey = 'stop_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;
    protected $guarded = [];

    public function tiemposParada()
    {
        return $this->hasMany(StopTime::class, 'stop_id', 'stop_id');
    }
}

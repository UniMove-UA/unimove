<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StopTime extends Model
{
    protected $connection = 'gtfs';
    protected $table = 'stop_times';
    public $incrementing = false;
    public $timestamps = false;
    public $primaryKey = null;
    protected $guarded = [];

    public function trayecto()
    {
        return $this->belongsTo(Trip::class, 'trip_id', 'trip_id');
    }

    public function parada()
    {
        return $this->belongsTo(Stop::class, 'stop_id', 'stop_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Trip extends Model
{
    protected $connection = 'gtfs';
    protected $table = 'trips';
    protected $primaryKey = 'trip_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;
    protected $guarded = [];

    public function ruta()
    {
        return $this->belongsTo(Route::class, 'route_id', 'route_id');
    }

    public function tiemposParada()
    {
        return $this->hasMany(StopTime::class, 'trip_id', 'trip_id')->orderBy('stop_sequence');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Route extends Model
{
    protected $connection = 'gtfs';
    protected $table = 'routes';
    protected $primaryKey = 'route_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;
    protected $guarded = [];

    public function agencia()
    {
        return $this->belongsTo(Agency::class, 'agency_id', 'agency_id');
    }

    public function trayectos()
    {
        return $this->hasMany(Trip::class, 'route_id', 'route_id');
    }
}

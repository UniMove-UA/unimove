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

    public function calendario()
    {
        return $this->belongsTo(Calendar::class, 'service_id', 'service_id');
    }

    public function forma()
    {
        return $this->belongsTo(Shape::class, 'shape_id', 'shape_id');
    }
}

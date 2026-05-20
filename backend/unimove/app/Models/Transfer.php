<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Transfer extends Model
{
    protected $connection = 'gtfs';
    protected $table = 'transfers';
    public $primaryKey = null;
    public $incrementing = false;
    public $timestamps = false;
    protected $guarded = [];

    public function paradaOrigen()
    {
        return $this->belongsTo(Stop::class, 'from_stop_id', 'stop_id');
    }

    public function paradaDestino()
    {
        return $this->belongsTo(Stop::class, 'to_stop_id', 'stop_id');
    }

    public function rutaOrigen()
    {
        return $this->belongsTo(Route::class, 'from_route_id', 'route_id');
    }

    public function rutaDestino()
    {
        return $this->belongsTo(Route::class, 'to_route_id', 'route_id');
    }

    public function trayectoOrigen()
    {
        return $this->belongsTo(Trip::class, 'from_trip_id', 'trip_id');
    }

    public function trayectoDestino()
    {
        return $this->belongsTo(Trip::class, 'to_trip_id', 'trip_id');
    }
}

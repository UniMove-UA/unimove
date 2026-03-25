<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agency extends Model
{
    protected $connection = 'gtfs';
    protected $table = 'agency';
    protected $primaryKey = 'agency_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;
    protected $guarded = [];

    public function rutas()
    {
        return $this->hasMany(Route::class, 'agency_id', 'agency_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CalendarDate extends Model
{
    protected $connection = 'gtfs';
    protected $table = 'calendar_dates';
    public $primaryKey = null;
    public $incrementing = false;
    public $timestamps = false;
    protected $guarded = [];

    public function calendario()
    {
        return $this->belongsTo(Calendar::class, 'service_id', 'service_id');
    }
}

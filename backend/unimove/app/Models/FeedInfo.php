<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeedInfo extends Model
{
    protected $connection = 'gtfs';
    protected $table = 'feed_info';
    public $primaryKey = null;
    public $incrementing = false;
    public $timestamps = false;
    protected $guarded = [];
}

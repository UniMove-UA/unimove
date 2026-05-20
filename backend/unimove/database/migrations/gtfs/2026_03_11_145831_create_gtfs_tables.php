<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('gtfs')->create('agency', function (Blueprint $table) {
            $table->string('agency_id', 50)->primary();
            $table->string('agency_name');
            $table->string('agency_url');
            $table->string('agency_timezone', 50);
            $table->string('agency_lang', 10)->nullable();
            $table->string('agency_phone', 50)->nullable();
            $table->string('agency_fare_url')->nullable();
            $table->string('agency_email')->nullable();
        });

        Schema::connection('gtfs')->create('feed_info', function (Blueprint $table) {
            $table->string('feed_publisher_name');
            $table->string('feed_publisher_url');
            $table->string('feed_lang');
            $table->string('feed_start_date', 8)->nullable();
            $table->string('feed_end_date', 8)->nullable();
            $table->string('feed_version')->nullable();
        });

        Schema::connection('gtfs')->create('calendar', function (Blueprint $table) {
            $table->string('service_id', 50)->primary();
            $table->tinyInteger('monday');
            $table->tinyInteger('tuesday');
            $table->tinyInteger('wednesday');
            $table->tinyInteger('thursday');
            $table->tinyInteger('friday');
            $table->tinyInteger('saturday');
            $table->tinyInteger('sunday');
            $table->string('start_date', 12);
            $table->string('end_date', 12);
        });

        Schema::connection('gtfs')->create('calendar_dates', function (Blueprint $table) {
            $table->string('service_id', 50);
            $table->string('date', 12);
            $table->integer('exception_type');
            $table->index('service_id');
        });

        Schema::connection('gtfs')->create('routes', function (Blueprint $table) {
            $table->string('route_id', 50)->primary();
            $table->string('agency_id', 50)->nullable();
            $table->string('route_short_name', 100)->nullable();
            $table->string('route_long_name', 255)->nullable();
            $table->integer('route_type');
            $table->string('route_url')->nullable();
            $table->string('route_color', 10)->nullable();
            $table->string('route_text_color', 10)->nullable();
            $table->index('agency_id');
        });

        Schema::connection('gtfs')->create('shapes', function (Blueprint $table) {
            $table->string('shape_id', 50);
            $table->double('shape_pt_lat', 10, 6);
            $table->double('shape_pt_lon', 10, 6);
            $table->integer('shape_pt_sequence');
            $table->double('shape_dist_traveled')->nullable();
            $table->index('shape_id');
        });

        Schema::connection('gtfs')->create('stops', function (Blueprint $table) {
            $table->string('stop_id', 50)->primary();
            $table->string('stop_code', 50)->nullable();
            $table->string('stop_name', 255);
            $table->double('stop_lat', 10, 6);
            $table->double('stop_lon', 10, 6);
            $table->string('zone_id', 50)->nullable();
            $table->integer('wheelchair_boarding')->nullable();
        });

        Schema::connection('gtfs')->create('trips', function (Blueprint $table) {
            $table->string('trip_id', 50)->primary();
            $table->string('route_id', 50);
            $table->string('service_id', 50);
            $table->string('trip_headsign')->nullable();
            $table->string('shape_id', 50)->nullable();
            $table->integer('wheelchair_accessible')->nullable();
            $table->string('block_id', 50)->nullable();

            $table->index('route_id');
            $table->index('service_id');
        });

        Schema::connection('gtfs')->create('stop_times', function (Blueprint $table) {
            $table->string('trip_id', 50);
            $table->string('arrival_time', 20);
            $table->string('departure_time', 20);
            $table->string('stop_id', 50);
            $table->integer('stop_sequence');
            $table->integer('timepoint')->nullable();

            $table->index(['trip_id', 'stop_sequence']);
            $table->index('stop_id');
        });

        Schema::connection('gtfs')->create('transfers', function (Blueprint $table) {
            $table->string('from_stop_id', 50);
            $table->string('to_stop_id', 50);
            $table->string('from_route_id', 50)->nullable();
            $table->string('to_route_id', 50)->nullable();
            $table->string('from_trip_id', 50)->nullable();
            $table->string('to_trip_id', 50)->nullable();
            $table->integer('transfer_type');
            $table->integer('min_transfer_time')->nullable();
        });
    }

    public function down(): void
    {
        Schema::connection('gtfs')->dropIfExists('transfers');
        Schema::connection('gtfs')->dropIfExists('stop_times');
        Schema::connection('gtfs')->dropIfExists('trips');
        Schema::connection('gtfs')->dropIfExists('stops');
        Schema::connection('gtfs')->dropIfExists('shapes');
        Schema::connection('gtfs')->dropIfExists('routes');
        Schema::connection('gtfs')->dropIfExists('calendar_dates');
        Schema::connection('gtfs')->dropIfExists('calendar');
        Schema::connection('gtfs')->dropIfExists('feed_info');
        Schema::connection('gtfs')->dropIfExists('agency');
    }
};

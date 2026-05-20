<?php

namespace Tests\Unit;

use App\Models\StopTime;
use App\Models\Trip;
use App\Models\Stop;
use App\Models\Route;
use App\Models\Calendar;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StopTimeTest extends TestCase
{
    use RefreshDatabase;

    protected $connectionsToTransact = ['gtfs'];

    protected function setUp(): void
    {
        parent::setUp();

        Route::create(['route_id' => 'A1-33-17', 'route_type' => 0]);

        Calendar::create([
            'service_id' => '1130',
            'monday'     => 0, 'tuesday' => 0, 'wednesday' => 0,
            'thursday'   => 0, 'friday' => 0, 'saturday' => 0, 'sunday' => 0,
            'start_date' => '20251222', 'end_date' => '20261231',
        ]);

        Trip::create(['trip_id' => '859574', 'route_id' => 'A1-33-17', 'service_id' => '1130']);

        Stop::create(['stop_id' => '17', 'stop_name' => 'El Campello', 'stop_lat' => 38.4278, 'stop_lon' => -0.3951]);
        Stop::create(['stop_id' => '19', 'stop_name' => 'Poble Espanyol', 'stop_lat' => 38.4390, 'stop_lon' => -0.3826]);
        Stop::create(['stop_id' => '20', 'stop_name' => 'Amerador', 'stop_lat' => 38.4445, 'stop_lon' => -0.3736]);
    }

    public function test_uses_gtfs_connection(): void
    {
        $this->assertEquals('gtfs', (new StopTime())->getConnectionName());
    }

    public function test_uses_correct_table(): void
    {
        $this->assertEquals('stop_times', (new StopTime())->getTable());
    }

    public function test_has_no_primary_key(): void
    {
        $this->assertNull((new StopTime())->getKeyName());
    }

    public function test_is_not_incrementing(): void
    {
        $this->assertFalse((new StopTime())->getIncrementing());
    }

    public function test_timestamps_are_disabled(): void
    {
        $this->assertFalse((new StopTime())->usesTimestamps());
    }

    public function test_can_create_stop_time(): void
    {
        StopTime::create([
            'trip_id'        => '859574',
            'arrival_time'   => '06:05:00',
            'departure_time' => '06:05:00',
            'stop_id'        => '17',
            'stop_sequence'  => 1,
            'timepoint'      => 1,
        ]);

        $this->assertDatabaseHas('stop_times', [
            'trip_id'       => '859574',
            'stop_sequence' => 1,
        ], 'gtfs');
    }

    public function test_can_create_full_trip_sequence(): void
    {
        StopTime::create(['trip_id' => '859574', 'arrival_time' => '06:05:00', 'departure_time' => '06:05:00', 'stop_id' => '17', 'stop_sequence' => 1, 'timepoint' => 1]);
        StopTime::create(['trip_id' => '859574', 'arrival_time' => '06:08:00', 'departure_time' => '06:08:00', 'stop_id' => '19', 'stop_sequence' => 2, 'timepoint' => 1]);
        StopTime::create(['trip_id' => '859574', 'arrival_time' => '06:10:00', 'departure_time' => '06:10:00', 'stop_id' => '20', 'stop_sequence' => 3, 'timepoint' => 1]);

        $times = StopTime::where('trip_id', '859574')->orderBy('stop_sequence')->get();

        $this->assertCount(3, $times);
        $this->assertEquals('06:05:00', $times->first()->arrival_time);
        $this->assertEquals('06:10:00', $times->last()->departure_time);
    }

    public function test_can_find_by_composite_key(): void
    {
        StopTime::create([
            'trip_id'        => '859574',
            'arrival_time'   => '06:05:00',
            'departure_time' => '06:05:00',
            'stop_id'        => '17',
            'stop_sequence'  => 1,
        ]);

        $found = StopTime::where('trip_id', '859574')->where('stop_sequence', 1)->first();

        $this->assertNotNull($found);
        $this->assertEquals('17', $found->stop_id);
    }

    public function test_can_update_stop_time(): void
    {
        StopTime::create([
            'trip_id'        => '859574',
            'arrival_time'   => '06:05:00',
            'departure_time' => '06:05:00',
            'stop_id'        => '17',
            'stop_sequence'  => 1,
        ]);

        StopTime::where('trip_id', '859574')->where('stop_sequence', 1)
            ->update(['arrival_time' => '06:06:00', 'departure_time' => '06:06:00']);

        $this->assertDatabaseHas('stop_times', [
            'trip_id'        => '859574',
            'stop_sequence'  => 1,
            'arrival_time'   => '06:06:00',
        ], 'gtfs');
    }

    public function test_can_delete_stop_time(): void
    {
        StopTime::create([
            'trip_id'        => '859574',
            'arrival_time'   => '06:05:00',
            'departure_time' => '06:05:00',
            'stop_id'        => '17',
            'stop_sequence'  => 1,
        ]);

        StopTime::where('trip_id', '859574')->where('stop_sequence', 1)->delete();

        $this->assertDatabaseMissing('stop_times', [
            'trip_id'       => '859574',
            'stop_sequence' => 1,
        ], 'gtfs');
    }

    public function test_timepoint_accepts_null(): void
    {
        StopTime::create([
            'trip_id'        => '859574',
            'arrival_time'   => '06:05:00',
            'departure_time' => '06:05:00',
            'stop_id'        => '17',
            'stop_sequence'  => 1,
            'timepoint'      => null,
        ]);

        $found = StopTime::where('trip_id', '859574')->where('stop_sequence', 1)->first();
        $this->assertNull($found->timepoint);
    }

    public function test_belongs_to_trip(): void
    {
        StopTime::create([
            'trip_id'        => '859574',
            'arrival_time'   => '06:05:00',
            'departure_time' => '06:05:00',
            'stop_id'        => '17',
            'stop_sequence'  => 1,
        ]);

        $stopTime = StopTime::where('trip_id', '859574')->where('stop_sequence', 1)->first();

        $this->assertNotNull($stopTime->trayecto);
        $this->assertEquals('859574', $stopTime->trayecto->trip_id);
    }

    public function test_belongs_to_stop(): void
    {
        StopTime::create([
            'trip_id'        => '859574',
            'arrival_time'   => '06:05:00',
            'departure_time' => '06:05:00',
            'stop_id'        => '17',
            'stop_sequence'  => 1,
        ]);

        $stopTime = StopTime::where('trip_id', '859574')->where('stop_sequence', 1)->first();

        $this->assertNotNull($stopTime->parada);
        $this->assertEquals('El Campello', $stopTime->parada->stop_name);
    }
}

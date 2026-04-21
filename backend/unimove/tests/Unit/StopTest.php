<?php

namespace Tests\Unit;

use App\Models\Stop;
use App\Models\StopTime;
use App\Models\Trip;
use App\Models\Route;
use App\Models\Calendar;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StopTest extends TestCase
{
    use RefreshDatabase;

    protected $connectionsToTransact = ['gtfs'];

    private function makeStop(string $stopId, string $name, float $lat, float $lon, string $zone = 'A'): Stop
    {
        return Stop::create([
            'stop_id'   => $stopId,
            'stop_name' => $name,
            'stop_lat'  => $lat,
            'stop_lon'  => $lon,
            'zone_id'   => $zone,
        ]);
    }

    public function test_uses_gtfs_connection(): void
    {
        $this->assertEquals('gtfs', (new Stop())->getConnectionName());
    }

    public function test_uses_correct_table(): void
    {
        $this->assertEquals('stops', (new Stop())->getTable());
    }

    public function test_primary_key_is_stop_id(): void
    {
        $this->assertEquals('stop_id', (new Stop())->getKeyName());
    }

    public function test_primary_key_is_not_incrementing(): void
    {
        $this->assertFalse((new Stop())->getIncrementing());
    }

    public function test_primary_key_type_is_string(): void
    {
        $this->assertEquals('string', (new Stop())->getKeyType());
    }

    public function test_timestamps_are_disabled(): void
    {
        $this->assertFalse((new Stop())->usesTimestamps());
    }

    public function test_can_create_stop(): void
    {
        $this->makeStop('17', 'El Campello', 38.4278488159, -0.3951399922, 'A T1');

        $this->assertDatabaseHas('stops', ['stop_id' => '17'], 'gtfs');
    }

    public function test_can_find_stop_by_primary_key(): void
    {
        $this->makeStop('2', 'Alicante - Luceros', 38.3459892273, -0.4906579852);

        $found = Stop::find('2');

        $this->assertNotNull($found);
        $this->assertEquals('Alicante - Luceros', $found->stop_name);
    }

    public function test_can_update_stop(): void
    {
        $stop = $this->makeStop('2', 'Alicante - Luceros', 38.3459, -0.4906);

        $stop->update(['stop_name' => 'Luceros']);

        $this->assertDatabaseHas('stops', [
            'stop_id'   => '2',
            'stop_name' => 'Luceros',
        ], 'gtfs');
    }

    public function test_can_delete_stop(): void
    {
        $stop = $this->makeStop('17', 'El Campello', 38.4278, -0.3951);

        $stop->delete();

        $this->assertDatabaseMissing('stops', ['stop_id' => '17'], 'gtfs');
    }

    public function test_nullable_fields_accept_null(): void
    {
        Stop::create([
            'stop_id'             => '17',
            'stop_name'           => 'El Campello',
            'stop_lat'            => 38.4278,
            'stop_lon'            => -0.3951,
            'stop_code'           => null,
            'zone_id'             => null,
            'wheelchair_boarding' => null,
        ]);

        $found = Stop::find('17');

        $this->assertNull($found->stop_code);
        $this->assertNull($found->zone_id);
        $this->assertNull($found->wheelchair_boarding);
    }

    public function test_wheelchair_boarding_stores_valid_values(): void
    {
        foreach ([0, 1, 2] as $i => $value) {
            Stop::create([
                'stop_id'             => (string) ($i + 100),
                'stop_name'           => "Stop $value",
                'stop_lat'            => 38.0,
                'stop_lon'            => -0.4,
                'wheelchair_boarding' => $value,
            ]);
        }

        $this->assertEquals(0, Stop::find('100')->wheelchair_boarding);
        $this->assertEquals(1, Stop::find('101')->wheelchair_boarding);
        $this->assertEquals(2, Stop::find('102')->wheelchair_boarding);
    }

    public function test_stop_time_parada_relation(): void
    {
        $this->makeStop('17', 'El Campello', 38.4278, -0.3951);

        Route::create(['route_id' => 'A1-33-17', 'route_type' => 0]);

        Calendar::create([
            'service_id' => '1130',
            'monday'     => 0, 'tuesday' => 0, 'wednesday' => 0,
            'thursday'   => 0, 'friday' => 0, 'saturday' => 0, 'sunday' => 0,
            'start_date' => '20251222', 'end_date' => '20261231',
        ]);

        Trip::create(['trip_id' => '886857', 'route_id' => 'A1-33-17', 'service_id' => '1130']);

        StopTime::create([
            'trip_id'        => '886857',
            'arrival_time'   => '06:05:00',
            'departure_time' => '06:05:00',
            'stop_id'        => '17',
            'stop_sequence'  => 1,
        ]);

        $stopTime = StopTime::where('trip_id', '886857')->where('stop_sequence', 1)->first();

        $this->assertNotNull($stopTime->parada);
        $this->assertEquals('El Campello', $stopTime->parada->stop_name);
    }
}

<?php

namespace Tests\Unit;

use App\Models\Trip;
use App\Models\Route;
use App\Models\Calendar;
use App\Models\Shape;
use App\Models\Agency;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TripTest extends TestCase
{
    use RefreshDatabase;

    protected $connectionsToTransact = ['gtfs'];

    protected function setUp(): void
    {
        parent::setUp();

        Agency::create([
            'agency_id'       => '1',
            'agency_name'     => 'Tram Alicante',
            'agency_url'      => 'http://www.tramalicante.es',
            'agency_timezone' => 'Europe/Madrid',
        ]);

        Route::create(['route_id' => 'A1-33-17', 'agency_id' => '1', 'route_type' => 0]);
        Route::create(['route_id' => 'A1-2-17',  'agency_id' => '1', 'route_type' => 0]);

        Calendar::create([
            'service_id' => '1130',
            'monday'     => 0, 'tuesday' => 0, 'wednesday' => 0,
            'thursday'   => 0, 'friday' => 0, 'saturday' => 0, 'sunday' => 0,
            'start_date' => '20251222', 'end_date' => '20261231',
        ]);

        Calendar::create([
            'service_id' => '1132',
            'monday'     => 0, 'tuesday' => 0, 'wednesday' => 0,
            'thursday'   => 0, 'friday' => 0, 'saturday' => 0, 'sunday' => 0,
            'start_date' => '20261208', 'end_date' => '20261208',
        ]);

        Shape::create(['shape_id' => '1', 'shape_pt_lat' => 38.3459, 'shape_pt_lon' => -0.4906, 'shape_pt_sequence' => 1]);
        Shape::create(['shape_id' => '2', 'shape_pt_lat' => 38.3459, 'shape_pt_lon' => -0.4906, 'shape_pt_sequence' => 1]);
    }

    public function test_uses_gtfs_connection(): void
    {
        $this->assertEquals('gtfs', (new Trip())->getConnectionName());
    }

    public function test_uses_correct_table(): void
    {
        $this->assertEquals('trips', (new Trip())->getTable());
    }

    public function test_primary_key_is_trip_id(): void
    {
        $this->assertEquals('trip_id', (new Trip())->getKeyName());
    }

    public function test_primary_key_is_not_incrementing(): void
    {
        $this->assertFalse((new Trip())->getIncrementing());
    }

    public function test_primary_key_type_is_string(): void
    {
        $this->assertEquals('string', (new Trip())->getKeyType());
    }

    public function test_timestamps_are_disabled(): void
    {
        $this->assertFalse((new Trip())->usesTimestamps());
    }

    public function test_can_create_trip(): void
    {
        Trip::create([
            'trip_id'       => '886857',
            'route_id'      => 'A1-33-17',
            'service_id'    => '1130',
            'trip_headsign' => 'Benidorm',
            'shape_id'      => '1',
        ]);

        $this->assertDatabaseHas('trips', ['trip_id' => '886857'], 'gtfs');
    }

    public function test_can_find_trip_by_primary_key(): void
    {
        Trip::create([
            'trip_id'    => '886628',
            'route_id'   => 'A1-2-17',
            'service_id' => '1130',
            'shape_id'   => '2',
        ]);

        $found = Trip::find('886628');

        $this->assertNotNull($found);
        $this->assertEquals('A1-2-17', $found->route_id);
    }

    public function test_can_update_trip(): void
    {
        $trip = Trip::create([
            'trip_id'    => '886857',
            'route_id'   => 'A1-33-17',
            'service_id' => '1130',
        ]);

        $trip->update(['trip_headsign' => 'Benidorm Intermodal']);

        $this->assertDatabaseHas('trips', [
            'trip_id'       => '886857',
            'trip_headsign' => 'Benidorm Intermodal',
        ], 'gtfs');
    }

    public function test_can_delete_trip(): void
    {
        $trip = Trip::create([
            'trip_id'    => '886857',
            'route_id'   => 'A1-33-17',
            'service_id' => '1130',
        ]);

        $trip->delete();

        $this->assertDatabaseMissing('trips', ['trip_id' => '886857'], 'gtfs');
    }

    public function test_nullable_fields_accept_null(): void
    {
        Trip::create([
            'trip_id'               => '886857',
            'route_id'              => 'A1-33-17',
            'service_id'            => '1130',
            'trip_headsign'         => null,
            'shape_id'              => null,
            'wheelchair_accessible' => null,
            'block_id'              => null,
        ]);

        $found = Trip::find('886857');

        $this->assertNull($found->trip_headsign);
        $this->assertNull($found->shape_id);
        $this->assertNull($found->wheelchair_accessible);
        $this->assertNull($found->block_id);
    }

    public function test_wheelchair_accessible_stores_valid_values(): void
    {
        foreach ([0, 1, 2] as $i => $value) {
            Trip::create([
                'trip_id'               => "trip_$i",
                'route_id'              => 'A1-33-17',
                'service_id'            => '1130',
                'wheelchair_accessible' => $value,
            ]);
        }

        $this->assertEquals(0, Trip::find('trip_0')->wheelchair_accessible);
        $this->assertEquals(1, Trip::find('trip_1')->wheelchair_accessible);
        $this->assertEquals(2, Trip::find('trip_2')->wheelchair_accessible);
    }

    public function test_belongs_to_route(): void
    {
        Trip::create(['trip_id' => '886857', 'route_id' => 'A1-33-17', 'service_id' => '1130']);

        $trip = Trip::find('886857');

        $this->assertNotNull($trip->ruta);
        $this->assertEquals('A1-33-17', $trip->ruta->route_id);
    }

    public function test_belongs_to_calendar(): void
    {
        Trip::create(['trip_id' => '886857', 'route_id' => 'A1-33-17', 'service_id' => '1130']);

        $trip = Trip::find('886857');

        $this->assertNotNull($trip->calendario);
        $this->assertEquals('1130', $trip->calendario->service_id);
    }

    public function test_belongs_to_shape(): void
    {
        Trip::create(['trip_id' => '886857', 'route_id' => 'A1-33-17', 'service_id' => '1130', 'shape_id' => '1']);

        $trip = Trip::find('886857');

        $this->assertNotNull($trip->forma);
        $this->assertEquals('1', $trip->forma->shape_id);
    }

    public function test_forma_is_null_when_no_shape_id(): void
    {
        Trip::create(['trip_id' => '886857', 'route_id' => 'A1-33-17', 'service_id' => '1130', 'shape_id' => null]);

        $trip = Trip::find('886857');

        $this->assertNull($trip->forma);
    }

    public function test_multiple_trips_can_share_same_service_and_route(): void
    {
        Trip::create(['trip_id' => '886857', 'route_id' => 'A1-33-17', 'service_id' => '1130']);
        Trip::create(['trip_id' => '886856', 'route_id' => 'A1-33-17', 'service_id' => '1130']);

        $trips = Trip::where('route_id', 'A1-33-17')->where('service_id', '1130')->get();

        $this->assertCount(2, $trips);
    }

    public function test_trips_belong_to_different_calendars(): void
    {
        Trip::create(['trip_id' => '886857', 'route_id' => 'A1-33-17', 'service_id' => '1130']);
        Trip::create(['trip_id' => '886858', 'route_id' => 'A1-2-17',  'service_id' => '1132']);

        $this->assertEquals('1130', Trip::find('886857')->calendario->service_id);
        $this->assertEquals('1132', Trip::find('886858')->calendario->service_id);
    }
}

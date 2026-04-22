<?php

namespace Tests\Unit;

use App\Models\Route;
use App\Models\Agency;
use App\Models\Trip;
use App\Models\Calendar;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RouteTest extends TestCase
{
    use RefreshDatabase;

    protected $connectionsToTransact = ['gtfs'];

    private function createAgency(): Agency
    {
        return Agency::create([
            'agency_id'       => '1',
            'agency_name'     => 'Tram Alicante',
            'agency_url'      => 'http://www.tramalicante.es',
            'agency_timezone' => 'Europe/Madrid',
        ]);
    }

    public function test_uses_gtfs_connection(): void
    {
        $this->assertEquals('gtfs', (new Route())->getConnectionName());
    }

    public function test_uses_correct_table(): void
    {
        $this->assertEquals('routes', (new Route())->getTable());
    }

    public function test_primary_key_is_route_id(): void
    {
        $this->assertEquals('route_id', (new Route())->getKeyName());
    }

    public function test_primary_key_is_not_incrementing(): void
    {
        $this->assertFalse((new Route())->getIncrementing());
    }

    public function test_primary_key_type_is_string(): void
    {
        $this->assertEquals('string', (new Route())->getKeyType());
    }

    public function test_timestamps_are_disabled(): void
    {
        $this->assertFalse((new Route())->usesTimestamps());
    }


    public function test_can_create_route(): void
    {
        $this->createAgency();

        Route::create([
            'route_id'         => 'A1-2-17',
            'agency_id'        => '1',
            'route_short_name' => '1',
            'route_long_name'  => '1 - Alicante - Luceros - El Campello',
            'route_type'       => 0,
            'route_color'      => 'CE142B',
            'route_text_color' => 'FFFFFF',
        ]);

        $this->assertDatabaseHas('routes', ['route_id' => 'A1-2-17'], 'gtfs');
    }

    public function test_can_find_route_by_primary_key(): void
    {
        $this->createAgency();

        Route::create([
            'route_id'    => 'A1-2-17',
            'agency_id'   => '1',
            'route_type'  => 0,
            'route_color' => 'CE142B',
        ]);

        $found = Route::find('A1-2-17');

        $this->assertNotNull($found);
        $this->assertEquals('CE142B', $found->route_color);
    }

    public function test_can_update_route(): void
    {
        $this->createAgency();

        $route = Route::create([
            'route_id'   => 'A1-2-17',
            'agency_id'  => '1',
            'route_type' => 0,
        ]);

        $route->update(['route_color' => 'FF0000']);

        $this->assertDatabaseHas('routes', [
            'route_id'    => 'A1-2-17',
            'route_color' => 'FF0000',
        ], 'gtfs');
    }

    public function test_can_delete_route(): void
    {
        $this->createAgency();

        $route = Route::create([
            'route_id'   => 'A1-2-17',
            'agency_id'  => '1',
            'route_type' => 0,
        ]);

        $route->delete();

        $this->assertDatabaseMissing('routes', ['route_id' => 'A1-2-17'], 'gtfs');
    }


    public function test_nullable_fields_accept_null(): void
    {
        Route::create([
            'route_id'         => 'A1-2-17',
            'agency_id'        => null,
            'route_short_name' => null,
            'route_long_name'  => null,
            'route_type'       => 0,
            'route_url'        => null,
            'route_color'      => null,
            'route_text_color' => null,
        ]);

        $found = Route::find('A1-2-17');

        $this->assertNull($found->agency_id);
        $this->assertNull($found->route_color);
        $this->assertNull($found->route_url);
    }

    public function test_belongs_to_agency(): void
    {
        $this->createAgency();

        Route::create([
            'route_id'   => 'A1-2-17',
            'agency_id'  => '1',
            'route_type' => 0,
        ]);

        $route = Route::find('A1-2-17');

        $this->assertNotNull($route->agencia);
        $this->assertEquals('Tram Alicante', $route->agencia->agency_name);
    }

    public function test_agencia_is_null_when_no_agency_id(): void
    {
        Route::create([
            'route_id'   => 'A1-2-17',
            'agency_id'  => null,
            'route_type' => 0,
        ]);

        $route = Route::find('A1-2-17');

        $this->assertNull($route->agencia);
    }

    public function test_trip_belongs_to_route(): void
    {
        $this->createAgency();

        Route::create([
            'route_id'   => 'A1-33-17',
            'agency_id'  => '1',
            'route_type' => 0,
        ]);

        Calendar::create([
            'service_id' => '1130',
            'monday'     => 0, 'tuesday' => 0, 'wednesday' => 0,
            'thursday'   => 0, 'friday' => 0, 'saturday' => 0, 'sunday' => 0,
            'start_date' => '20251222', 'end_date' => '20261231',
        ]);

        Trip::create([
            'trip_id'       => '886857',
            'route_id'      => 'A1-33-17',
            'service_id'    => '1130',
            'trip_headsign' => 'Benidorm',
        ]);

        $trip = Trip::find('886857');

        $this->assertNotNull($trip->ruta);
        $this->assertEquals('A1-33-17', $trip->ruta->route_id);
    }
}

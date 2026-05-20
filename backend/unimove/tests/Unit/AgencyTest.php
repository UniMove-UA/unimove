<?php

namespace Tests\Unit;

use App\Models\Agency;
use App\Models\Route;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgencyTest extends TestCase
{
    use RefreshDatabase;

    protected $connectionsToTransact = ['gtfs'];

    public function test_uses_gtfs_connection(): void
    {
        $this->assertEquals('gtfs', (new Agency())->getConnectionName());
    }

    public function test_uses_correct_table(): void
    {
        $this->assertEquals('agency', (new Agency())->getTable());
    }

    public function test_primary_key_is_agency_id(): void
    {
        $this->assertEquals('agency_id', (new Agency())->getKeyName());
    }

    public function test_primary_key_is_not_incrementing(): void
    {
        $this->assertFalse((new Agency())->getIncrementing());
    }

    public function test_primary_key_type_is_string(): void
    {
        $this->assertEquals('string', (new Agency())->getKeyType());
    }

    public function test_timestamps_are_disabled(): void
    {
        $this->assertFalse((new Agency())->usesTimestamps());
    }

    public function test_can_create_agency(): void
    {
        $agency = Agency::create([
            'agency_id'       => '1',
            'agency_name'     => 'Tram Alicante',
            'agency_url'      => 'http://www.tramalicante.es',
            'agency_timezone' => 'Europe/Madrid',
            'agency_lang'     => 'es',
            'agency_phone'    => '900720472',
        ]);

        $this->assertDatabaseHas('agency', ['agency_id' => '1'], 'gtfs');
        $this->assertEquals('Tram Alicante', $agency->agency_name);
    }

    public function test_can_find_agency_by_primary_key(): void
    {
        Agency::create([
            'agency_id'       => '1',
            'agency_name'     => 'Tram Alicante',
            'agency_url'      => 'http://www.tramalicante.es',
            'agency_timezone' => 'Europe/Madrid',
        ]);

        $found = Agency::find('1');

        $this->assertNotNull($found);
        $this->assertEquals('Tram Alicante', $found->agency_name);
    }

    public function test_can_update_agency(): void
    {
        $agency = Agency::create([
            'agency_id'       => '1',
            'agency_name'     => 'Tram Alicante',
            'agency_url'      => 'http://www.tramalicante.es',
            'agency_timezone' => 'Europe/Madrid',
        ]);

        $agency->update(['agency_name' => 'Tram Alicante Actualizado']);

        $this->assertDatabaseHas('agency', [
            'agency_id'   => '1',
            'agency_name' => 'Tram Alicante Actualizado',
        ], 'gtfs');
    }

    public function test_can_delete_agency(): void
    {
        $agency = Agency::create([
            'agency_id'       => '1',
            'agency_name'     => 'Tram Alicante',
            'agency_url'      => 'http://www.tramalicante.es',
            'agency_timezone' => 'Europe/Madrid',
        ]);

        $agency->delete();

        $this->assertDatabaseMissing('agency', ['agency_id' => '1'], 'gtfs');
    }

    public function test_nullable_fields_accept_null(): void
    {
        Agency::create([
            'agency_id'       => '1',
            'agency_name'     => 'Tram Alicante',
            'agency_url'      => 'http://www.tramalicante.es',
            'agency_timezone' => 'Europe/Madrid',
            'agency_lang'     => null,
            'agency_phone'    => null,
            'agency_fare_url' => null,
            'agency_email'    => null,
        ]);

        $fresh = Agency::find('1');
        $this->assertNull($fresh->agency_lang);
        $this->assertNull($fresh->agency_phone);
        $this->assertNull($fresh->agency_fare_url);
        $this->assertNull($fresh->agency_email);
    }

    public function test_route_belongs_to_agency(): void
    {
        Agency::create([
            'agency_id'       => '1',
            'agency_name'     => 'Tram Alicante',
            'agency_url'      => 'http://www.tramalicante.es',
            'agency_timezone' => 'Europe/Madrid',
        ]);

        Route::create([
            'route_id'   => 'A1-2-17',
            'agency_id'  => '1',
            'route_type' => 0,
        ]);

        $route = Route::find('A1-2-17');

        $this->assertNotNull($route->agencia);
        $this->assertEquals('1', $route->agencia->agency_id);
        $this->assertEquals('Tram Alicante', $route->agencia->agency_name);
    }
}

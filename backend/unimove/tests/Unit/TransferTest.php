<?php

namespace Tests\Unit;

use App\Models\Transfer;
use App\Models\Stop;
use App\Models\Route;
use App\Models\Trip;
use App\Models\Calendar;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransferTest extends TestCase
{
    use RefreshDatabase;

    protected $connectionsToTransact = ['gtfs'];

    protected function setUp(): void
    {
        parent::setUp();

        Stop::create(['stop_id' => '2',  'stop_name' => 'Alicante - Luceros', 'stop_lat' => 38.3459, 'stop_lon' => -0.4906]);
        Stop::create(['stop_id' => '3',  'stop_name' => 'Mercado',            'stop_lat' => 38.3482, 'stop_lon' => -0.4846]);
        Stop::create(['stop_id' => '17', 'stop_name' => 'El Campello',        'stop_lat' => 38.4278, 'stop_lon' => -0.3951]);

        Route::create(['route_id' => 'A1-2-17', 'route_type' => 0]);
        Route::create(['route_id' => 'A2-2-124', 'route_type' => 0]);

        Calendar::create([
            'service_id' => '1130',
            'monday'     => 0, 'tuesday' => 0, 'wednesday' => 0,
            'thursday'   => 0, 'friday' => 0, 'saturday' => 0, 'sunday' => 0,
            'start_date' => '20251222', 'end_date' => '20261231',
        ]);

        Trip::create(['trip_id' => '886628', 'route_id' => 'A1-2-17',  'service_id' => '1130']);
        Trip::create(['trip_id' => '886629', 'route_id' => 'A2-2-124', 'service_id' => '1130']);
    }

    public function test_uses_gtfs_connection(): void
    {
        $this->assertEquals('gtfs', (new Transfer())->getConnectionName());
    }

    public function test_uses_correct_table(): void
    {
        $this->assertEquals('transfers', (new Transfer())->getTable());
    }

    public function test_has_no_primary_key(): void
    {
        $this->assertNull((new Transfer())->getKeyName());
    }

    public function test_is_not_incrementing(): void
    {
        $this->assertFalse((new Transfer())->getIncrementing());
    }

    public function test_timestamps_are_disabled(): void
    {
        $this->assertFalse((new Transfer())->usesTimestamps());
    }

    public function test_can_create_minimal_transfer(): void
    {
        Transfer::create([
            'from_stop_id'  => '2',
            'to_stop_id'    => '3',
            'transfer_type' => 0,
        ]);

        $this->assertDatabaseHas('transfers', [
            'from_stop_id' => '2',
            'to_stop_id'   => '3',
        ], 'gtfs');
    }

    public function test_can_create_full_transfer(): void
    {
        Transfer::create([
            'from_stop_id'      => '2',
            'to_stop_id'        => '17',
            'from_route_id'     => 'A1-2-17',
            'to_route_id'       => 'A2-2-124',
            'from_trip_id'      => '886628',
            'to_trip_id'        => '886629',
            'transfer_type'     => 2,
            'min_transfer_time' => 180,
        ]);

        $found = Transfer::where('from_stop_id', '2')->where('to_stop_id', '17')->first();

        $this->assertNotNull($found);
        $this->assertEquals(2, $found->transfer_type);
        $this->assertEquals(180, $found->min_transfer_time);
    }

    public function test_can_update_transfer(): void
    {
        Transfer::create([
            'from_stop_id'  => '2',
            'to_stop_id'    => '3',
            'transfer_type' => 0,
        ]);

        Transfer::where('from_stop_id', '2')->where('to_stop_id', '3')
            ->update(['transfer_type' => 2, 'min_transfer_time' => 300]);

        $this->assertDatabaseHas('transfers', [
            'from_stop_id'      => '2',
            'to_stop_id'        => '3',
            'transfer_type'     => 2,
            'min_transfer_time' => 300,
        ], 'gtfs');
    }

    public function test_can_delete_transfer(): void
    {
        Transfer::create([
            'from_stop_id'  => '2',
            'to_stop_id'    => '3',
            'transfer_type' => 0,
        ]);

        Transfer::where('from_stop_id', '2')->where('to_stop_id', '3')->delete();

        $this->assertDatabaseMissing('transfers', [
            'from_stop_id' => '2',
            'to_stop_id'   => '3',
        ], 'gtfs');
    }

    public function test_all_transfer_types_are_valid(): void
    {
        $before = Transfer::count();
        $stops = [['2','3'], ['2','17'], ['3','17'], ['17','2']];

        foreach ([0, 1, 2, 3] as $i => $type) {
            Transfer::create([
                'from_stop_id'  => $stops[$i][0],
                'to_stop_id'    => $stops[$i][1],
                'transfer_type' => $type,
            ]);
        }

        $this->assertEquals($before + 4, Transfer::count());
    }

    public function test_optional_fields_accept_null(): void
    {
        Transfer::create([
            'from_stop_id'      => '2',
            'to_stop_id'        => '3',
            'from_route_id'     => null,
            'to_route_id'       => null,
            'from_trip_id'      => null,
            'to_trip_id'        => null,
            'transfer_type'     => 0,
            'min_transfer_time' => null,
        ]);

        $found = Transfer::where('from_stop_id', '2')->where('to_stop_id', '3')->first();

        $this->assertNull($found->from_route_id);
        $this->assertNull($found->min_transfer_time);
    }

    public function test_belongs_to_parada_origen(): void
    {
        Transfer::create(['from_stop_id' => '2', 'to_stop_id' => '3', 'transfer_type' => 0]);

        $transfer = Transfer::where('from_stop_id', '2')->where('to_stop_id', '3')->first();

        $this->assertNotNull($transfer->paradaOrigen);
        $this->assertEquals('Alicante - Luceros', $transfer->paradaOrigen->stop_name);
    }

    public function test_belongs_to_parada_destino(): void
    {
        Transfer::create(['from_stop_id' => '2', 'to_stop_id' => '3', 'transfer_type' => 0]);

        $transfer = Transfer::where('from_stop_id', '2')->where('to_stop_id', '3')->first();

        $this->assertNotNull($transfer->paradaDestino);
        $this->assertEquals('Mercado', $transfer->paradaDestino->stop_name);
    }

    public function test_belongs_to_ruta_origen(): void
    {
        Transfer::create(['from_stop_id' => '2', 'to_stop_id' => '3', 'from_route_id' => 'A1-2-17', 'transfer_type' => 0]);

        $transfer = Transfer::where('from_stop_id', '2')->where('to_stop_id', '3')->first();

        $this->assertNotNull($transfer->rutaOrigen);
        $this->assertEquals('A1-2-17', $transfer->rutaOrigen->route_id);
    }

    public function test_belongs_to_ruta_destino(): void
    {
        Transfer::create(['from_stop_id' => '2', 'to_stop_id' => '3', 'to_route_id' => 'A2-2-124', 'transfer_type' => 0]);

        $transfer = Transfer::where('from_stop_id', '2')->where('to_stop_id', '3')->first();

        $this->assertNotNull($transfer->rutaDestino);
        $this->assertEquals('A2-2-124', $transfer->rutaDestino->route_id);
    }

    public function test_belongs_to_trayecto_origen(): void
    {
        Transfer::create(['from_stop_id' => '2', 'to_stop_id' => '3', 'from_trip_id' => '886628', 'transfer_type' => 0]);

        $transfer = Transfer::where('from_stop_id', '2')->where('to_stop_id', '3')->first();

        $this->assertNotNull($transfer->trayectoOrigen);
        $this->assertEquals('886628', $transfer->trayectoOrigen->trip_id);
    }

    public function test_belongs_to_trayecto_destino(): void
    {
        Transfer::create(['from_stop_id' => '2', 'to_stop_id' => '3', 'to_trip_id' => '886629', 'transfer_type' => 0]);

        $transfer = Transfer::where('from_stop_id', '2')->where('to_stop_id', '3')->first();

        $this->assertNotNull($transfer->trayectoDestino);
        $this->assertEquals('886629', $transfer->trayectoDestino->trip_id);
    }
}

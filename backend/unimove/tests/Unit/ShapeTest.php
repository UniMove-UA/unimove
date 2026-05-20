<?php

namespace Tests\Unit;

use App\Models\Shape;
use App\Models\Trip;
use App\Models\Route;
use App\Models\Calendar;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShapeTest extends TestCase
{
    use RefreshDatabase;

    protected $connectionsToTransact = ['gtfs'];

    public function test_uses_gtfs_connection(): void
    {
        $this->assertEquals('gtfs', (new Shape())->getConnectionName());
    }

    public function test_uses_correct_table(): void
    {
        $this->assertEquals('shapes', (new Shape())->getTable());
    }

    public function test_has_no_primary_key(): void
    {
        $this->assertNull((new Shape())->getKeyName());
    }

    public function test_is_not_incrementing(): void
    {
        $this->assertFalse((new Shape())->getIncrementing());
    }

    public function test_timestamps_are_disabled(): void
    {
        $this->assertFalse((new Shape())->usesTimestamps());
    }


    public function test_can_create_shape_point(): void
    {
        Shape::create([
            'shape_id'          => '1',
            'shape_pt_lat'      => 38.3459892273,
            'shape_pt_lon'      => -0.4906579852,
            'shape_pt_sequence' => 1,
        ]);

        $this->assertDatabaseHas('shapes', [
            'shape_id'          => '1',
            'shape_pt_sequence' => 1,
        ], 'gtfs');
    }

    public function test_can_create_multiple_points_for_same_shape(): void
    {
        Shape::create(['shape_id' => '1', 'shape_pt_lat' => 38.3459, 'shape_pt_lon' => -0.4906, 'shape_pt_sequence' => 1]);
        Shape::create(['shape_id' => '1', 'shape_pt_lat' => 38.3468, 'shape_pt_lon' => -0.4885, 'shape_pt_sequence' => 2]);
        Shape::create(['shape_id' => '1', 'shape_pt_lat' => 38.3473, 'shape_pt_lon' => -0.4869, 'shape_pt_sequence' => 3]);

        $points = Shape::where('shape_id', '1')->orderBy('shape_pt_sequence')->get();

        $this->assertCount(3, $points);
        $this->assertEquals(1, $points->first()->shape_pt_sequence);
        $this->assertEquals(3, $points->last()->shape_pt_sequence);
    }

    public function test_can_find_shape_by_composite_key(): void
    {
        Shape::create([
            'shape_id'          => '2',
            'shape_pt_lat'      => 38.3459,
            'shape_pt_lon'      => -0.4906,
            'shape_pt_sequence' => 1,
        ]);

        $found = Shape::where('shape_id', '2')->where('shape_pt_sequence', 1)->first();

        $this->assertNotNull($found);
        $this->assertEquals(38.3459, round($found->shape_pt_lat, 4));
    }

    public function test_can_update_shape_point(): void
    {
        Shape::create([
            'shape_id'          => '1',
            'shape_pt_lat'      => 38.3459,
            'shape_pt_lon'      => -0.4906,
            'shape_pt_sequence' => 1,
        ]);

        Shape::where('shape_id', '1')->where('shape_pt_sequence', 1)
            ->update(['shape_pt_lat' => 38.9999]);

        $this->assertDatabaseHas('shapes', [
            'shape_id'          => '1',
            'shape_pt_sequence' => 1,
            'shape_pt_lat'      => 38.9999,
        ], 'gtfs');
    }

    public function test_can_delete_shape_point(): void
    {
        Shape::create([
            'shape_id'          => '1',
            'shape_pt_lat'      => 38.3459,
            'shape_pt_lon'      => -0.4906,
            'shape_pt_sequence' => 1,
        ]);

        Shape::where('shape_id', '1')->where('shape_pt_sequence', 1)->delete();

        $this->assertDatabaseMissing('shapes', [
            'shape_id'          => '1',
            'shape_pt_sequence' => 1,
        ], 'gtfs');
    }

    public function test_shape_dist_traveled_accepts_null(): void
    {
        Shape::create([
            'shape_id'            => '1',
            'shape_pt_lat'        => 38.3459,
            'shape_pt_lon'        => -0.4906,
            'shape_pt_sequence'   => 1,
            'shape_dist_traveled' => null,
        ]);

        $found = Shape::where('shape_id', '1')->first();
        $this->assertNull($found->shape_dist_traveled);
    }

    public function test_shape_dist_traveled_stores_value(): void
    {
        Shape::create([
            'shape_id'            => '1',
            'shape_pt_lat'        => 38.3459,
            'shape_pt_lon'        => -0.4906,
            'shape_pt_sequence'   => 1,
            'shape_dist_traveled' => 0.0,
        ]);

        Shape::create([
            'shape_id'            => '1',
            'shape_pt_lat'        => 38.3468,
            'shape_pt_lon'        => -0.4885,
            'shape_pt_sequence'   => 2,
            'shape_dist_traveled' => 150.5,
        ]);

        $second = Shape::where('shape_id', '1')->where('shape_pt_sequence', 2)->first();
        $this->assertEquals(150.5, $second->shape_dist_traveled);
    }

    public function test_trip_forma_relation_resolves_shape(): void
    {
        Route::create(['route_id' => 'A1-33-17', 'route_type' => 0]);

        Calendar::create([
            'service_id' => '1130',
            'monday'     => 0, 'tuesday' => 0, 'wednesday' => 0,
            'thursday'   => 0, 'friday' => 0, 'saturday' => 0, 'sunday' => 0,
            'start_date' => '20251222', 'end_date' => '20261231',
        ]);

        Shape::create(['shape_id' => '1', 'shape_pt_lat' => 38.3459, 'shape_pt_lon' => -0.4906, 'shape_pt_sequence' => 1]);

        Trip::create([
            'trip_id'    => '886857',
            'route_id'   => 'A1-33-17',
            'service_id' => '1130',
            'shape_id'   => '1',
        ]);

        $trip = Trip::find('886857');

        // La relación forma() resuelve el primer registro del shape_id
        $this->assertNotNull($trip->forma);
        $this->assertEquals('1', $trip->forma->shape_id);
    }
}

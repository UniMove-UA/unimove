<?php

namespace Tests\Unit;

use App\Models\Calendar;
use App\Models\CalendarDate;
use App\Models\Trip;
use App\Models\Route;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CalendarTest extends TestCase
{
    use RefreshDatabase;

    protected $connectionsToTransact = ['gtfs'];

    public function test_uses_gtfs_connection(): void
    {
        $this->assertEquals('gtfs', (new Calendar())->getConnectionName());
    }

    public function test_uses_correct_table(): void
    {
        $this->assertEquals('calendar', (new Calendar())->getTable());
    }

    public function test_primary_key_is_service_id(): void
    {
        $this->assertEquals('service_id', (new Calendar())->getKeyName());
    }

    public function test_primary_key_is_not_incrementing(): void
    {
        $this->assertFalse((new Calendar())->getIncrementing());
    }

    public function test_primary_key_type_is_string(): void
    {
        $this->assertEquals('string', (new Calendar())->getKeyType());
    }

    public function test_timestamps_are_disabled(): void
    {
        $this->assertFalse((new Calendar())->usesTimestamps());
    }

    public function test_can_create_calendar(): void
    {
        $calendar = Calendar::create([
            'service_id' => '1130',
            'monday'     => 0,
            'tuesday'    => 0,
            'wednesday'  => 0,
            'thursday'   => 0,
            'friday'     => 0,
            'saturday'   => 0,
            'sunday'     => 0,
            'start_date' => '20260627',
            'end_date'   => '20260628',
        ]);

        $this->assertDatabaseHas('calendar', ['service_id' => '1130'], 'gtfs');
        $this->assertEquals('20260627', $calendar->start_date);
    }

    public function test_can_find_calendar_by_primary_key(): void
    {
        Calendar::create([
            'service_id' => '1130',
            'monday'     => 1,
            'tuesday'    => 1,
            'wednesday'  => 1,
            'thursday'   => 1,
            'friday'     => 1,
            'saturday'   => 0,
            'sunday'     => 0,
            'start_date' => '20251222',
            'end_date'   => '20261231',
        ]);

        $found = Calendar::find('1130');

        $this->assertNotNull($found);
        $this->assertEquals(1, $found->monday);
        $this->assertEquals(0, $found->saturday);
    }

    public function test_can_update_calendar(): void
    {
        $calendar = Calendar::create([
            'service_id' => '1130',
            'monday'     => 0,
            'tuesday'    => 0,
            'wednesday'  => 0,
            'thursday'   => 0,
            'friday'     => 0,
            'saturday'   => 0,
            'sunday'     => 0,
            'start_date' => '20260627',
            'end_date'   => '20260628',
        ]);

        $calendar->update(['end_date' => '20261231']);

        $this->assertDatabaseHas('calendar', [
            'service_id' => '1130',
            'end_date'   => '20261231',
        ], 'gtfs');
    }

    public function test_can_delete_calendar(): void
    {
        $calendar = Calendar::create([
            'service_id' => '1130',
            'monday'     => 0,
            'tuesday'    => 0,
            'wednesday'  => 0,
            'thursday'   => 0,
            'friday'     => 0,
            'saturday'   => 0,
            'sunday'     => 0,
            'start_date' => '20260627',
            'end_date'   => '20260628',
        ]);

        $calendar->delete();

        $this->assertDatabaseMissing('calendar', ['service_id' => '1130'], 'gtfs');
    }

    public function test_calendar_date_belongs_to_calendar(): void
    {
        Calendar::create([
            'service_id' => '1130',
            'monday'     => 0, 'tuesday' => 0, 'wednesday' => 0,
            'thursday'   => 0, 'friday' => 0, 'saturday' => 0, 'sunday' => 0,
            'start_date' => '20251222', 'end_date' => '20261231',
        ]);

        CalendarDate::create([
            'service_id'     => '1130',
            'date'           => '20251222',
            'exception_type' => 1,
        ]);

        $calendarDate = CalendarDate::where('service_id', '1130')
            ->where('date', '20251222')
            ->first();

        $this->assertNotNull($calendarDate->calendario);
        $this->assertEquals('1130', $calendarDate->calendario->service_id);
    }

    public function test_trip_belongs_to_calendar(): void
    {
        Calendar::create([
            'service_id' => '1130',
            'monday'     => 0, 'tuesday' => 0, 'wednesday' => 0,
            'thursday'   => 0, 'friday' => 0, 'saturday' => 0, 'sunday' => 0,
            'start_date' => '20251222', 'end_date' => '20261231',
        ]);

        Route::create([
            'route_id'   => 'A1-33-17',
            'route_type' => 0,
        ]);

        Trip::create([
            'trip_id'    => '886857',
            'route_id'   => 'A1-33-17',
            'service_id' => '1130',
        ]);

        $trip = Trip::find('886857');

        $this->assertNotNull($trip->calendario);
        $this->assertEquals('1130', $trip->calendario->service_id);
    }
}

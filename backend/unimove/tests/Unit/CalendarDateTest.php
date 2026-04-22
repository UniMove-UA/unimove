<?php

namespace Tests\Unit;

use App\Models\CalendarDate;
use App\Models\Calendar;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CalendarDateTest extends TestCase
{
    use RefreshDatabase;

    protected $connectionsToTransact = ['gtfs'];

    private function createCalendar(string $serviceId = '1130'): Calendar
    {
        return Calendar::create([
            'service_id' => $serviceId,
            'monday'     => 0, 'tuesday' => 0, 'wednesday' => 0,
            'thursday'   => 0, 'friday' => 0, 'saturday' => 0, 'sunday' => 0,
            'start_date' => '20251222', 'end_date' => '20261231',
        ]);
    }

    public function test_uses_gtfs_connection(): void
    {
        $this->assertEquals('gtfs', (new CalendarDate())->getConnectionName());
    }

    public function test_uses_correct_table(): void
    {
        $this->assertEquals('calendar_dates', (new CalendarDate())->getTable());
    }

    public function test_has_no_primary_key(): void
    {
        $this->assertNull((new CalendarDate())->getKeyName());
    }

    public function test_is_not_incrementing(): void
    {
        $this->assertFalse((new CalendarDate())->getIncrementing());
    }

    public function test_timestamps_are_disabled(): void
    {
        $this->assertFalse((new CalendarDate())->usesTimestamps());
    }

    public function test_can_create_calendar_date(): void
    {
        $this->createCalendar();

        CalendarDate::create([
            'service_id'     => '1130',
            'date'           => '20251222',
            'exception_type' => 1,
        ]);

        $this->assertDatabaseHas('calendar_dates', [
            'service_id' => '1130',
            'date'       => '20251222',
        ], 'gtfs');
    }

    public function test_can_find_by_composite_key(): void
    {
        $this->createCalendar();

        CalendarDate::create([
            'service_id'     => '1130',
            'date'           => '20251222',
            'exception_type' => 1,
        ]);

        $found = CalendarDate::where('service_id', '1130')
            ->where('date', '20251222')
            ->first();

        $this->assertNotNull($found);
        $this->assertEquals(1, $found->exception_type);
    }

    public function test_can_create_multiple_dates_for_same_service(): void
    {
        $this->createCalendar();

        CalendarDate::create(['service_id' => '1130', 'date' => '20251222', 'exception_type' => 1]);
        CalendarDate::create(['service_id' => '1130', 'date' => '20251223', 'exception_type' => 1]);
        CalendarDate::create(['service_id' => '1130', 'date' => '20251226', 'exception_type' => 1]);

        $count = CalendarDate::where('service_id', '1130')->count();

        $this->assertEquals(3, $count);
    }

    public function test_exception_type_2_is_valid(): void
    {
        $this->createCalendar();

        CalendarDate::create([
            'service_id'     => '1130',
            'date'           => '20251222',
            'exception_type' => 2,
        ]);

        $found = CalendarDate::where('service_id', '1130')->where('date', '20251222')->first();
        $this->assertEquals(2, $found->exception_type);
    }

    public function test_can_update_calendar_date(): void
    {
        $this->createCalendar();

        CalendarDate::create([
            'service_id'     => '1130',
            'date'           => '20251222',
            'exception_type' => 1,
        ]);

        CalendarDate::where('service_id', '1130')
            ->where('date', '20251222')
            ->update(['exception_type' => 2]);

        $this->assertDatabaseHas('calendar_dates', [
            'service_id'     => '1130',
            'date'           => '20251222',
            'exception_type' => 2,
        ], 'gtfs');
    }

    public function test_can_delete_calendar_date(): void
    {
        $this->createCalendar();

        CalendarDate::create([
            'service_id'     => '1130',
            'date'           => '20251222',
            'exception_type' => 1,
        ]);

        CalendarDate::where('service_id', '1130')->where('date', '20251222')->delete();

        $this->assertDatabaseMissing('calendar_dates', [
            'service_id' => '1130',
            'date'       => '20251222',
        ], 'gtfs');
    }

    public function test_belongs_to_calendar(): void
    {
        $this->createCalendar('1132');

        CalendarDate::create([
            'service_id'     => '1132',
            'date'           => '20251227',
            'exception_type' => 1,
        ]);

        $calendarDate = CalendarDate::where('service_id', '1132')
            ->where('date', '20251227')
            ->first();

        $this->assertNotNull($calendarDate->calendario);
        $this->assertEquals('1132', $calendarDate->calendario->service_id);
    }

    public function test_calendario_returns_null_when_no_parent(): void
    {
        CalendarDate::create([
            'service_id'     => '9999',
            'date'           => '20251222',
            'exception_type' => 1,
        ]);

        $calendarDate = CalendarDate::where('service_id', '9999')->first();

        $this->assertNull($calendarDate->calendario);
    }
}

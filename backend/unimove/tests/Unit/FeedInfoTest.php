<?php

namespace Tests\Unit;

use App\Models\FeedInfo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FeedInfoTest extends TestCase
{
    use RefreshDatabase;

    protected $connectionsToTransact = ['gtfs'];

    public function test_uses_gtfs_connection(): void
    {
        $this->assertEquals('gtfs', (new FeedInfo())->getConnectionName());
    }

    public function test_uses_correct_table(): void
    {
        $this->assertEquals('feed_info', (new FeedInfo())->getTable());
    }

    public function test_has_no_primary_key(): void
    {
        $this->assertNull((new FeedInfo())->getKeyName());
    }

    public function test_is_not_incrementing(): void
    {
        $this->assertFalse((new FeedInfo())->getIncrementing());
    }

    public function test_timestamps_are_disabled(): void
    {
        $this->assertFalse((new FeedInfo())->usesTimestamps());
    }

    public function test_can_create_feed_info(): void
    {
        FeedInfo::create([
            'feed_publisher_name' => 'Tram Alicante',
            'feed_publisher_url'  => 'http://www.tramalicante.es',
            'feed_lang'           => 'es',
            'feed_start_date'     => '20251222',
            'feed_end_date'       => '20261231',
            'feed_version'        => '1.0',
        ]);

        $this->assertDatabaseHas('feed_info', [
            'feed_publisher_name' => 'Tram Alicante',
        ], 'gtfs');
    }

    public function test_can_find_feed_info(): void
    {
        FeedInfo::create([
            'feed_publisher_name' => 'Tram Alicante',
            'feed_publisher_url'  => 'http://www.tramalicante.es',
            'feed_lang'           => 'es',
        ]);

        $found = FeedInfo::where('feed_publisher_name', 'Tram Alicante')->first();

        $this->assertNotNull($found);
        $this->assertEquals('es', $found->feed_lang);
    }

    public function test_can_update_feed_info(): void
    {
        FeedInfo::create([
            'feed_publisher_name' => 'Tram Alicante',
            'feed_publisher_url'  => 'http://www.tramalicante.es',
            'feed_lang'           => 'es',
            'feed_version'        => '1.0',
        ]);

        FeedInfo::where('feed_publisher_name', 'Tram Alicante')
            ->update(['feed_version' => '2.0']);

        $this->assertDatabaseHas('feed_info', [
            'feed_publisher_name' => 'Tram Alicante',
            'feed_version'        => '2.0',
        ], 'gtfs');
    }

    public function test_can_delete_feed_info(): void
    {
        FeedInfo::create([
            'feed_publisher_name' => 'Tram Alicante',
            'feed_publisher_url'  => 'http://www.tramalicante.es',
            'feed_lang'           => 'es',
        ]);

        FeedInfo::where('feed_publisher_name', 'Tram Alicante')->delete();

        $this->assertDatabaseMissing('feed_info', [
            'feed_publisher_name' => 'Tram Alicante',
        ], 'gtfs');
    }

    public function test_nullable_fields_accept_null(): void
    {
        FeedInfo::create([
            'feed_publisher_name' => 'Tram Alicante',
            'feed_publisher_url'  => 'http://www.tramalicante.es',
            'feed_lang'           => 'es',
            'feed_start_date'     => null,
            'feed_end_date'       => null,
            'feed_version'        => null,
        ]);

        $found = FeedInfo::where('feed_publisher_name', 'Tram Alicante')->first();

        $this->assertNull($found->feed_start_date);
        $this->assertNull($found->feed_end_date);
        $this->assertNull($found->feed_version);
    }

    public function test_can_store_multiple_feed_info_rows(): void
    {
        FeedInfo::create([
            'feed_publisher_name' => 'Tram Alicante',
            'feed_publisher_url'  => 'http://www.tramalicante.es',
            'feed_lang'           => 'es',
        ]);

        FeedInfo::create([
            'feed_publisher_name' => 'FGV',
            'feed_publisher_url'  => 'http://www.fgv.es',
            'feed_lang'           => 'es',
        ]);

        $this->assertEquals(2, FeedInfo::count());
    }
}

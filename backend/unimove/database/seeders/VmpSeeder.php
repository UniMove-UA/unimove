<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vmp;

class VmpSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ubicación base de ejemplo (UA, Alicante)
        $baseLat = 38.385;
        $baseLon = -0.513;

        for ($i = 100; $i < 120; $i++) {
            Vmp::create([
                'code' => 'unimove-vmp-' . $i,
                'status' => 'available',
                'battery_level' => rand(30, 100),
                'price_per_minute' => 0.15,
                'latitude' => $baseLat + (rand(-50, 50) / 10000),
                'longitude' => $baseLon + (rand(-50, 50) / 10000),
            ]);
        }
    }
}

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
        $minLat = 38.3825;
        $maxLat = 38.3865;
        $minLon = -0.5175;
        $maxLon = -0.5095;

        $locations = [
            'Biblioteca Central',
            'Facultad de Ciencias',
            'Facultad de Derecho',
            'Rectorado',
            'Aulario II',
            'Aulario III',
            'Polideportivo',
            'Cafetería Central',
            'Facultad de Económicas',
            'Parking Este',
            'Facultad de Filosofía',
            'Facultad de Educación',
            'Facultad de Informática',
            'Parking Oeste',
            'Residencia Universitaria',
            'Facultad de Química',
            'Centro de Investigación',
            'Facultad de Historia',
            'Edificio de Postgrado',
            'Entrada Principal',
        ];

        for ($i = 100; $i < 120; $i++) {
            Vmp::create([
                'code' => 'unimove-vmp-' . $i,
                'status' => 'available',
                'battery_level' => rand(30, 100),
                'price_per_minute' => 0.15,
                'unlock_price' => 0.50,
                'latitude' => $minLat + (rand(0, 40) / 10000),
                'longitude' => $minLon + (rand(0, 80) / 10000),
                'location_name' => $locations[$i - 100],
            ]);
        }
    }
}

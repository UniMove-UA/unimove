<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

class GtfsSeeder extends Seeder
{
    public function run(): void
    {
        Artisan::call('gtfs:import', ['prefix' => 'vec', 'folder' => 'datos_gtfs/vectalia'], $this->command->getOutput());
        Artisan::call('gtfs:import', ['prefix' => 'vec_sv', 'folder' => 'datos_gtfs/vectalia_sanvi'], $this->command->getOutput());
        Artisan::call('gtfs:import', ['prefix' => 'tram', 'folder' => 'datos_gtfs/tram'], $this->command->getOutput());
        Artisan::call('gtfs:import', ['prefix' => 'renfe', 'folder' => 'datos_gtfs/renfe'], $this->command->getOutput());
        Artisan::call('gtfs:import', ['prefix' => 'int', 'folder' => 'datos_gtfs/interurbano'], $this->command->getOutput());
    }
}

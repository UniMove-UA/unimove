<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class MigrateAll extends Command
{
    protected $signature = 'migrate:all {--seed} {--fresh}';
    protected $description = 'Migra todas las bases de datos';

    public function handle()
    {
        $fresh = $this->option('fresh') ? ':fresh' : '';

        $this->info('Migrando BD principal...');
        $this->call("migrate{$fresh}", array_filter([
            '--seed' => $this->option('seed'),
        ]));

        $this->info('Migrando BD GTFS...');
        $this->call("migrate{$fresh}", array_filter([
            '--database' => 'gtfs',
            '--path'     => 'database/migrations/gtfs',
        ]));

        if ($this->option('seed')) {
            $this->call('db:seed', [
                '--class' => 'GtfsSeeder',
            ]);
        }

        $this->info('Todas las migraciones completadas');
    }
}

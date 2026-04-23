<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class ImportGtfs extends Command
{
    /**
     * El nombre y firma del comando.
     */
    protected $signature = 'gtfs:import {prefix} {folder}';

    /**
     * Ejecutar el comando.
     */
    public function handle()
    {
        $prefix = $this->argument('prefix');
        $folder = base_path($this->argument('folder'));

        if (!File::exists($folder)) {
            $this->error("¡La carpeta {$folder} no existe!");
            return;
        }

        $filesToProcess = [
            'agency.txt' => 'agency',
            'feed_info.txt' => 'feed_info',
            'calendar.txt' => 'calendar',
            'calendar_dates.txt' => 'calendar_dates',
            'stops.txt' => 'stops',
            'routes.txt' => 'routes',
            'shapes.txt' => 'shapes',
            'trips.txt' => 'trips',
            'stop_times.txt' => 'stop_times',
            'transfers.txt' => 'transfers',
        ];

        DB::connection('gtfs')->statement('SET FOREIGN_KEY_CHECKS=0;');

        foreach ($filesToProcess as $file => $table) {
            $column = match($table) {
                'agency' => 'agency_id',
                'stops'  => 'stop_id',
                'routes' => 'route_id',
                'shapes' => 'shape_id',
                'calendar', 'calendar_dates' => 'service_id',
                'trips', 'stop_times' => 'trip_id',
                'transfers' => 'from_stop_id',
                default => null
            };

            if ($column && DB::connection('gtfs')->getSchemaBuilder()->hasTable($table)) {
                DB::connection('gtfs')->table($table)
                    ->where($column, 'LIKE', $prefix . '_%')
                    ->delete();
            }
        }

        foreach ($filesToProcess as $file => $table) {
            $filePath = $folder . '/' . $file;
            if (File::exists($filePath)) {
                $this->importFile($filePath, $table, $prefix . '_');
            }
        }

        DB::connection('gtfs')->statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    /**
     * Procesa e importa en chunks.
     */
    private function importFile($filePath, $table, $prefix)
    {
        $file = fopen($filePath, 'r');
        $headers = fgetcsv($file);

        if (!$headers) {
            fclose($file);
            return;
        }

        $headers = array_map(function($header) {
            return preg_replace('/[\x00-\x1F\x80-\xFF]/', '', trim($header));
        }, $headers);

        $chunk = [];
        $chunkSize = 1000;
        $count = 0;

        while (($row = fgetcsv($file)) !== false) {
            if (count($headers) !== count($row)) {
                continue;
            }
            $data = array_combine($headers, array_map('trim', $row));

            if (isset($data['route_long_name'])){
                $data['route_long_name'] = substr($data['route_long_name'], 0, 250);
            }
            if (isset($data['route_short_name'])) {
                $data['route_short_name'] = substr($data['route_short_name'], 0, 100);
            }
            if (isset($data['stop_name'])) {
                $data['stop_name'] = substr($data['stop_name'], 0, 250);
            }
            if (isset($data['trip_headsign'])) {
                $data['trip_headsign'] = substr($data['trip_headsign'], 0, 250);
            }

            $data = $this->applyPrefixes($table, $data, $prefix);

            $chunk[] = $data;
            $count++;

            if (count($chunk) === $chunkSize) {
                DB::connection('gtfs')->table($table)->insert($chunk);
                $chunk = [];
            }
        }

        if (!empty($chunk)) {
            DB::connection('gtfs')->table($table)->insert($chunk);
        }

        fclose($file);
    }

    /**
     * Añade el prefijo a todas las columnas
     */
    private function applyPrefixes($table, $data, $prefix)
    {
        $columnsToPrefix = [
            'agency_id', 'route_id', 'service_id', 'trip_id',
            'stop_id', 'shape_id', 'from_stop_id', 'to_stop_id',
            'from_route_id', 'to_route_id', 'from_trip_id', 'to_trip_id'
        ];

        foreach ($columnsToPrefix as $column) {
            if (isset($data[$column]) && $data[$column] !== '') {
                if (!str_starts_with($data[$column], $prefix)) {
                    $data[$column] = $prefix . $data[$column];
                }
            }
        }

        return $data;
    }
}

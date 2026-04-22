<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use ZipArchive;

class DownloadAllGtfs extends Command
{
    protected $signature = 'gtfs:download {--force : Fuerza la descarga y sobrescribe los archivos existentes}';

    protected $description = 'Descarga y extrae todos los datos GTFS del proyecto desde Google Drive';

    public function handle()
    {
        $datasets = [
            'renfe'=> '152Vv5m7S276Zs1IXUV6M14qdT2zO4kJx',
            'tram'=> '17sG3whpgkrEqw6CK_RhdzvTZDcefby8F',
            'vectalia'=> '1Y_uX23u1qVYoNJ2JPBAgRcHkVk3GcmyC',
            'vectalia_sanvi' => '1O2zdmGHypsDAZrwl9CNsj_vpf_hb3u9R',
            'interurbano'=> '1pqLxnSdF_emmREY631f4mFgExMwI3aec',
        ];

        $this->info("Iniciando la sincronización de " . count($datasets) . " paquetes GTFS...");
        $this->newLine();

        $force = $this->option('force');

        foreach ($datasets as $carpeta => $id) {
            $this->info("Procesando: [{$carpeta}]");

            $zipPath = storage_path("app/{$carpeta}_temp.zip");
            $extractPath = base_path("datos_gtfs/{$carpeta}");

            if (!$force && File::exists($extractPath . '/agency.txt')) {
                $this->line("  Los datos ya existen localmente. Saltando...");
                $this->newLine();
                continue;
            }

            $this->line("  -> Descargando archivo...");
            $success = $this->downloadFromDrive($id, $zipPath);

            if (!$success) {
                $this->error("  Falló la descarga de {$carpeta}.");
                $this->newLine();
                continue;
            }

            $this->line("  -> Descomprimiendo...");
            $zip = new ZipArchive;
            if ($zip->open($zipPath) === TRUE) {
                File::ensureDirectoryExists($extractPath);
                File::cleanDirectory($extractPath);

                $zip->extractTo($extractPath);
                $zip->close();

                unlink($zipPath);
                $this->info("  {$carpeta} listo y actualizado.");
            } else {
                $this->error("  Fallo al descomprimir el ZIP de {$carpeta}.");
            }

            $this->newLine();
        }

        $this->info('Proceso finalizado');
        return 0;
    }

    private function downloadFromDrive($id, $path)
    {
        $url = "https://drive.google.com/uc?export=download&id={$id}";

        $response = Http::timeout(600)->get($url);

        if (str_contains($response->body(), 'confirm=')) {
            preg_match('/confirm=([a-zA-Z0-9_]+)/', $response->body(), $matches);

            if (isset($matches[1])) {
                $confirmToken = $matches[1];
                $response = Http::timeout(600)->get($url . "&confirm=" . $confirmToken);
            }
        }

        if ($response->successful()) {
            File::put($path, $response->body());
            return true;
        }

        return false;
    }
}

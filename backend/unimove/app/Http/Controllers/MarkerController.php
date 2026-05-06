<?php

namespace App\Http\Controllers;

use App\Models\Stop;
use App\Models\Travel;
use App\Models\Vmp;
use Illuminate\Http\Request;

class MarkerController extends Controller
{
    public function index(Request $request)
    {
        $fromStr = $request->input('from');
        $toStr = $request->input('to');

        if (!$fromStr || !$toStr) {
            return response()->json(['error' => 'Faltan parámetros de límites (from y to)'], 400);
        }

        // 1. Parsear los strings "lat,lon"
        $fromParts = explode(',', $fromStr);
        $toParts = explode(',', $toStr);

        if (count($fromParts) !== 2 || count($toParts) !== 2) {
            return response()->json(['error' => 'Formato inválido para from o to. Debe ser "lat,lon"'], 400);
        }

        $fromLat = (float) $fromParts[0];
        $fromLon = (float) $fromParts[1];
        $toLat = (float) $toParts[0];
        $toLon = (float) $toParts[1];

        $minLat = min($fromLat, $toLat);
        $maxLat = max($fromLat, $toLat);
        $minLon = min($fromLon, $toLon);
        $maxLon = max($fromLon, $toLon);

        try {
            $stopsQuery = Stop::query();
            $stopsQuery->whereBetween('stop_lat', [$minLat, $maxLat]);
            $stopsQuery->whereBetween('stop_lon', [$minLon, $maxLon]);
            $stops = $stopsQuery->get()->map(fn($stop) => [
                'id'   => $stop->stop_id,
                'name' => $stop->stop_name,
                'type' => $this->getType($stop->stop_id),
                'lat'  => $stop->stop_lat,
                'lon'  => $stop->stop_lon,
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error fetching stops: ' . $e->getMessage());
            $stops = collect([]);
        }

        try {
            $travelsQuery = Travel::with('driver')
                ->where('status', 'active');

            $travelsQuery->whereBetween('latitud', [$minLat, $maxLat]);
        $travelsQuery->whereBetween('longitud', [$minLon, $maxLon]);

            $travels = $travelsQuery->get()->map(fn($t) => [
                'id'   => $t->id,
                'name' => $t->origin . ' → ' . $t->destination,
                'type' => 'coche',
                'lat'  => $t->latitud,
                'lon'  => $t->longitud,
            ]);
        } catch (\Exception $e) {
            $travels = collect([]);
        }

        try {
            $vmps = Vmp::where('status', 'available')
                ->whereNotNull('latitude')
                ->whereNotNull('longitude')
                ->get()
                ->map(fn($v) => [
                    'id'   => 'vmp_' . $v->id,
                    'name' => 'Patinete ' . $v->code,
                    'code' => $v->code,
                    'type' => 'vmp',
                    'lat'  => (float) $v->latitude,
                    'lon'  => (float) $v->longitude,
                ]);
        } catch (\Exception $e) {
            $vmps = collect([]);
        }

        return response()->json([
            'stops' => $stops->values(),
            'travels' => $travels->values(),
            'vmps' => $vmps->values(),
        ]);
    }

    private function getType(string $stopId): string
    {
        return match(true) {
            str_starts_with($stopId, 'tram_')  => 'tram',
            str_starts_with($stopId, 'renfe_') => 'tren',
            str_starts_with($stopId, 'vec_')   => 'bus',
            str_starts_with($stopId, 'sv_')    => 'bus',
            str_starts_with($stopId, 'int_')   => 'bus',
            default                            => 'bus',
        };
    }
}

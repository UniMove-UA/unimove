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
        $lat = $request->query('lat', 38.385);
        $lon = $request->query('lon', -0.513);
        $radius = 0.04; // Aprox 4-5km

        try {
            $stops = Stop::whereBetween('stop_lat', [$lat - $radius, $lat + $radius])
                ->whereBetween('stop_lon', [$lon - $radius, $lon + $radius])
                ->limit(300)
                ->get()
                ->map(fn($stop) => [
                'id'   => $stop->stop_id,
                'name' => $stop->stop_name,
                'type' => $this->getType($stop->stop_id),
                'lat'  => $stop->stop_lat,
                'lon'  => $stop->stop_lon,
            ]);
        } catch (\Exception $e) {
            $stops = collect([]);
        }

        try {
            $travels = Travel::with('driver')
                ->where('status', 'active')
                ->get()
                ->map(fn($t) => [
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
            str_starts_with($stopId, 'vec_')=> 'bus',
            str_starts_with($stopId, 'sv_')=> 'bus',
            str_starts_with($stopId, 'int_')=> 'bus',
            default=> 'bus',
        };
    }
}

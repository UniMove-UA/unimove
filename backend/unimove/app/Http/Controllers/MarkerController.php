<?php
namespace App\Http\Controllers;

use App\Models\Stop;
use App\Models\Travel;
use Illuminate\Http\Request;

class MarkerController extends Controller
{
    //GET /markers
    public function index()
    {
        $stops = Stop::all()->map(fn($stop) => [
            'id'   => $stop->stop_id,
            'name' => $stop->stop_name,
            'type' => $this->getType($stop->stop_id),
            'lat'  => $stop->stop_lat,
            'lon'  => $stop->stop_lon,
        ]);

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

        return response()->json([
            'stops' => $stops->values(),
            'travels' => $travels->values(),
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

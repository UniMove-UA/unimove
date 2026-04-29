<?php
namespace App\Http\Controllers;

use App\Models\Stop;
use App\Models\StopTime;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    // GET /schedule?id={id}
    public function index(Request $request)
    {
        $stop = Stop::find($request->id);

        if (!$stop) {
            return response()->json(['message' => 'Parada no encontrada'], 404);
        }

        $schedules = StopTime::with(['trayecto.ruta'])
            ->where('stop_id', $stop->stop_id)
            ->orderBy('departure_time', 'asc')
            ->get()
            ->groupBy(fn($st) => $st->trayecto->ruta->route_short_name
                ?? $st->trayecto->ruta->route_long_name
                ?? $st->trayecto->route_id)
            ->map(fn($group) => $group->first())
            ->values()
            ->map(fn($st) => [
                'route_id'       => $st->trayecto->ruta->route_id,
                'route_name'     => $st->trayecto->ruta->route_short_name ?? $st->trayecto->ruta->route_long_name,
                'headsign'       => $st->trayecto->trip_headsign,
                'departure_time' => $st->departure_time,
                'arrival_time'   => $st->arrival_time,
            ]);

        return response()->json($schedules);
    }
}

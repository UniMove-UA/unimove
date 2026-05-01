<?php
namespace App\Http\Controllers;

use App\Models\StopTime;
use Illuminate\Http\Request;

class StopTimeController extends Controller
{
    public function index(Request $request)
    {
        $sortable = ['trip_id','stop_id','stop_sequence','arrival_time','departure_time','timepoint'];
        $sort = in_array($request->sort, $sortable) ? $request->sort : 'trip_id';
        $dir  = $request->dir === 'desc' ? 'desc' : 'asc';

        $stopTimes = StopTime::with(['trayecto','parada'])
            ->when($request->search, fn($q) => $q
                ->where('trip_id', 'like', "%{$request->search}%")
                ->orWhere('stop_id','like', "%{$request->search}%")
            )
            ->orderBy($sort, $dir)
            ->paginate(25)
            ->withQueryString();

        return response()->json($stopTimes);
    }

    public function show(Request $request)
    {
        $stopTime = StopTime::where('trip_id', $request->trip_id)
            ->where('stop_sequence', $request->stop_sequence)
            ->firstOrFail();

        return response()->json($stopTime);
    }

    public function store(Request $request)
    {
        $request->validate([
            'trip_id'        => 'required|string|max:50|exists:gtfs.trips,trip_id',
            'arrival_time'   => 'required|string|max:20',
            'departure_time' => 'required|string|max:20',
            'stop_id'        => 'required|string|max:50|exists:gtfs.stops,stop_id',
            'stop_sequence'  => 'required|integer',
            'timepoint'      => 'nullable|integer|in:0,1',
        ]);

        $stopTime = StopTime::create($request->all());
        return response()->json(['message' => 'Tiempo de parada creado correctamente', 'data' => $stopTime], 201);
    }

    public function update(Request $request)
    {
        $request->validate([
            'trip_id'        => 'required|string|max:50|exists:gtfs.trips,trip_id',
            'arrival_time'   => 'required|string|max:20',
            'departure_time' => 'required|string|max:20',
            'stop_id'        => 'required|string|max:50|exists:gtfs.stops,stop_id',
            'stop_sequence'  => 'required|integer',
            'timepoint'      => 'nullable|integer|in:0,1',
        ]);

        $stopTime = StopTime::where('trip_id', $request->trip_id)
            ->where('stop_sequence', $request->stop_sequence)
            ->firstOrFail();
        $stopTime->update($request->all());

        return response()->json(['message' => 'Tiempo de parada actualizado correctamente', 'data' => $stopTime]);
    }

    public function destroy(Request $request)
    {
        StopTime::where('trip_id', $request->trip_id)
            ->where('stop_sequence', $request->stop_sequence)
            ->delete();

        return response()->json(['message' => 'Tiempo de parada eliminado correctamente']);
    }
}

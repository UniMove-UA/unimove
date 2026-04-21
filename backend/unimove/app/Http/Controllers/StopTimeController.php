<?php

namespace App\Http\Controllers;

use App\Models\StopTime;
use App\Models\Trip;
use App\Models\Stop;
use Illuminate\Http\Request;

class StopTimeController extends Controller
{
    public function index()
    {
        $stopTimes = StopTime::with(['trayecto', 'parada'])->get();
        return view('stop_time.index', compact('stopTimes'));
    }

    public function show(Request $request)
    {
        $stopTime = StopTime::where('trip_id', $request->trip_id)
            ->where('stop_sequence', $request->stop_sequence)
            ->firstOrFail();
        return view('stop_time.show', compact('stopTime'));
    }

    public function create()
    {
        $trips = Trip::all();
        $stops = Stop::all();
        return view('stop_time.create', compact('trips', 'stops'));
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

        StopTime::create($request->all());

        return redirect()->route('stop-time.index')->with('success', 'Tiempo de parada creado correctamente.');
    }

    public function edit(Request $request)
    {
        $stopTime = StopTime::where('trip_id', $request->trip_id)
            ->where('stop_sequence', $request->stop_sequence)
            ->firstOrFail();
        $trips = Trip::all();
        $stops = Stop::all();
        return view('stop_time.edit', compact('stopTime', 'trips', 'stops'));
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

        return redirect()->route('stop-time.index')->with('success', 'Tiempo de parada actualizado correctamente.');
    }

    public function destroy(Request $request)
    {
        StopTime::where('trip_id', $request->trip_id)
            ->where('stop_sequence', $request->stop_sequence)
            ->delete();

        return redirect()->route('stop-time.index')->with('success', 'Tiempo de parada eliminado correctamente.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\StopTime;
use App\Models\Trip;
use App\Models\Stop;
use Illuminate\Http\Request;

class StopTimeController extends Controller
{
    public function index(Request $request)
    {
        $sortable = ['trip_id', 'stop_id', 'stop_sequence', 'arrival_time', 'departure_time', 'timepoint'];
        $sort= in_array($request->sort, $sortable) ? $request->sort : 'trip_id';
        $dir= $request->dir === 'desc' ? 'desc' : 'asc';
        $search= $request->search;

        $stopTimes = StopTime::with(['trayecto', 'parada'])
            ->when($search, fn($q) => $q
                ->where('trip_id',  'like', "%$search%")
                ->orWhere('stop_id', 'like', "%$search%")
            )
            ->orderBy($sort, $dir)
            ->paginate(25)
            ->withQueryString();

        return view('stop_time.index', compact('stopTimes', 'sort', 'dir', 'search'));
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
        $trips = Trip::orderBy('trip_id')->get();
        $stops = Stop::orderBy('stop_name')->get();
        return view('stop_time.create', compact('trips', 'stops'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'trip_id'=> 'required|string|max:50|exists:gtfs.trips,trip_id',
            'arrival_time'=> 'required|string|max:20',
            'departure_time' => 'required|string|max:20',
            'stop_id'=> 'required|string|max:50|exists:gtfs.stops,stop_id',
            'stop_sequence'  => 'required|integer',
            'timepoint'=> 'nullable|integer|in:0,1',
        ]);

        StopTime::create($request->all());

        return redirect()->route('stop-time.index')->with('success', 'Tiempo de parada creado correctamente.');
    }

    public function edit(Request $request)
    {
        $stopTime = StopTime::where('trip_id', $request->trip_id)
            ->where('stop_sequence', $request->stop_sequence)
            ->firstOrFail();
        $trips = Trip::orderBy('trip_id')->get();
        $stops = Stop::orderBy('stop_name')->get();
        return view('stop_time.edit', compact('stopTime', 'trips', 'stops'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'trip_id'=> 'required|string|max:50|exists:gtfs.trips,trip_id',
            'arrival_time'=> 'required|string|max:20',
            'departure_time' => 'required|string|max:20',
            'stop_id'=> 'required|string|max:50|exists:gtfs.stops,stop_id',
            'stop_sequence'=> 'required|integer',
            'timepoint'=> 'nullable|integer|in:0,1',
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

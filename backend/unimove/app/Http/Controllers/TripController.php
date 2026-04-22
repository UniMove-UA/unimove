<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use App\Models\Route;
use App\Models\Calendar;
use App\Models\Shape;
use Illuminate\Http\Request;

class TripController extends Controller
{
    public function index(Request $request)
    {
        $sortable = ['trip_id', 'route_id', 'service_id', 'trip_headsign',
            'shape_id', 'wheelchair_accessible', 'block_id'];
        $sort= in_array($request->sort, $sortable) ? $request->sort : 'trip_id';
        $dir= $request->dir === 'desc' ? 'desc' : 'asc';
        $search= $request->search;

        $trips = Trip::with(['ruta', 'calendario'])
            ->when($search, fn($q) => $q
                ->where('trip_id',       'like', "%$search%")
                ->orWhere('route_id',     'like', "%$search%")
                ->orWhere('service_id',   'like', "%$search%")
                ->orWhere('trip_headsign', 'like', "%$search%")
                ->orWhere('shape_id',     'like', "%$search%")
                ->orWhere('block_id',     'like', "%$search%")
            )
            ->orderBy($sort, $dir)
            ->paginate(25)
            ->withQueryString();

        return view('trip.index', compact('trips', 'sort', 'dir', 'search'));
    }

    public function show(string $id)
    {
        $trip = Trip::with(['ruta', 'calendario', 'forma'])->findOrFail($id);
        return view('trip.show', compact('trip'));
    }

    public function create()
    {
        $routes= Route::orderBy('route_id')->get();
        $calendars = Calendar::orderBy('service_id')->get();
        $shapes= Shape::select('shape_id')->distinct()->orderBy('shape_id')->get();
        return view('trip.create', compact('routes', 'calendars', 'shapes'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'trip_id'=> 'required|string|max:50|unique:gtfs.trips,trip_id',
            'route_id'=> 'required|string|max:50|exists:gtfs.routes,route_id',
            'service_id'=> 'required|string|max:50|exists:gtfs.calendar,service_id',
            'trip_headsign'=> 'nullable|string',
            'shape_id'=> 'nullable|string|max:50',
            'wheelchair_accessible' => 'nullable|integer|in:0,1,2',
            'block_id'=> 'nullable|string|max:50',
        ]);

        Trip::create($request->all());

        return redirect()->route('trip.index')->with('success', 'Trayecto creado correctamente.');
    }

    public function edit(string $id)
    {
        $trip= Trip::findOrFail($id);
        $routes= Route::orderBy('route_id')->get();
        $calendars = Calendar::orderBy('service_id')->get();
        $shapes= Shape::select('shape_id')->distinct()->orderBy('shape_id')->get();
        return view('trip.edit', compact('trip', 'routes', 'calendars', 'shapes'));
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'route_id'=> 'required|string|max:50|exists:gtfs.routes,route_id',
            'service_id'=> 'required|string|max:50|exists:gtfs.calendar,service_id',
            'trip_headsign'=> 'nullable|string',
            'shape_id'=> 'nullable|string|max:50',
            'wheelchair_accessible' => 'nullable|integer|in:0,1,2',
            'block_id'=> 'nullable|string|max:50',
        ]);

        $trip = Trip::findOrFail($id);
        $trip->update($request->all());

        return redirect()->route('trip.index')->with('success', 'Trayecto actualizado correctamente.');
    }

    public function destroy(string $id)
    {
        $trip = Trip::findOrFail($id);
        $trip->delete();

        return redirect()->route('trip.index')->with('success', 'Trayecto eliminado correctamente.');
    }
}

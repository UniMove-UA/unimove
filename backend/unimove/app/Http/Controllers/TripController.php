<?php
namespace App\Http\Controllers;

use App\Models\Trip;
use Illuminate\Http\Request;

class TripController extends Controller
{
    public function index(Request $request)
    {
        $sortable = ['trip_id','route_id','service_id','trip_headsign','shape_id','wheelchair_accessible','block_id'];
        $sort = in_array($request->sort, $sortable) ? $request->sort : 'trip_id';
        $dir  = $request->dir === 'desc' ? 'desc' : 'asc';

        $trips = Trip::with(['ruta','calendario'])
            ->when($request->search, fn($q) => $q
                ->where('trip_id',       'like', "%{$request->search}%")
                ->orWhere('route_id',     'like', "%{$request->search}%")
                ->orWhere('service_id',   'like', "%{$request->search}%")
                ->orWhere('trip_headsign','like', "%{$request->search}%")
                ->orWhere('shape_id',     'like', "%{$request->search}%")
                ->orWhere('block_id',     'like', "%{$request->search}%")
            )
            ->orderBy($sort, $dir)
            ->paginate(25)
            ->withQueryString();

        return response()->json($trips);
    }

    public function show(string $id)
    {
        return response()->json(Trip::with(['ruta','calendario','forma'])->findOrFail($id));
    }

    public function store(Request $request)
    {
        $request->validate([
            'trip_id'               => 'required|string|max:50|unique:gtfs.trips,trip_id',
            'route_id'              => 'required|string|max:50|exists:gtfs.routes,route_id',
            'service_id'            => 'required|string|max:50|exists:gtfs.calendar,service_id',
            'trip_headsign'         => 'nullable|string',
            'shape_id'              => 'nullable|string|max:50',
            'wheelchair_accessible' => 'nullable|integer|in:0,1,2',
            'block_id'              => 'nullable|string|max:50',
        ]);

        $trip = Trip::create($request->all());
        return response()->json(['message' => 'Trayecto creado correctamente', 'data' => $trip], 201);
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'route_id'              => 'required|string|max:50|exists:gtfs.routes,route_id',
            'service_id'            => 'required|string|max:50|exists:gtfs.calendar,service_id',
            'trip_headsign'         => 'nullable|string',
            'shape_id'              => 'nullable|string|max:50',
            'wheelchair_accessible' => 'nullable|integer|in:0,1,2',
            'block_id'              => 'nullable|string|max:50',
        ]);

        $trip = Trip::findOrFail($id);
        $trip->update($request->all());

        return response()->json(['message' => 'Trayecto actualizado correctamente', 'data' => $trip]);
    }

    public function destroy(string $id)
    {
        Trip::findOrFail($id)->delete();
        return response()->json(['message' => 'Trayecto eliminado correctamente']);
    }
}

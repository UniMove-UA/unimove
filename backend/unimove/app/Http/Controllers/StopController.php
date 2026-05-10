<?php
namespace App\Http\Controllers;

use App\Models\Stop;
use Illuminate\Http\Request;

class StopController extends Controller
{
    public function index(Request $request)
    {
        $sortable = ['stop_id','stop_name','stop_lat','stop_lon','zone_id','wheelchair_boarding'];
        $sort = in_array($request->sort, $sortable) ? $request->sort : 'stop_id';
        $dir  = $request->dir === 'desc' ? 'desc' : 'asc';

        $stops = Stop::query()
            ->when($request->search, fn($q) => $q
                ->where('stop_id',  'like', "%{$request->search}%")
                ->orWhere('stop_name','like', "%{$request->search}%")
                ->orWhere('stop_code','like', "%{$request->search}%")
                ->orWhere('zone_id', 'like', "%{$request->search}%")
            )
            ->orderBy($sort, $dir)
            ->paginate(20)
            ->withQueryString();

        return response()->json($stops);
    }

    public function show(string $id)
    {
        return response()->json(Stop::findOrFail($id));
    }

    public function store(Request $request)
    {
        $request->validate([
            'stop_id'             => 'required|string|max:50|unique:gtfs.stops,stop_id',
            'stop_code'           => 'nullable|string|max:50',
            'stop_name'           => 'required|string|max:255',
            'stop_lat'            => 'required|numeric|between:-90,90',
            'stop_lon'            => 'required|numeric|between:-180,180',
            'zone_id'             => 'nullable|string|max:50',
            'wheelchair_boarding' => 'nullable|integer|in:0,1,2',
        ]);

        $stop = Stop::create($request->all());
        return response()->json(['message' => 'Parada creada correctamente', 'data' => $stop], 201);
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'stop_code'           => 'nullable|string|max:50',
            'stop_name'           => 'required|string|max:255',
            'stop_lat'            => 'required|numeric|between:-90,90',
            'stop_lon'            => 'required|numeric|between:-180,180',
            'zone_id'             => 'nullable|string|max:50',
            'wheelchair_boarding' => 'nullable|integer|in:0,1,2',
        ]);

        $stop = Stop::findOrFail($id);
        $stop->update($request->all());

        return response()->json(['message' => 'Parada actualizada correctamente', 'data' => $stop]);
    }

    public function destroy(string $id)
    {
        Stop::findOrFail($id)->delete();
        return response()->json(['message' => 'Parada eliminada correctamente']);
    }
}

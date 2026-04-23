<?php

namespace App\Http\Controllers;

use App\Models\Stop;
use Illuminate\Http\Request;

class StopController extends Controller
{
    public function index(Request $request)
    {
        $sortable = ['stop_id', 'stop_name', 'stop_lat', 'stop_lon', 'zone_id', 'wheelchair_boarding'];
        $sort= in_array($request->sort, $sortable) ? $request->sort : 'stop_id';
        $dir= $request->dir === 'desc' ? 'desc' : 'asc';
        $search= $request->search;

        $stops = Stop::query()
            ->when($search, fn($q) => $q
                ->where('stop_id',   'like', "%$search%")
                ->orWhere('stop_name', 'like', "%$search%")
                ->orWhere('stop_code', 'like', "%$search%")
                ->orWhere('zone_id',   'like', "%$search%")
            )
            ->orderBy($sort, $dir)
            ->paginate(20)
            ->withQueryString();

        return view('stop.index', compact('stops', 'sort', 'dir', 'search'));
    }

    public function show(string $id)
    {
        $stop = Stop::findOrFail($id);
        return view('stop.show', compact('stop'));
    }

    public function create()
    {
        return view('stop.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'stop_id'=> 'required|string|max:50|unique:gtfs.stops,stop_id',
            'stop_code'=> 'nullable|string|max:50',
            'stop_name'=> 'required|string|max:255',
            'stop_lat'=> 'required|numeric|between:-90,90',
            'stop_lon'=> 'required|numeric|between:-180,180',
            'zone_id'=> 'nullable|string|max:50',
            'wheelchair_boarding' => 'nullable|integer|in:0,1,2',
        ]);

        Stop::create($request->all());

        return redirect()->route('stop.index')->with('success', 'Parada creada correctamente.');
    }

    public function edit(string $id)
    {
        $stop = Stop::findOrFail($id);
        return view('stop.edit', compact('stop'));
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'stop_code'=> 'nullable|string|max:50',
            'stop_name'=> 'required|string|max:255',
            'stop_lat'=> 'required|numeric|between:-90,90',
            'stop_lon'=> 'required|numeric|between:-180,180',
            'zone_id'=> 'nullable|string|max:50',
            'wheelchair_boarding' => 'nullable|integer|in:0,1,2',
        ]);

        $stop = Stop::findOrFail($id);
        $stop->update($request->all());

        return redirect()->route('stop.index')->with('success', 'Parada actualizada correctamente.');
    }

    public function destroy(string $id)
    {
        $stop = Stop::findOrFail($id);
        $stop->delete();

        return redirect()->route('stop.index')->with('success', 'Parada eliminada correctamente.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Transfer;
use App\Models\Stop;
use App\Models\Route;
use App\Models\Trip;
use Illuminate\Http\Request;

class TransferController extends Controller
{
    public function index(Request $request)
    {
        $sortable = ['from_stop_id', 'to_stop_id', 'transfer_type', 'min_transfer_time',
            'from_route_id', 'to_route_id'];
        $sort= in_array($request->sort, $sortable) ? $request->sort : 'from_stop_id';
        $dir= $request->dir === 'desc' ? 'desc' : 'asc';
        $search= $request->search;

        $transfers = Transfer::with(['paradaOrigen', 'paradaDestino'])
            ->when($search, fn($q) => $q
                ->where('from_stop_id',  'like', "%$search%")
                ->orWhere('to_stop_id',   'like', "%$search%")
                ->orWhere('from_route_id', 'like', "%$search%")
                ->orWhere('to_route_id',   'like', "%$search%")
                ->orWhere('from_trip_id',  'like', "%$search%")
                ->orWhere('to_trip_id',    'like', "%$search%")
            )
            ->orderBy($sort, $dir)
            ->paginate(20)
            ->withQueryString();

        return view('transfer.index', compact('transfers', 'sort', 'dir', 'search'));
    }

    public function show(Request $request)
    {
        $transfer = Transfer::where('from_stop_id', $request->from_stop_id)
            ->where('to_stop_id', $request->to_stop_id)
            ->firstOrFail();
        return view('transfer.show', compact('transfer'));
    }

    public function create()
    {
        $stops  = Stop::orderBy('stop_name')->get();
        $routes = Route::orderBy('route_id')->get();
        $trips  = Trip::orderBy('trip_id')->get();
        return view('transfer.create', compact('stops', 'routes', 'trips'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'from_stop_id'=> 'required|string|max:50|exists:gtfs.stops,stop_id',
            'to_stop_id'=> 'required|string|max:50|exists:gtfs.stops,stop_id',
            'from_route_id'=> 'nullable|string|max:50|exists:gtfs.routes,route_id',
            'to_route_id'=> 'nullable|string|max:50|exists:gtfs.routes,route_id',
            'from_trip_id'=> 'nullable|string|max:50|exists:gtfs.trips,trip_id',
            'to_trip_id'=> 'nullable|string|max:50|exists:gtfs.trips,trip_id',
            'transfer_type'=> 'required|integer|in:0,1,2,3',
            'min_transfer_time' => 'nullable|integer|min:0',
        ]);

        Transfer::create($request->all());

        return redirect()->route('transfer.index')->with('success', 'Transferencia creada correctamente.');
    }

    public function edit(Request $request)
    {
        $transfer = Transfer::where('from_stop_id', $request->from_stop_id)
            ->where('to_stop_id', $request->to_stop_id)
            ->firstOrFail();
        $stops  = Stop::orderBy('stop_name')->get();
        $routes = Route::orderBy('route_id')->get();
        $trips  = Trip::orderBy('trip_id')->get();
        return view('transfer.edit', compact('transfer', 'stops', 'routes', 'trips'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'from_stop_id'=> 'required|string|max:50|exists:gtfs.stops,stop_id',
            'to_stop_id'=> 'required|string|max:50|exists:gtfs.stops,stop_id',
            'from_route_id'=> 'nullable|string|max:50|exists:gtfs.routes,route_id',
            'to_route_id'=> 'nullable|string|max:50|exists:gtfs.routes,route_id',
            'from_trip_id'=> 'nullable|string|max:50|exists:gtfs.trips,trip_id',
            'to_trip_id'=> 'nullable|string|max:50|exists:gtfs.trips,trip_id',
            'transfer_type'=> 'required|integer|in:0,1,2,3',
            'min_transfer_time' => 'nullable|integer|min:0',
        ]);

        $transfer = Transfer::where('from_stop_id', $request->from_stop_id)
            ->where('to_stop_id', $request->to_stop_id)
            ->firstOrFail();
        $transfer->update($request->all());

        return redirect()->route('transfer.index')->with('success', 'Transferencia actualizada correctamente.');
    }

    public function destroy(Request $request)
    {
        Transfer::where('from_stop_id', $request->from_stop_id)
            ->where('to_stop_id', $request->to_stop_id)
            ->delete();

        return redirect()->route('transfer.index')->with('success', 'Transferencia eliminada correctamente.');
    }
}

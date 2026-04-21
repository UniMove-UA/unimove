<?php

namespace App\Http\Controllers;

use App\Models\Transfer;
use App\Models\Stop;
use App\Models\Route;
use App\Models\Trip;
use Illuminate\Http\Request;

class TransferController extends Controller
{
    public function index()
    {
        $transfers = Transfer::with(['paradaOrigen', 'paradaDestino'])->get();
        return view('transfer.index', compact('transfers'));
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
        $stops  = Stop::all();
        $routes = Route::all();
        $trips  = Trip::all();
        return view('transfer.create', compact('stops', 'routes', 'trips'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'from_stop_id'      => 'required|string|max:50|exists:gtfs.stops,stop_id',
            'to_stop_id'        => 'required|string|max:50|exists:gtfs.stops,stop_id',
            'from_route_id'     => 'nullable|string|max:50|exists:gtfs.routes,route_id',
            'to_route_id'       => 'nullable|string|max:50|exists:gtfs.routes,route_id',
            'from_trip_id'      => 'nullable|string|max:50|exists:gtfs.trips,trip_id',
            'to_trip_id'        => 'nullable|string|max:50|exists:gtfs.trips,trip_id',
            'transfer_type'     => 'required|integer|in:0,1,2,3',
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
        $stops  = Stop::all();
        $routes = Route::all();
        $trips  = Trip::all();
        return view('transfer.edit', compact('transfer', 'stops', 'routes', 'trips'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'from_stop_id'      => 'required|string|max:50|exists:gtfs.stops,stop_id',
            'to_stop_id'        => 'required|string|max:50|exists:gtfs.stops,stop_id',
            'from_route_id'     => 'nullable|string|max:50|exists:gtfs.routes,route_id',
            'to_route_id'       => 'nullable|string|max:50|exists:gtfs.routes,route_id',
            'from_trip_id'      => 'nullable|string|max:50|exists:gtfs.trips,trip_id',
            'to_trip_id'        => 'nullable|string|max:50|exists:gtfs.trips,trip_id',
            'transfer_type'     => 'required|integer|in:0,1,2,3',
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

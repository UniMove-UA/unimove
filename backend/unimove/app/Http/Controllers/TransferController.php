<?php
namespace App\Http\Controllers;

use App\Models\Transfer;
use Illuminate\Http\Request;

class TransferController extends Controller
{
    public function index(Request $request)
    {
        $sortable = ['from_stop_id','to_stop_id','transfer_type','min_transfer_time','from_route_id','to_route_id'];
        $sort = in_array($request->sort, $sortable) ? $request->sort : 'from_stop_id';
        $dir  = $request->dir === 'desc' ? 'desc' : 'asc';

        $transfers = Transfer::with(['paradaOrigen','paradaDestino'])
            ->when($request->search, fn($q) => $q
                ->where('from_stop_id', 'like', "%{$request->search}%")
                ->orWhere('to_stop_id',   'like', "%{$request->search}%")
                ->orWhere('from_route_id','like', "%{$request->search}%")
                ->orWhere('to_route_id',  'like', "%{$request->search}%")
                ->orWhere('from_trip_id', 'like', "%{$request->search}%")
                ->orWhere('to_trip_id',   'like', "%{$request->search}%")
            )
            ->orderBy($sort, $dir)
            ->paginate(20)
            ->withQueryString();

        return response()->json($transfers);
    }

    public function show(Request $request)
    {
        $transfer = Transfer::where('from_stop_id', $request->from_stop_id)
            ->where('to_stop_id', $request->to_stop_id)
            ->firstOrFail();

        return response()->json($transfer);
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

        $transfer = Transfer::create($request->all());
        return response()->json(['message' => 'Transferencia creada correctamente', 'data' => $transfer], 201);
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

        return response()->json(['message' => 'Transferencia actualizada correctamente', 'data' => $transfer]);
    }

    public function destroy(Request $request)
    {
        Transfer::where('from_stop_id', $request->from_stop_id)
            ->where('to_stop_id', $request->to_stop_id)
            ->delete();

        return response()->json(['message' => 'Transferencia eliminada correctamente']);
    }
}

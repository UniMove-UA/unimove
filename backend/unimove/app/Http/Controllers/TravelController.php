<?php
namespace App\Http\Controllers;

use App\Models\Travel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class TravelController extends Controller
{
    //GET /travels?lat={lat}&lon={lon}&origin={origin}&destination={destination}&date={date}:
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'lat' => 'required|numeric|between:-90,90',
            'lon' => 'required|numeric|between:-180,180',
            'origin'      => 'nullable|string',
            'destination' => 'nullable|string',
            'date'        => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Parámetros de latitud o longitud inválidos',
                'errors'  => $validator->errors()
            ], 400);
        }

        $lat = $request->lat;
        $lon = $request->lon;

        $travels = Travel::with(['driver', 'vehicle'])
            ->where('status', 'active')
            ->whereRaw("(6371 * acos(cos(radians(?)) * cos(radians(latitud)) * cos(radians(longitud) - radians(?)) + sin(radians(?)) * sin(radians(latitud)))) < 20", [$lat, $lon, $lat])
            ->when($request->origin, fn($q) => $q->where('origin', 'like', "%{$request->origin}%"))
            ->when($request->destination, fn($q) => $q->where('destination', 'like', "%{$request->destination}%"))
            ->when($request->date, fn($q) => $q->whereDate('departure_time', $request->date))
            ->get()
            ->map(fn($t) => [
                'origin'=> $t->origin,
                'destination'=> $t->destination,
                'departure_time'=> $t->departure_time,
                'price'=> $t->price,
                'status'=> $t->status,
                'available_seats' => $t->available_seats,
                'driver'=> $t->driver->name,
            ]);

        return response()->json($travels);
    }

    // POST /travels
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'vehicle_id'      => 'required|exists:vehicles,id',
            'origin'          => 'required|string|max:255',
            'destination'     => 'required|string|max:255',
            'departure_time'  => 'required|date|after:now',
            'available_seats' => 'required|integer|min:1',
            'price'           => 'required|numeric|min:0',
            'lat'             => 'required|numeric|between:-90,90',
            'lon'             => 'required|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos de entrada inválidos',
                'errors'  => $validator->errors()
            ], 400);
        }

        $travel = Travel::create([
            'driver_id'       => Auth::id(),
            'vehicle_id'      => $request->vehicle_id,
            'origin'          => $request->origin,
            'destination'     => $request->destination,
            'departure_time'  => $request->departure_time,
            'available_seats' => $request->available_seats,
            'price'           => $request->price,
            'status'          => 'active',
            'latitud'         => $request->lat,
            'longitud'        => $request->lon,
        ]);

        return response()->json([
            'message' => 'Viaje creado correctamente',
            'data'    => $travel->load(['driver', 'vehicle']),
        ], 201);
    }

    public function show($id)
    {
        $travel = Travel::with(['driver', 'vehicle'])->findOrFail($id);
        return response()->json($travel);
    }

    public function myTravels()
    {
        $travels = Travel::with(['vehicle'])
            ->where('driver_id', Auth::id())
            ->orderBy('departure_time', 'desc')
            ->get();

        return response()->json($travels);
    }

    public function update(Request $request, $id)
    {
        $travel = Travel::findOrFail($id);

        if ($travel->driver_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $request->validate([
            'origin'          => 'string|max:255',
            'destination'     => 'string|max:255',
            'departure_time'  => 'date|after:now',
            'available_seats' => 'integer|min:1',
            'price'           => 'numeric|min:0',
            'status'          => 'in:active,completed,cancelled',
        ]);

        $travel->update($request->only([
            'origin', 'destination', 'departure_time',
            'available_seats', 'price', 'status'
        ]));

        return response()->json([
            'message' => 'Viaje actualizado correctamente',
            'data'    => $travel,
        ]);
    }

    public function destroy($id)
    {
        $travel = Travel::findOrFail($id);

        if ($travel->driver_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $travel->update(['status' => 'cancelled']);
        return response()->json(['message' => 'Viaje cancelado correctamente']);
    }

    public function indexAll(Request $request)
    {
        $sortable = ['departure_time', 'price', 'status', 'created_at'];
        $sort = in_array($request->sort, $sortable) ? $request->sort : 'departure_time';
        $dir = $request->dir === 'desc' ? 'desc' : 'asc';
        $search = $request->search;

        $travels = Travel::with(['driver', 'vehicle'])
            ->when($search, fn($q) => $q
                ->where('origin', 'like', "%$search%")
                ->orWhere('destination', 'like', "%$search%")
                ->orWhere('status', 'like', "%$search%")
            )
            ->orderBy($sort, $dir)
            ->paginate(20)
            ->withQueryString();

        return response()->json($travels);
    }

    public function adminDestroy($id)
    {
        Travel::findOrFail($id)->delete();
        return response()->json(['message' => 'Viaje eliminado correctamente']);
    }

    public function complete($id)
    {
        $travel = Travel::findOrFail($id);

        if ($travel->driver_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $travel->update(['status' => 'completed']);

        return response()->json(['message' => 'Viaje completado correctamente']);
    }
}

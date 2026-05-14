<?php
namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Notification;
use App\Models\Travel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class TravelController extends Controller
{
    // GET /travels/all
    public function all()
    {
        $travels = Travel::with(['driver', 'vehicle'])
            ->where('status', 'active')
            ->where('driver_id', '!=', Auth::id())
            ->orderBy('departure_time', 'asc')
            ->get()
            ->map(fn($t) => [
                'id'=> $t->id,
                'origin'=> $t->origin,
                'destination'=> $t->destination,
                'departure_time'  => $t->departure_time,
                'price'=> $t->price,
                'status'=> $t->status,
                'available_seats' => $t->available_seats,
                'driver' => [
                    'name'=> $t->driver->name,
                    'username' => $t->driver->username,
                    'image'=> $t->driver->image,
                ],
            ]);

        return response()->json($travels);
    }
    // GET /travels?lat={lat}&lon={lon}&origin={origin}&destination={destination}&date={date}
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'lat' => 'required|numeric|between:-90,90',
            'lon' => 'required|numeric|between:-180,180',
            'origin'=> 'nullable|string',
            'destination' => 'nullable|string',
            'date'=> 'nullable|date',
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
                'id'=> $t->id,
                'origin'=> $t->origin,
                'destination'=> $t->destination,
                'departure_time'  => $t->departure_time,
                'price'=> $t->price,
                'status'=> $t->status,
                'available_seats' => $t->available_seats,
                'driver' => [
                    'name'=> $t->driver->name,
                    'username' => $t->driver->username,
                    'image'=> $t->driver->image,
                ],
            ]);

        return response()->json($travels);
    }

    //POST /travels
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'vehicle_id'=> 'required|exists:vehicles,id',
            'origin'=> 'required|string|max:255',
            'destination'=> 'required|string|max:255',
            'departure_time'  => 'required|date|after:now',
            'available_seats' => 'required|integer|min:1',
            'price'=> 'required|numeric|min:0',
            'lat'=> 'required|numeric|between:-90,90',
            'lon'=> 'required|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos de entrada inválidos',
                'errors'  => $validator->errors()
            ], 400);
        }

        $travel = Travel::create([
            'driver_id'=> Auth::id(),
            'vehicle_id'=> $request->vehicle_id,
            'origin'=> $request->origin,
            'destination'=> $request->destination,
            'departure_time'  => $request->departure_time,
            'available_seats' => $request->available_seats,
            'price'=> $request->price,
            'status'=> 'active',
            'latitud'=> $request->lat,
            'longitud'=> $request->lon,
        ]);

        $travel->load(['driver', 'vehicle']);

        return response()->json([
            'message' => 'Viaje creado correctamente',
            'data'    => [
                'origin'=> $travel->origin,
                'destination'=> $travel->destination,
                'departure_time'  => $travel->departure_time,
                'price'=> $travel->price,
                'status'=> $travel->status,
                'available_seats' => $travel->available_seats,
                'driver' => [
                    'name'=> $travel->driver->name,
                    'username' => $travel->driver->username,
                    'image'=> $travel->driver->image,
                ],
                'vehicle' => [
                    'id'=> $travel->vehicle->id,
                    'brand' => $travel->vehicle->brand,
                    'model' => $travel->vehicle->model,
                    'plate' => $travel->vehicle->plate,
                ],
            ],
        ], 201);
    }

    //GET /travels/{id}
    public function show($id){
        $travel = Travel::with(['driver', 'vehicle'])->findOrFail($id);

        return response()->json([
            'origin'=> $travel->origin,
            'destination'=> $travel->destination,
            'departure_time'=> $travel->departure_time,
            'price'=> $travel->price,
            'status'=> $travel->status,
            'available_seats' => $travel->available_seats,
            'driver' => [
                'name'=> $travel->driver->name,
                'username'=> $travel->driver->username,
                'image'=> $travel->driver->image,
            ],
            'vehicle' => [
                'id'=> $travel->vehicle->id,
                'brand'=> $travel->vehicle->brand,
                'model'=> $travel->vehicle->model,
                'plate'=> $travel->vehicle->plate,
            ],
        ]);
    }

    // GET /travels/me
    public function myTravels()
    {
        $travels = Travel::with(['driver', 'vehicle'])
        ->where('driver_id', Auth::id())
            ->orderBy('departure_time', 'desc')
            ->get()
            ->map(fn($t) => [
                'id'             => $t->id,
                'origin'         => $t->origin,
                'destination'    => $t->destination,
                'departure_time' => $t->departure_time,
                'status'         => $t->status,
                'driver' => [
                    'name'     => $t->driver->name,
                    'username' => $t->driver->username,
                    'image'    => $t->driver->image,
                ],
                'vehicle' => [
                    'id'    => $t->vehicle->id,
                    'brand' => $t->vehicle->brand,
                    'model' => $t->vehicle->model,
                    'plate' => $t->vehicle->plate,
                ],
            ]);

        return response()->json($travels);
    }

    //PUT /travels/{id}
    public function update(Request $request, $id)
    {
        $travel=Travel::findOrFail($id);

        if ($travel->driver_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $request->validate([
            'origin'=> 'string|max:255',
            'destination'=> 'string|max:255',
            'departure_time'  => 'date|after:now',
            'available_seats' => 'integer|min:1',
            'price'=> 'numeric|min:0',
            'status'=> 'in:active,completed,cancelled',
        ]);

        $travel->update($request->only([
            'origin', 'destination', 'departure_time',
            'available_seats', 'price', 'status'
        ]));

        return response()->json([
            'message' => 'Viaje actualizado correctamente',
            'data'=> [
                'origin'=> $travel->origin,
                'destination'=> $travel->destination,
                'departure_time'  => $travel->departure_time,
                'price'=> $travel->price,
                'status'=> $travel->status,
                'available_seats' => $travel->available_seats,
            ],
        ]);
    }

    //DELETE /travels/{id}
    public function destroy($id)
    {
        $travel = Travel::findOrFail($id);

        if ($travel->driver_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $hasConfirmed = Booking::where('travel_id', $travel->id)
            ->where('status', 'confirmed')
            ->exists();

        if ($hasConfirmed) {
            return response()->json([
                'message' => 'No puedes cancelar el viaje porque tienes reservas confirmadas con pago realizado. Contacta con soporte si necesitas cancelarlo.'
            ], 422);
        }

        $bookings = Booking::where('travel_id', $travel->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->get();

        foreach ($bookings as $booking) {
            if ($booking->status === 'confirmed') {
                $travel->increment('available_seats');
            }
            $booking->update(['status' => 'cancelled']);

            Notification::create([
                'user_id' => $booking->passenger_id,
                'text'    => 'El viaje de ' . $travel->origin . ' a ' . $travel->destination . ' ha sido cancelado por el conductor',
                'read'    => false,
            ]);
        }

        $travel->update(['status' => 'cancelled']);
        return response()->json(['message' => 'Viaje cancelado correctamente']);
    }

    //PUT /travels/{id}/complete
    public function complete($id)
    {
        $travel = Travel::findOrFail($id);

        if ($travel->driver_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $bookings = Booking::where('travel_id', $travel->id)->get();

        foreach ($bookings as $booking) {
            if ($booking->status === 'confirmed') {
                $booking->update(['status' => 'completed']);
                Notification::create([
                    'user_id' => $booking->passenger_id,
                    'text'    => 'Tu viaje de ' . $travel->origin . ' a ' . $travel->destination . ' ha finalizado',
                    'read'    => false,
                ]);
            } elseif ($booking->status === 'pending') {
                $booking->update(['status' => 'cancelled']);
                Notification::create([
                    'user_id' => $booking->passenger_id,
                    'text'    => 'Tu reserva pendiente en el viaje de ' . $travel->origin . ' a ' . $travel->destination . ' ha sido cancelada porque el viaje ha finalizado',
                    'read'    => false,
                ]);
            }
        }

        $travel->update(['status' => 'completed']);

        return response()->json(['message' => 'Viaje completado correctamente']);
    }

    //GET /travels/near
    public function nearTravels(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'lat' => 'required|numeric|between:-90,90',
            'lon' => 'required|numeric|between:-180,180',
            'radius' => 'nullable|numeric|min:1|max:20000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Parámetros de latitud o longitud inválidos',
                'errors'  => $validator->errors()
            ], 400);
        }

        $lat = $request->lat;
        $lon = $request->lon;
        $radius = $request->radius ?? 20;

        $travels = Travel::with(['driver', 'vehicle'])
            ->where('status', 'active')
            ->whereRaw("(6371 * acos(cos(radians(?)) * cos(radians(latitud)) * cos(radians(longitud) - radians(?)) + sin(radians(?)) * sin(radians(latitud)))) < ?", [$lat, $lon, $lat, $radius])
            ->get()
            ->map(fn($t) => [
                'id'=> $t->id,
                'origin'=> $t->origin,
                'destination'=> $t->destination,
                'departure_time'  => $t->departure_time,
                'price'=> $t->price,
                'status'=> $t->status,
                'available_seats' => $t->available_seats,
                'driver' => [
                    'name'=> $t->driver->name,
                    'username' => $t->driver->username,
                    'image'=> $t->driver->image,
                ],
            ]);

        return response()->json($travels);
    }

    //GET /route
    public function route(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'from' => 'required|string',
            'to'   => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Parámetros inválidos',
                'errors'  => $validator->errors()
            ], 400);
        }

        $coords = explode(',', $request->from);

        if (count($coords) !== 2 || !is_numeric(trim($coords[0])) || !is_numeric(trim($coords[1]))) {
            return response()->json(['message' => 'Formato de coordenadas inválido. Usa from=lat,lon'], 400);
        }

        $lat = (float) trim($coords[0]);
        $lon = (float) trim($coords[1]);

        if ($lat < -90 || $lat > 90 || $lon < -180 || $lon > 180) {
            return response()->json(['message' => 'Parámetros de latitud o longitud inválidos'], 400);
        }

        $travels = Travel::with(['driver', 'vehicle'])
            ->where('status', 'active')
            ->where('destination', 'like', "%{$request->to}%")
            ->where('driver_id', '!=', Auth::id())
            ->whereRaw("(6371 * acos(cos(radians(?)) * cos(radians(latitud)) * cos(radians(longitud) - radians(?)) + sin(radians(?)) * sin(radians(latitud)))) < 20", [$lat, $lon, $lat])
            ->get()
            ->map(fn($t) => [
                'id'=> $t->id,
                'origin'=> $t->origin,
                'destination'=> $t->destination,
                'departure_time'  => $t->departure_time,
                'price'=> $t->price,
                'status'=> $t->status,
                'available_seats' => $t->available_seats,
                'driver' => [
                    'name'=> $t->driver->name,
                    'username' => $t->driver->username,
                    'image'=> $t->driver->image,
                ],
            ]);

        return response()->json($travels);
    }
}

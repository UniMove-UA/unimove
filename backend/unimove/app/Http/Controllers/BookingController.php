<?php
namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Notification;
use App\Models\Travel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    public function myBookings()
    {
        $bookings = Booking::with(['travel', 'travel.driver', 'travel.vehicle'])
            ->where('passenger_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($bookings);
    }

    public function store(Request $request)
    {
        $request->validate([
            'travel_id' => 'required|exists:travels,id',
        ]);

        $travel = Travel::findOrFail($request->travel_id);

        if ($travel->available_seats <= 0) {
            return response()->json(['message' => 'No hay plazas disponibles'], 400);
        }

        if ($travel->driver_id === Auth::id()) {
            return response()->json(['message' => 'No puedes reservar tu propio viaje'], 400);
        }

        $exists = Booking::where('travel_id', $request->travel_id)
            ->where('passenger_id', Auth::id())
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Ya tienes una reserva en este viaje'], 400);
        }

        $booking = Booking::create([
            'travel_id'    => $request->travel_id,
            'passenger_id' => Auth::id(),
            'status'       => 'pending',
        ]);

        $travel->decrement('available_seats');

        Notification::create([
            'user_id' => $travel->driver_id,
            'text'    => 'Tienes una nueva reserva en tu viaje de ' . $travel->origin . ' a ' . $travel->destination,
            'read'    => false,
        ]);

        return response()->json([
            'message' => 'Reserva creada correctamente',
            'data'    => $booking->load(['travel', 'passenger']),
        ], 201);
    }

    public function show($id)
    {
        $booking = Booking::with(['travel', 'passenger'])->findOrFail($id);

        if ($booking->passenger_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json($booking);
    }

    public function destroy($id)
    {
        $booking = Booking::findOrFail($id);

        if ($booking->passenger_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        if (in_array($booking->status, ['pending', 'confirmed'])) {
            $booking->travel->increment('available_seats');
        }

        $booking->update(['status' => 'cancelled']);
        return response()->json(['message' => 'Reserva cancelada correctamente']);
    }

    public function index(Request $request)
    {
        $sortable = ['status', 'created_at', 'travel_id', 'passenger_id'];
        $sort = in_array($request->sort, $sortable) ? $request->sort : 'created_at';
        $dir = $request->dir === 'desc' ? 'desc' : 'asc';
        $search = $request->search;

        $bookings = Booking::with(['travel', 'passenger'])
            ->when($search, fn($q) => $q->where('status', 'like', "%$search%"))
            ->orderBy($sort, $dir)
            ->paginate(20)
            ->withQueryString();

        return response()->json($bookings);
    }

    public function update(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        $request->validate([
            'status' => 'required|in:pending,confirmed,rejected,cancelled',
        ]);

        $booking->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Reserva actualizada correctamente',
            'data'    => $booking,
        ]);
    }

    public function adminDestroy($id)
    {
        Booking::findOrFail($id)->delete();
        return response()->json(['message' => 'Reserva eliminada correctamente']);
    }

    public function accept($id)
    {
        $booking = Booking::with('travel')->findOrFail($id);

        if ($booking->travel->driver_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $booking->update(['status' => 'confirmed']);

        Notification::create([
            'user_id' => $booking->passenger_id,
            'text'=> 'Tu reserva en el viaje de ' . $booking->travel->origin . ' a ' . $booking->travel->destination . ' ha sido aceptada',
            'read'=> false,
        ]);

        return response()->json(['message' => 'Reserva aceptada correctamente']);
    }

    public function reject($id)
    {
        $booking = Booking::with('travel')->findOrFail($id);

        if ($booking->travel->driver_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $booking->update(['status' => 'rejected']);
        $booking->travel->increment('available_seats');

        Notification::create([
            'user_id' => $booking->passenger_id,
            'text'=> 'Tu reserva en el viaje de ' . $booking->travel->origin . ' a ' . $booking->travel->destination . ' ha sido rechazada',
            'read'=> false,
        ]);

        return response()->json(['message' => 'Reserva rechazada correctamente']);
    }
}

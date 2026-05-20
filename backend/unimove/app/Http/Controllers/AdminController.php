<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Review;
use App\Models\Travel;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class AdminController extends Controller
{
    // ── Auth guard ────────────────────────────────────────────────────────────
    private function ensureAdmin()
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'admin') {
            abort(403, 'Acceso restringido a administradores');
        }
    }

    // ── Dashboard stats ───────────────────────────────────────────────────────
    public function stats()
    {
        $this->ensureAdmin();

        return response()->json([
            'users'    => User::count(),
            'travels'  => Travel::count(),
            'reviews'  => Review::count(),
            'active_travels' => Travel::where('status', 'active')->count(),
            'cancelled_travels' => Travel::where('status', 'cancelled')->count(),
            'completed_travels' => Travel::where('status', 'completed')->count(),
            'users_by_role' => [
                'admin'    => User::where('role', 'admin')->count(),
                'staff'    => User::where('role', 'staff')->count(),
                'student'  => User::where('role', 'student')->count(),
                'external' => User::where('role', 'external')->count(),
            ],
            'travels_by_month' => Travel::whereYear('created_at', date('Y'))
                ->get()
                ->groupBy(function($d) {
                    return \Carbon\Carbon::parse($d->created_at)->format('n');
                })
                ->map(function ($row) {
                    return $row->count();
                })->toArray(),
        ]);
    }

    // ── Users ─────────────────────────────────────────────────────────────────
    public function users(Request $request)
    {
        $this->ensureAdmin();

        $search = $request->search;
        $role   = $request->role;

        $users = User::when($search, fn($q) => $q
                ->where('name', 'like', "%$search%")
                ->orWhere('username', 'like', "%$search%")
                ->orWhere('email', 'like', "%$search%")
            )
            ->when($role && $role !== 'all', fn($q) => $q->where('role', $role))
            ->orderBy('created_at', 'desc')
            ->get(['id', 'name', 'username', 'email', 'role', 'is_university_member', 'created_at']);

        return response()->json($users);
    }

    public function createUser(Request $request)
    {
        $this->ensureAdmin();

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'email'    => 'required|string|email|unique:users',
            'password' => 'required|string|min:6',
            'role'     => 'required|in:admin,staff,student,external',
        ]);

        $validated['password'] = bcrypt($validated['password']);
        $validated['is_university_member'] = in_array($validated['role'], ['staff', 'student']);

        $user = User::create($validated);

        return response()->json(['message' => 'Usuario creado correctamente', 'user' => $user], 201);
    }

    public function deleteUser($id)
    {
        $this->ensureAdmin();

        $user = User::findOrFail($id);

        // No permitir que un admin se borre a sí mismo
        if ($user->id === Auth::id()) {
            return response()->json(['message' => 'No puedes eliminar tu propia cuenta'], 400);
        }

        $user->delete();
        return response()->json(['message' => 'Usuario eliminado correctamente']);
    }

    public function updateUserRole(Request $request, $id)
    {
        $this->ensureAdmin();

        $request->validate([
            'role' => 'required|in:admin,staff,student,external',
        ]);

        $user = User::findOrFail($id);

        // No cambiar rol del admin actual
        if ($user->id === Auth::id()) {
            return response()->json(['message' => 'No puedes cambiar tu propio rol'], 400);
        }

        $user->update(['role' => $request->role]);
        return response()->json(['message' => 'Rol actualizado correctamente', 'user' => $user]);
    }

    // ── Travels ───────────────────────────────────────────────────────────────
    public function travels(Request $request)
    {
        $this->ensureAdmin();

        $search = $request->search;
        $status = $request->status;

        $travels = Travel::with('driver:id,name,username')
            ->when($search, fn($q) => $q
                ->where('origin', 'like', "%$search%")
                ->orWhere('destination', 'like', "%$search%")
            )
            ->when($status && $status !== 'all', fn($q) => $q->where('status', $status))
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($travels);
    }

    public function deleteTravel($id)
    {
        $this->ensureAdmin();
        Travel::findOrFail($id)->delete();
        return response()->json(['message' => 'Trayecto eliminado correctamente']);
    }

    public function cancelTravel($id)
    {
        $this->ensureAdmin();
        $travel = Travel::findOrFail($id);
        $travel->update(['status' => 'cancelled']);
        return response()->json(['message' => 'Trayecto cancelado correctamente', 'travel' => $travel]);
    }

    // ── Reviews ───────────────────────────────────────────────────────────────
    public function reviews(Request $request)
    {
        $this->ensureAdmin();

        $search = $request->search;

        $reviews = Review::with([
                'author:id,name,username',
                'recipient:id,name,username',
            ])
            ->when($search, fn($q) => $q->where('comment', 'like', "%$search%"))
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reviews);
    }

    public function deleteReview($id)
    {
        $this->ensureAdmin();
        Review::findOrFail($id)->delete();
        return response()->json(['message' => 'Valoración eliminada correctamente']);
    }

    // ── Vehicles (admin) ───────────────────────────────────────────────────
    public function adminVehicles(Request $request)
    {
        $this->ensureAdmin();

        $search = $request->search;

        $vehicles = Vehicle::with('owner:id,name,username')
            ->when($search, fn($q) => $q
                ->where('brand', 'like', "%$search%")
                ->orWhere('model', 'like', "%$search%")
                ->orWhere('plate', 'like', "%$search%")
                ->orWhereHas('owner', fn($sq) => $sq->where('name', 'like', "%$search%")->orWhere('username', 'like', "%$search%"))
            )
            ->orderBy('brand')
            ->orderBy('model')
            ->get();

        return response()->json($vehicles);
    }

    public function adminDeleteVehicle($id)
    {
        $this->ensureAdmin();
        $vehicle = Vehicle::findOrFail($id);
        
        try {
            $vehicle->delete();
            return response()->json(['message' => 'Vehículo eliminado correctamente']);
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json(['message' => 'No se puede eliminar el vehículo porque tiene trayectos o reservas asociadas.'], 400);
        }
    }

    // ── Bookings ──────────────────────────────────────────────────────────────
    public function bookings(Request $request)
    {
        $this->ensureAdmin();

        $status = $request->status;
        $search = $request->search;

        $bookings = Booking::with(['travel:id,origin,destination,departure_time', 'passenger:id,name,username'])
            ->when($status && $status !== 'all', fn($q) => $q->where('status', $status))
            ->when($search, fn($q) => $q
                ->whereHas('passenger', fn($sq) => $sq->where('name', 'like', "%$search%")->orWhere('username', 'like', "%$search%"))
            )
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($bookings);
    }

    public function cancelBooking($id)
    {
        $this->ensureAdmin();

        $booking = Booking::with('travel')->findOrFail($id);

        if (in_array($booking->status, ['pending', 'confirmed'])) {
            $booking->travel->increment('available_seats');
        }

        $booking->update(['status' => 'cancelled']);

        // Notify passenger
        Notification::create([
            'user_id' => $booking->passenger_id,
            'text'    => 'Tu reserva ha sido cancelada por un administrador.',
            'read'    => false,
        ]);

        return response()->json(['message' => 'Reserva cancelada correctamente']);
    }

    // ── Notifications (admin send) ────────────────────────────────────────────
    public function adminNotifications(Request $request)
    {
        $this->ensureAdmin();

        $notifications = Notification::with('user:id,name,username')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($n) => [
                'id'         => $n->id,
                'text'       => $n->text,
                'read'       => $n->read,
                'created_at' => $n->created_at,
                'user'       => $n->user ? ['name' => $n->user->name, 'username' => $n->user->username] : null,
                'user_id'    => $n->user_id,
            ]);

        return response()->json($notifications);
    }

    public function sendNotification(Request $request)
    {
        $this->ensureAdmin();

        $request->validate([
            'text'    => 'required|string|max:500',
            'user_id' => 'nullable|exists:users,id',
        ]);

        if ($request->user_id) {
            // Send to a specific user
            $notif = Notification::create([
                'user_id' => $request->user_id,
                'text'    => $request->text,
                'read'    => false,
            ]);
            return response()->json(['message' => 'Notificación enviada', 'data' => $notif], 201);
        } else {
            // Broadcast to all non-admin users
            $users = User::where('role', '!=', 'admin')->pluck('id');
            foreach ($users as $uid) {
                Notification::create([
                    'user_id' => $uid,
                    'text'    => $request->text,
                    'read'    => false,
                ]);
            }
            return response()->json(['message' => 'Notificación enviada a todos los usuarios'], 201);
        }
    }

    public function deleteNotification($id)
    {
        $this->ensureAdmin();
        Notification::findOrFail($id)->delete();
        return response()->json(['message' => 'Notificación eliminada correctamente']);
    }

    // ── Payments & refunds ─────────────────────────────────────────────────
    public function getPayments()
    {
        $this->ensureAdmin();

        $payments = Payment::with([
                'user:id,name,username,email',
                'booking',
            ])
            ->orderByDesc('created_at')
            ->limit(200)
            ->get();

        // Keep local DB status in sync with Stripe when webhooks are not configured (common in local dev).
        $secret = config('services.stripe.secret') ?? env('STRIPE_SECRET');
        if (!empty($secret) && $payments->count() > 0) {
            try {
                Stripe::setApiKey($secret);

                foreach ($payments as $payment) {
                    if (empty($payment->payment_intent_id)) {
                        continue;
                    }

                    // Only sync statuses that are likely stale.
                    if (in_array($payment->status, ['succeeded', 'refunded', 'failed'], true)) {
                        continue;
                    }

                    try {
                        $pi = PaymentIntent::retrieve($payment->payment_intent_id);
                        $stripeStatus = $pi->status ?? null;
                        if ($stripeStatus && $stripeStatus !== $payment->status) {
                            $payment->status = $stripeStatus;
                            $payment->save();
                        }
                    } catch (\Exception $e) {
                        // Ignore per-payment sync failures; still return what we have.
                        Log::warning('Stripe status sync failed for payment_intent ' . $payment->payment_intent_id . ': ' . $e->getMessage());
                    }
                }

                // Refresh collection to include latest DB state
                $payments = Payment::with([
                        'user:id,name,username,email',
                        'booking',
                    ])
                    ->orderByDesc('created_at')
                    ->limit(200)
                    ->get();
            } catch (\Exception $e) {
                Log::warning('Stripe sync skipped: ' . $e->getMessage());
            }
        }

        return response()->json($payments);
    }

    public function refundPayment($id)
    {
        $this->ensureAdmin();

        $payment = Payment::find($id);
        if (!$payment) {
            return response()->json(['message' => 'Pago no encontrado'], 404);
        }

        $secret = config('services.stripe.secret') ?? env('STRIPE_SECRET');
        if (empty($secret)) {
            Log::error('Stripe secret key not configured');
            return response()->json(['message' => 'Pasarela de pago no configurada'], 500);
        }

        try {
            Stripe::setApiKey($secret);

            // If DB status is stale (e.g., webhooks not running), re-check with Stripe.
            if ($payment->status !== 'succeeded') {
                try {
                    $pi = PaymentIntent::retrieve($payment->payment_intent_id);
                    if (($pi->status ?? null) === 'succeeded') {
                        $payment->status = 'succeeded';
                        $payment->save();
                    }
                } catch (\Exception $e) {
                    Log::warning('Stripe status re-check failed: ' . $e->getMessage());
                }
            }

            if ($payment->status !== 'succeeded') {
                return response()->json(['message' => 'Solo se pueden reembolsar pagos en estado succeeded'], 422);
            }

            \Stripe\Refund::create([
                'payment_intent' => $payment->payment_intent_id,
            ]);

            $payment->status = 'refunded';
            $payment->save();

            return response()->json(['message' => 'Reembolso realizado correctamente', 'payment' => $payment]);
        } catch (\Exception $e) {
            Log::error('Stripe refund error: ' . $e->getMessage());
            return response()->json(['message' => 'No se pudo realizar el reembolso'], 500);
        }
    }

    // ── Schedules ─────────────────────────────────────────────────────────────
    public function schedules(Request $request)
    {
        $this->ensureAdmin();

        $stopTimes = \App\Models\StopTime::with(['trayecto.ruta', 'parada'])
            ->join('trips', 'stop_times.trip_id', '=', 'trips.trip_id')
            ->join('routes', 'trips.route_id', '=', 'routes.route_id')
            ->join('stops', 'stop_times.stop_id', '=', 'stops.stop_id')
            ->orderBy('routes.route_short_name')
            ->orderBy('stops.stop_name')
            ->select('stop_times.*')
            ->paginate(50);

        $stopTimes->getCollection()->transform(function ($st) {
            return [
                'trip_id' => $st->trip_id,
                'stop_id' => $st->stop_id,
                'stop_name' => $st->parada ? $st->parada->stop_name : 'Desconocida',
                'route_name' => $st->trayecto && $st->trayecto->ruta ? ($st->trayecto->ruta->route_short_name ?? $st->trayecto->ruta->route_long_name) : 'Ruta',
                'arrival_time' => $st->arrival_time,
                'departure_time' => $st->departure_time,
            ];
        });

        return response()->json($stopTimes);
    }

    public function updateSchedule(Request $request)
    {
        $this->ensureAdmin();

        $request->validate([
            'trip_id' => 'required|string',
            'stop_id' => 'required|string',
            'arrival_time' => 'required|string',
            'departure_time' => 'required|string',
        ]);

        \App\Models\StopTime::where('trip_id', $request->trip_id)
            ->where('stop_id', $request->stop_id)
            ->update([
                'arrival_time' => $request->arrival_time,
                'departure_time' => $request->departure_time,
            ]);

        return response()->json(['message' => 'Horario actualizado correctamente']);
    }
}

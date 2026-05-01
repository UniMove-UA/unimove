<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Travel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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

    // ── Schedules ─────────────────────────────────────────────────────────────
    public function schedules(Request $request)
    {
        $this->ensureAdmin();

        // Get 50 stop times for management purposes
        $stopTimes = \App\Models\StopTime::with(['trayecto.ruta', 'parada'])
            ->limit(50)
            ->get()
            ->map(function ($st) {
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

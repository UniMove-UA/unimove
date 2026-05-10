<?php

namespace App\Http\Controllers;

use App\Models\Vmp;
use App\Models\VmpRental;
use Illuminate\Http\Request;
use Carbon\Carbon;

class VmpController extends Controller
{
    public function rent(Request $request)
    {
        $request->validate([
            'code' => 'required|string'
        ]);

        $vmp = Vmp::where('code', $request->code)->first();

        if (!$vmp) {
            return response()->json(['message' => 'Patinete no encontrado.'], 404);
        }

        if ($vmp->status !== 'available') {
            return response()->json(['message' => 'El patinete no está disponible actualmente.'], 400);
        }

        $existingRental = VmpRental::where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->first();

        if ($existingRental) {
            return response()->json(['message' => 'Ya tienes un alquiler activo.'], 400);
        }

        // Crear el alquiler
        $rental = VmpRental::create([
            'user_id' => $request->user()->id,
            'vmp_id' => $vmp->id,
            'start_time' => Carbon::now(),
            'status' => 'active'
        ]);

        // Actualizar el patinete
        $vmp->update(['status' => 'in_use']);

        return response()->json([
            'message' => '¡Patinete desbloqueado exitosamente! ¡Buen viaje!',
            'rental' => $rental
        ]);
    }

    public function endRental(Request $request)
    {
        $rental = VmpRental::with('vmp')
            ->where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->first();

        if (!$rental) {
            return response()->json(['message' => 'No tienes ningún viaje activo.'], 404);
        }

        $endTime = Carbon::now();
        $durationInMinutes = $rental->start_time->diffInMinutes($endTime);
        
        $vmp = $rental->vmp;
        // Mínimo cobramos 1 minuto
        $minutesToCharge = max(1, $durationInMinutes);
        $totalCost = $minutesToCharge * $vmp->price_per_minute;

        $rental->update([
            'end_time' => $endTime,
            'status' => 'completed',
            'total_cost' => $totalCost
        ]);

        $vmp->update(['status' => 'available']);

        return response()->json([
            'message' => 'Viaje finalizado. Has usado el patinete durante ' . $durationInMinutes . ' min.',
            'duration' => $durationInMinutes,
            'cost' => $totalCost,
            'rental' => $rental
        ]);
    }

    public function currentRental(Request $request)
    {
        $rental = VmpRental::with('vmp')
            ->where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->first();

        return response()->json(['rental' => $rental]);
    }

    // List available vmps (simple index used by frontend)
    public function index(Request $request)
    {
        $vmps = Vmp::where('status', 'available')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get()
            ->map(fn($v) => [
                'id' => $v->id,
                'code' => $v->code,
                'type' => $v->type ?? 'scooter',
                'location_name' => $v->location_name,
                'lat' => (float)$v->latitude,
                'lon' => (float)$v->longitude,
                'price_per_minute' => $v->price_per_minute,
                'unlock_price' => max(0.50, (float)($v->unlock_price ?? $v->price_per_minute ?? 0.50)),
            ]);

        return response()->json(['vmps' => $vmps]);
    }

    // Show single vmp details
    public function show($id)
    {
        $v = Vmp::find($id);
        if (!$v) return response()->json(['error' => 'Not found'], 404);
        return response()->json([
            'id' => $v->id,
            'code' => $v->code,
            'type' => $v->type ?? 'scooter',
            'location_name' => $v->location_name,
            'price_per_minute' => $v->price_per_minute,
            'unlock_price' => max(0.50, (float)($v->unlock_price ?? $v->price_per_minute ?? 0.50)),
            'status' => $v->status,
        ]);
    }
}

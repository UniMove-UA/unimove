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
}

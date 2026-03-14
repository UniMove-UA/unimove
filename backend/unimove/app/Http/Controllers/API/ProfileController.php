<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        // Traemos el usuario autenticado
        // Si tienes relación con vehículos: $user = $request->user()->load('vehicle');
        //return response()->json($request->user());
        $user = \App\Models\User::first(); 

        return response()->json($user);
    }

    public function update(Request $request)
    {
        // 1. Buscamos al primer usuario de la base de datos
        $user = \App\Models\User::first();

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        // 2. Validamos (asegúrate de que los nombres coincidan con los de React)
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'phone' => 'nullable|string',
            'email' => 'required|string'
            // 'plate' => 'nullable|string', // Solo si 'plate' está en la tabla users
        ]);

        // 3. Actualizamos
        $user->update($validated);

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'user' => $user
        ]);
    }
}
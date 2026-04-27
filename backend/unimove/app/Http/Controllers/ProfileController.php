<?php

namespace app\Http\Controllers;

use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        // Traemos el usuario autenticado
        // Si tienes relación con vehículos: $user = $request->user()->load('vehicle');
        //return response()->json($request->user());
        $user = $request->user();

        return response()->json($user);
    }

    public function update(Request $request)
    {
        $user = \App\Models\User::first();

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string',
            'email' => 'required|string'
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'user' => $user
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string',
            'email' => 'required|string|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $validated['password'] = bcrypt($validated['password']);

        $user = \App\Models\User::create($validated);

        return response()->json([
            'message' => 'Perfil creado correctamente',
            'user' => $user
        ], 201);
    }

    public function destroy(Request $request)
    {
        $user = \App\Models\User::first();

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $user->delete();

        return response()->json([
            'message' => 'Perfil eliminado correctamente'
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\User;
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
        $user = User::first();

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

        $user = User::create($validated);

        return response()->json([
            'message' => 'Perfil creado correctamente',
            'user' => $user
        ], 201);
    }

    public function destroy(Request $request)
    {
        $user = User::first();

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $user->delete();

        return response()->json([
            'message' => 'Perfil eliminado correctamente'
        ]);
    }

    //GET /profile/me
    public function me(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 403);
        }

        return response()->json([
            'name'     => $user->name,
            'username' => $user->username,
            'email'    => $user->email,
            'image'    => $user->image,
            'role'     => $user->role,
        ], 200);
    }

    //GET /profile/@{usuario}
    public function showByUsername(string $username)
    {
        $user = User::where('username', $username)->first();

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        return response()->json([
            'name'     => $user->name,
            'username' => $user->username,
            'email'    => $user->email,
            'image'    => $user->image,
        ], 200);
    }

    //POST /profile/me?name={name},username={username},email={email},image={image}
    public function updateMe(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 403);
        }

        $validated = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'username' => 'sometimes|string|max:255|unique:users,username,' . $user->id,
            'email'    => 'sometimes|string|email|unique:users,email,' . $user->id,
            'image'    => 'sometimes|nullable|string',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'user'    => [
                'name'     => $user->name,
                'username' => $user->username,
                'email'    => $user->email,
                'image'    => $user->image,
            ],
        ], 200);
    }

    //GET /profile/@{usuario}/reviews
    public function reviewsByUsername(string $username)
    {
        $user = User::where('username', $username)->first();

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $reviews = Review::with('author')
            ->where('reviewee_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($r) => [
                'rating'  => $r->rating,
                'comment' => $r->comment,
                'author'  => $r->author->name,
            ]);

        return response()->json($reviews, 200);
    }
}

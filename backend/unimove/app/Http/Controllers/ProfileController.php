<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;

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

        $avgRating = Review::where('reviewee_id', $user->id)->avg('rating') ?? 0;

        return response()->json([
            'name'     => $user->name,
            'username' => $user->username,
            'email'    => $user->email,
            'image'    => $user->image,
            'role'     => $user->role,
            'rating'   => round($avgRating, 1)
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
            'image'    => 'sometimes|image|mimes:jpeg,png,jpg,gif,webp|max:2048', // 👈 ahora es archivo
        ]);

        if ($request->hasFile('image')) {
            // Borra la imagen anterior si existe
            if ($user->image) {
                Storage::disk('public')->delete($user->image);
            }
            $path = $request->file('image')->store('avatars', 'public');
            $user->image = $path;
        }

        if ($request->name) {
            $user->name= $request->name;
        }
        if ($request->username) {
            $user->username = $request->username;
        }
        if ($request->email) {
            $user->email= $request->email;
        }

        $user->save();
        $user->refresh();

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'user'    => [
                'name'     => $user->name,
                'username' => $user->username,
                'email'    => $user->email,
                'image'    => $user->image,
                'rating'   => $user->rating_avg,
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

    //PUT /profile/password
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 403);
        }

        $request->validate([
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Contraseña actualizada correctamente.'
        ], 200);
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function registro(Request $request)
    {
        // validar los datos
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400); //si falla la validacion se devuelve json con mensaje y codigo de error
        }

        // crear el usuario
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password), //para no guardar la contraseña en la base de datos (se deberá comporobar con Hash::check())
        ]);

        // generar el token, lo guarda en la tabla personal_access_tokens
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Usuario registrado correctamente',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer', //esto es para utilizar la auteticacion de Sanctum
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $loginField = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'name';

        $credentials = [
            $loginField => $request->login,
            'password' => $request->password,
        ];

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        $user = User::where($loginField, $request->login)->firstOrFail();

        // generar el token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Inicio de sesión exitoso',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function loginUniversitario(Request $request)
    {
        //validamos que sea un email real
        $request->validate(['email' => 'required|email']);

        //comprobación de dominio
        if (!str_ends_with($request->email, '@alu.ua.es')) {
            return response()->json(['message' => 'Solo se admiten correos @alu.ua.es'], 403);
        }

        //buscamos al usuario por su correo institucional
        $user = User::where('correo_institucional', $request->email)->first();

        if (!$user) {
            // si el usuario no existe, lo creamos sin pedir contraseña
            $user = User::create([
                'name' => explode('@', $request->email)[0], //nombre temporal
                'email' => $request->email, 
                'correo_institucional' => $request->email,
                'password' => Hash::make(Str::random(16)), //contraseña aleatoria que no usará
            ]);
        }

        // generamos el token de Sanctum para entrar
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Inicio institucional realizado con éxito',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }
}

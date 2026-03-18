<?php

use Illuminate\Http\Request;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/profile', [ProfileController::class, 'show']);
Route::post('/profile', [ProfileController::class, 'store']);
Route::put('/profile', [ProfileController::class, 'update']);
Route::delete('/profile', [ProfileController::class, 'destroy']);


//ruta para el registro de usuario
Route::post('/registro', [AuthController::class, 'registro']);

//ruta creada por laravel
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

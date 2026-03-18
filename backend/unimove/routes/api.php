<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\API\ProfileController;

//ruta para el registro de usuario
Route::post('/registro', [AuthController::class, 'registro']);


Route::get('/profile', [ProfileController::class, 'show']);
Route::post('/profile', [ProfileController::class, 'store']);
Route::put('/profile', [ProfileController::class, 'update']);
Route::delete('/profile', [ProfileController::class, 'destroy']);


//ruta de usuario para verificar tokens
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\MarkerController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use app\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\TravelController;
use App\Http\Controllers\VehicleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/profile/me', [ProfileController::class, 'me']);
    Route::post('/profile/me', [ProfileController::class, 'updateMe']);
    Route::get('/profile/@{username}', [ProfileController::class, 'showByUsername']);

    Route::get('/chats/me', [MessageController::class, 'myChats']);
    Route::get('/chats/@{username}', [MessageController::class, 'conversation']);
    Route::put('/chats/@{username}', [MessageController::class, 'sendMessage']);

    Route::get('/notifications', [NotificationController::class, 'myNotifications']);

    Route::get('/schedule', [ScheduleController::class, 'index']);

    Route::get('/markers', [MarkerController::class, 'index']);

    Route::get('/travels',[TravelController::class, 'index']);
    Route::post('/travels',[TravelController::class, 'store']);


    Route::get('/reviews/me', [ReviewController::class, 'myReviews']);
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);


    Route::get('/vehicles/me', [VehicleController::class, 'myVehicles']);
    Route::post('/vehicles', [VehicleController::class, 'store']);
    Route::get('/vehicles/{id}', [VehicleController::class, 'show']);
    Route::put('/vehicles/{id}', [VehicleController::class, 'update']);
    Route::delete('/vehicles/{id}', [VehicleController::class, 'destroy']);

});

//ruta para el registro de usuario
Route::post('/registro', [AuthController::class, 'registro']);

//ruta para inicio de sesión
Route::post('/login', [AuthController::class, 'login']);

//ruta para la autenticacion con correo institucional
Route::post('/auth/universidad', [AuthController::class, 'loginUniversitario']);

//ruta creada por laravel
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

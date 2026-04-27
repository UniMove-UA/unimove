<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use app\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\TravelController;
use App\Http\Controllers\VehicleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile/me', [ProfileController::class, 'me']);
    Route::post('/profile/me', [ProfileController::class, 'updateMe']);
    Route::get('/profile/@{username}', [ProfileController::class, 'showByUsername']);

    Route::get('/vehicles/me', [VehicleController::class, 'myVehicles']);
    Route::post('/vehicles', [VehicleController::class, 'store']);
    Route::get('/vehicles/{id}', [VehicleController::class, 'show']);
    Route::get('/vehicles/{id}/edit', [VehicleController::class, 'edit']);
    Route::put('/vehicles/{id}', [VehicleController::class, 'update']);
    Route::delete('/vehicles/{id}', [VehicleController::class, 'destroy']);

    Route::get('/bookings/me', [BookingController::class, 'myBookings']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);

    Route::get('/reviews/me', [ReviewController::class, 'myReviews']);
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::get('/reviews/{id}', [ReviewController::class, 'show']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

    Route::get('/travels', [TravelController::class, 'index']);
    Route::post('/travels', [TravelController::class, 'store']);
    Route::get('/travels/me', [TravelController::class, 'myTravels']);
    Route::get('/travels/{id}', [TravelController::class, 'show']);
    Route::put('/travels/{id}', [TravelController::class, 'update']);
    Route::delete('/travels/{id}', [TravelController::class, 'destroy']);

    Route::get('/chats/me', [MessageController::class, 'myChats']);
    Route::get('/chats/@{username}', [MessageController::class, 'conversation']);
    Route::put('/chats/@{username}', [MessageController::class, 'sendMessage']);
    Route::get('/notifications', [NotificationController::class, 'myNotifications']);

    //middleware para el admin
    Route::middleware('can:admin')->group(function () {
        Route::get('/admin/messages', [MessageController::class, 'index']);
        Route::get('/admin/messages/{id}', [MessageController::class, 'show']);
        Route::get('/admin/messages/{id}/edit', [MessageController::class, 'edit']);
        Route::put('/admin/messages/{id}', [MessageController::class, 'update']);
        Route::delete('/admin/messages/{id}', [MessageController::class, 'destroy']);

        Route::get('/admin/notifications', [NotificationController::class, 'index']);
        Route::get('/admin/notifications/{id}', [NotificationController::class, 'show']);
        Route::get('/admin/notifications/{id}/edit', [NotificationController::class, 'edit']);
        Route::put('/admin/notifications/{id}', [NotificationController::class, 'update']);
        Route::delete('/admin/notifications/{id}', [NotificationController::class, 'destroy']);

        Route::get('/admin/vehicles', [VehicleController::class, 'index']);
        Route::delete('/admin/vehicles/{id}', [VehicleController::class, 'destroy']);

        Route::get('/admin/bookings', [BookingController::class, 'index']);
        Route::put('/admin/bookings/{id}', [BookingController::class, 'update']);
        Route::delete('/admin/bookings/{id}', [BookingController::class, 'adminDestroy']);

        Route::get('/admin/reviews', [ReviewController::class, 'index']);
        Route::delete('/admin/reviews/{id}', [ReviewController::class, 'adminDestroy']);

        Route::get('/admin/travels', [TravelController::class, 'indexAll']);
        Route::delete('/admin/travels/{id}', [TravelController::class, 'adminDestroy']);
    });
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

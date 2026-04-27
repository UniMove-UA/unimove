<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use app\Http\Controllers\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'store']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::delete('/profile', [ProfileController::class, 'destroy']);

    Route::get('/chats/me', [MessageController::class, 'myChats']);
    Route::get('/chats/{email}', [MessageController::class, 'conversation']);
    Route::put('/chats/{email}', [MessageController::class, 'sendMessage']);
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

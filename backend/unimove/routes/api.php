<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\MarkerController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\TravelController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\VmpController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/profile/me', [ProfileController::class, 'me']);
    Route::put('/profile/me', [ProfileController::class, 'updateMe']);
    Route::get('/profile/@{username}', [ProfileController::class, 'showByUsername']);
    Route::get('/profile/@{username}/reviews', [ProfileController::class, 'reviewsByUsername']);

    Route::get('/chats/me', [MessageController::class, 'myChats']);
    Route::get('/chats/@{username}', [MessageController::class, 'conversation']);
    Route::put('/chats/@{username}', [MessageController::class, 'sendMessage']);

    Route::get('/notifications', [NotificationController::class, 'myNotifications']);
    Route::put('/notifications/read', [NotificationController::class, 'markAllRead']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markRead']);

    Route::get('/travels', [TravelController::class, 'index']);
    Route::post('/travels', [TravelController::class, 'store']);
    Route::get('/travels/me', [TravelController::class, 'myTravels']);
    Route::get('/travels/{id}', [TravelController::class, 'show']);
    Route::put('/travels/{id}', [TravelController::class, 'update']);
    Route::delete('/travels/{id}', [TravelController::class, 'destroy']);
    Route::put('/travels/{id}/complete', [TravelController::class, 'complete']);

    Route::get('/bookings/me', [BookingController::class, 'myBookings']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);
    Route::put('/bookings/{id}/accept', [BookingController::class, 'accept']);
    Route::put('/bookings/{id}/reject', [BookingController::class, 'reject']);

    Route::get('/reviews/me', [ReviewController::class, 'myReviews']);
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

    Route::get('/vehicles/me', [VehicleController::class, 'myVehicles']);
    Route::post('/vehicles', [VehicleController::class, 'store']);
    Route::get('/vehicles/{id}', [VehicleController::class, 'show']);
    Route::put('/vehicles/{id}', [VehicleController::class, 'update']);
    Route::delete('/vehicles/{id}', [VehicleController::class, 'destroy']);

    Route::get('/vmp/current', [VmpController::class, 'currentRental']);
    Route::post('/vmp/rent', [VmpController::class, 'rent']);
    Route::post('/vmp/end', [VmpController::class, 'endRental']);

    Route::post('/payments/create-intent', [PaymentController::class, 'createIntent']);

    Route::prefix('admin')->group(function () {
        Route::get('/stats',[AdminController::class, 'stats']);

        Route::get('/users',[AdminController::class, 'users']);
        Route::post('/users',[AdminController::class, 'createUser']);
        Route::delete('/users/{id}',[AdminController::class, 'deleteUser']);
        Route::put('/users/{id}/role', [AdminController::class, 'updateUserRole']);

        Route::get('/travels',[AdminController::class, 'travels']);
        Route::delete('/travels/{id}',[AdminController::class, 'deleteTravel']);
        Route::put('/travels/{id}/cancel',[AdminController::class, 'cancelTravel']);

        Route::get('/reviews',[AdminController::class, 'reviews']);
        Route::delete('/reviews/{id}',[AdminController::class, 'deleteReview']);

        Route::get('/schedules',[AdminController::class, 'schedules']);
        Route::put('/schedules',[AdminController::class, 'updateSchedule']);
    });
});

//ruta para el registro de usuario
Route::post('/registro', [AuthController::class, 'registro']);

//ruta para inicio de sesión
Route::post('/login', [AuthController::class, 'login']);

//ruta para la autenticacion con correo institucional
Route::post('/auth/universidad', [AuthController::class, 'loginUniversitario']);

Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password',  [AuthController::class, 'resetPassword']);

Route::get('/markers', [MarkerController::class, 'index']);
Route::get('/schedule', [ScheduleController::class, 'index']);

//ruta creada por laravel
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

//Stripe webhook
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);

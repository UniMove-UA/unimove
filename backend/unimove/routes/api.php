<?php

use Illuminate\Http\Request;
use App\Http\Controllers\API\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/profile', [ProfileController::class, 'show']);
Route::post('/profile', [ProfileController::class, 'store']);
Route::put('/profile', [ProfileController::class, 'update']);
Route::delete('/profile', [ProfileController::class, 'destroy']);

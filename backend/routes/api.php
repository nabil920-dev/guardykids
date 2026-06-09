<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChildController;
use App\Http\Controllers\NurseryController;
use App\Http\Controllers\ReservationController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Public nursery listing (no auth needed to browse)
Route::get('/nurseries',       [NurseryController::class, 'index']);
Route::get('/nurseries/{nursery}', [NurseryController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    [AuthController::class, 'me']);

    // Nursery management (owners + admin)
    Route::post('/nurseries',              [NurseryController::class, 'store'])->middleware('role:nursery_owner,admin');
    Route::put('/nurseries/{nursery}',     [NurseryController::class, 'update'])->middleware('role:nursery_owner,admin');
    Route::delete('/nurseries/{nursery}',  [NurseryController::class, 'destroy'])->middleware('role:nursery_owner,admin');
    Route::get('/my-nurseries',            [NurseryController::class, 'myNurseries'])->middleware('role:nursery_owner');

    // Children (parents only)
    Route::middleware('role:parent')->group(function () {
        Route::get('/children',              [ChildController::class, 'index']);
        Route::post('/children',             [ChildController::class, 'store']);
        Route::get('/children/{child}',      [ChildController::class, 'show']);
        Route::put('/children/{child}',      [ChildController::class, 'update']);
        Route::delete('/children/{child}',   [ChildController::class, 'destroy']);
    });

    // Reservations (parents, owners, admin)
    Route::get('/reservations',                [ReservationController::class, 'index']);
    Route::post('/reservations',               [ReservationController::class, 'store'])->middleware('role:parent');
    Route::get('/reservations/{reservation}',  [ReservationController::class, 'show']);
    Route::put('/reservations/{reservation}',  [ReservationController::class, 'update']);
    Route::delete('/reservations/{reservation}', [ReservationController::class, 'destroy']);

    // Admin routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard',                  [AdminController::class, 'dashboard']);
        Route::get('/users',                      [AdminController::class, 'users']);
        Route::delete('/users/{user}',            [AdminController::class, 'deleteUser']);
        Route::get('/nurseries',                  [AdminController::class, 'nurseries']);
        Route::put('/nurseries/{nursery}',        [AdminController::class, 'updateNursery']);
        Route::delete('/nurseries/{nursery}',     [AdminController::class, 'deleteNursery']);
        Route::get('/reservations',               [AdminController::class, 'reservations']);
    });
});

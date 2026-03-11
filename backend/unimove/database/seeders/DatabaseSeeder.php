<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Booking;
use App\Models\Review;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;   
use Illuminate\Support\Facades\Hash; 
use Carbon\Carbon;                   

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run()
    {
        // 1. USUARIOS
        DB::table('users')->insert([
            [
                'name' => 'Admin',
                'email' => 'admin',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'is_university_member' => true,
                'created_at' => Carbon::now(),
            ],
            [
                'name' => 'Carlos Conductor',
                'email' => 'carlos@alu.ua.es',
                'password' => Hash::make('carlos123'),
                'role' => 'student',
                'is_university_member' => true,
                'created_at' => Carbon::now(),
            ],
            [
                'name' => 'Lucia',
                'email' => 'lucia@alu.ua.es',
                'password' => Hash::make('lucia123'),
                'role' => 'student',
                'is_university_member' => true,
                'created_at' => Carbon::now(),
            ]
        ]);

        // 2. VEHÍCULOS
        DB::table('vehicles')->insert([
            'user_id' => 2,
            'brand' => 'Toyota',
            'model' => 'Corolla',
            'plate' => 'ABC-1234',
            'total_seats' => 4,
            'created_at' => Carbon::now(),
        ]);

        // 3. VIAJES
        DB::table('trips')->insert([
            'driver_id' => 2,
            'vehicle_id' => 1,
            'origin' => 'Plaza Central',
            'destination' => 'Campus Norte - Facultad Ingeniería',
            'departure_time' => Carbon::now()->addHours(2),
            'available_seats' => 3,
            'price' => 1.50,
            'status' => 'active',
            'created_at' => Carbon::now(),
        ]);

        // 4. RESERVAS
        DB::table('bookings')->insert([
            'trip_id' => 1,
            'passenger_id' => 3,
            'status' => 'confirmed',
            'created_at' => Carbon::now(),
        ]);
    }
}

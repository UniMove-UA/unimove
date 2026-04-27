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
        DB::table('users')->insert([
            [
                'name' => 'Admin',
                'email' => 'admin@gmail.com',
                'correo_institucional' => null,
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'is_university_member' => false,
                'created_at' => Carbon::now(),
            ],
            [
                'name' => 'Carlos',
                'email' => 'carlos@alu.ua.es',
                'correo_institucional' => 'carlos@alu.ua.es',
                'password' => Hash::make('carlos123'),
                'role' => 'student',
                'is_university_member' => true,
                'created_at' => Carbon::now(),
            ],
            [
                'name' => 'Lucia',
                'email' => 'lucia@alu.ua.es',
                'correo_institucional' => 'lucia@alu.ua.es',
                'password' => Hash::make('lucia123'),
                'role' => 'student',
                'is_university_member' => true,
                'created_at' => Carbon::now(),
            ],
            [
                'name' => 'Pedro',
                'email' => 'pedro@gmail.com',
                'correo_institucional' => null,
                'password' => Hash::make('pedro123'),
                'role' => 'external',
                'is_university_member' => false,
                'created_at' => Carbon::now(),
            ],
            [
                'name' => 'Maria',
                'email' => 'maria@ua.es',
                'correo_institucional' => 'maria@ua.es',
                'password' => Hash::make('maria123'),
                'role' => 'staff',
                'is_university_member' => true,
                'created_at' => Carbon::now(),
            ],
        ]);

        DB::table('vehicles')->insert([
            [
                'user_id' => 2,
                'brand' => 'Toyota',
                'model' => 'Corolla',
                'plate' => 'ABC-1234',
                'total_seats' => 4,
                'created_at' => Carbon::now(),
            ],
            [
                'user_id' => 2,
                'brand' => 'Seat',
                'model' => 'Ibiza',
                'plate' => 'XYZ-5678',
                'total_seats' => 3,
                'created_at' => Carbon::now(),
            ],
        ]);

        DB::table('travels')->insert([
            [
                'driver_id' => 2,
                'vehicle_id' => 1,
                'origin' => 'Plaza del Ayuntamiento, Alicante',
                'destination' => 'Campus de la UA, San Vicente',
                'departure_time' => Carbon::now()->addHours(2),
                'available_seats' => 3,
                'price' => 1.50,
                'status' => 'active',
                'latitud' => 38.3452,
                'longitud' => -0.4815,
                'created_at' => Carbon::now(),
            ],
            [
                'driver_id' => 2,
                'vehicle_id' => 2,
                'origin' => 'Mercado Central, Alicante',
                'destination' => 'Campus de la UA, San Vicente',
                'departure_time' => Carbon::now()->addDays(1),
                'available_seats' => 2,
                'price' => 1.00,
                'status' => 'active',
                'latitud' => 38.3446,
                'longitud' => -0.4762,
                'created_at' => Carbon::now(),
            ],
            [
                'driver_id' => 5,
                'vehicle_id' => 1,
                'origin' => 'Albufereta, Alicante',
                'destination' => 'Campus de la UA, San Vicente',
                'departure_time' => Carbon::now()->subDays(1),
                'available_seats' => 0,
                'price' => 2.00,
                'status' => 'completed',
                'latitud' => 38.3601,
                'longitud' => -0.4623,
                'created_at' => Carbon::now(),
            ],
        ]);

        DB::table('bookings')->insert([
            [
                'travel_id' => 1,
                'passenger_id' => 3,
                'status' => 'confirmed',
                'created_at' => Carbon::now(),
            ],
            [
                'travel_id' => 1,
                'passenger_id' => 4,
                'status' => 'pending',
                'created_at' => Carbon::now(),
            ],
            [
                'travel_id' => 2,
                'passenger_id' => 3,
                'status' => 'cancelled',
                'created_at' => Carbon::now(),
            ],
        ]);

        DB::table('reviews')->insert([
            [
                'travel_id' => 3,
                'reviewer_id' => 3,
                'reviewee_id' => 2,
                'rating' => 5,
                'comment' => 'Muy buen conductor, puntual y amable.',
                'created_at' => Carbon::now(),
            ],
            [
                'travel_id' => 3,
                'reviewer_id' => 2,
                'reviewee_id' => 3,
                'rating' => 4,
                'comment' => 'Buen pasajero, sin problemas.',
                'created_at' => Carbon::now(),
            ],
        ]);

        DB::table('messages')->insert([
            [
                'emisor_id' => 3,
                'receptor_id' => 2,
                'text' => '¿A qué hora sales exactamente?',
                'url' => null,
                'created_at' => Carbon::now()->subMinutes(30),
            ],
            [
                'emisor_id' => 2,
                'receptor_id' => 3,
                'text' => 'Salgo a las 8:00 desde la Plaza.',
                'url' => null,
                'created_at' => Carbon::now()->subMinutes(25),
            ],
        ]);

        DB::table('notifications')->insert([
            [
                'user_id' => 3,
                'text' => 'Tu reserva ha sido confirmada.',
                'read' => false,
                'created_at' => Carbon::now(),
            ],
            [
                'user_id' => 4,
                'text' => 'Tienes una nueva solicitud de reserva.',
                'read' => false,
                'created_at' => Carbon::now(),
            ],
            [
                'user_id' => 2,
                'text' => 'Lucia ha cancelado su reserva.',
                'read' => true,
                'created_at' => Carbon::now(),
            ],
        ]);
    }
}

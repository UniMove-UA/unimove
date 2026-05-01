<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vmps', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); 
            $table->string('status')->default('available'); // available, in_use, maintenance
            $table->decimal('battery_level', 5, 2)->default(100);
            $table->decimal('price_per_minute', 8, 2)->default(0.15);
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vmps');
    }
};

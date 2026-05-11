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
        Schema::table('vmps', function (Blueprint $table) {
            $table->string('type')->default('scooter')->after('code');
            $table->string('location_name')->nullable()->after('type');
            $table->decimal('unlock_price', 8, 2)->default(0.50)->after('price_per_minute');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vmps', function (Blueprint $table) {
            $table->dropColumn(['type', 'location_name', 'unlock_price']);
        });
    }
};

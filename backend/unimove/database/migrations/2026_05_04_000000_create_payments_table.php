<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_intent_id')->unique();
            $table->unsignedBigInteger('booking_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->integer('amount'); // cents
            $table->string('currency', 10)->default('eur');
            $table->string('status')->default('pending');
            $table->json('metadata')->nullable();
            $table->timestamps();

            // Optionally add foreign keys if tables exist
            // $table->foreign('booking_id')->references('id')->on('bookings')->onDelete('set null');
            // $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('payments');
    }
};

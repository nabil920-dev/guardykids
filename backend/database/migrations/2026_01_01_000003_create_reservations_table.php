<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('nursery_id')->constrained('nurseries')->onDelete('cascade');
            $table->foreignId('child_id')->constrained('children')->onDelete('cascade');
            $table->date('reservation_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->decimal('duration_hours', 5, 2);
            $table->decimal('total_price', 8, 2);
            $table->enum('status', ['pending', 'confirmed', 'rejected', 'cancelled'])->default('pending');
            $table->enum('payment_status', ['unpaid', 'paid'])->default('unpaid');
            $table->string('payment_reference')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};

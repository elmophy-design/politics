<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->nullable()->constrained()->nullOnDelete();
            $table->string('donor_name')->nullable();
            $table->string('donor_email')->nullable();
            $table->string('donor_phone', 20)->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->decimal('amount', 14, 2);
            $table->string('currency', 3)->default('NGN');
            $table->enum('gateway', ['paystack', 'flutterwave', 'bank_transfer']);
            $table->string('reference')->unique();
            $table->enum('status', ['pending', 'successful', 'failed', 'refunded'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'campaign_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('constituencies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('state_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('code', 30)->nullable()->unique();
            $table->enum('type', ['federal', 'state', 'senatorial', 'lga', 'other'])->default('federal');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::table('wards', function (Blueprint $table) {
            $table->foreignId('constituency_id')
                ->nullable()
                ->after('lga_id')
                ->constrained()
                ->nullOnDelete();
            $table->index('constituency_id');
        });
    }

    public function down(): void
    {
        Schema::table('wards', function (Blueprint $table) {
            $table->dropConstrainedForeignId('constituency_id');
        });
        Schema::dropIfExists('constituencies');
    }
};

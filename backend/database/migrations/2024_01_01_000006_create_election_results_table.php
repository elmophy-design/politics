<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('election_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('polling_unit_id')->constrained()->cascadeOnDelete();
            $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('party_agent_name')->nullable();
            $table->json('party_votes');
            $table->integer('total_accredited_voters')->nullable();
            $table->integer('total_votes_cast')->nullable();
            $table->string('result_sheet_image')->nullable();
            $table->enum('status', ['pending', 'verified', 'flagged', 'rejected'])->default('pending');
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            $table->index(['polling_unit_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('election_results');
    }
};

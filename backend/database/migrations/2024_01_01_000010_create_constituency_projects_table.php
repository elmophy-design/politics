<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('constituency_projects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->foreignId('ward_id')->nullable()->constrained()->nullOnDelete();
            $table->string('community')->nullable();
            $table->string('project_type');
            $table->decimal('budget', 16, 2)->nullable();
            $table->string('contractor')->nullable();
            $table->unsignedTinyInteger('progress_percentage')->default(0);
            $table->enum('status', ['planned', 'ongoing', 'completed', 'stalled'])->default('planned');
            $table->text('description')->nullable();
            $table->json('photo_gallery')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('constituency_projects');
    }
};

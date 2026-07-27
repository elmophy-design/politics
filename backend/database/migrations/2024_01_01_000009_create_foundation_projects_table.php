<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('foundation_projects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->enum('category', ['project', 'scholarship', 'empowerment', 'medical_outreach'])->default('project');
            $table->text('summary')->nullable();
            $table->longText('description')->nullable();
            $table->string('cover_image')->nullable();
            $table->foreignId('ward_id')->nullable()->constrained()->nullOnDelete();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->enum('status', ['planned', 'ongoing', 'completed'])->default('planned');
            $table->timestamps();
        });

        Schema::create('foundation_beneficiaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('foundation_project_id')->constrained()->cascadeOnDelete();
            $table->string('full_name');
            $table->string('phone', 20)->nullable();
            $table->foreignId('ward_id')->nullable()->constrained()->nullOnDelete();
            $table->text('story')->nullable();
            $table->boolean('is_success_story')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('foundation_beneficiaries');
        Schema::dropIfExists('foundation_projects');
    }
};

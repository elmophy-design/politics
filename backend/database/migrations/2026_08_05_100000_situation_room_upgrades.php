<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('election_result_audits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('election_result_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action', 40); // submitted|verified|flagged|rejected|updated
            $table->string('from_status', 20)->nullable();
            $table->string('to_status', 20)->nullable();
            $table->text('note')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['election_result_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
        });

        Schema::table('wards', function (Blueprint $table) {
            if (! Schema::hasColumn('wards', 'geojson')) {
                $table->json('geojson')->nullable()->after('code');
            }
            if (! Schema::hasColumn('wards', 'center_lat')) {
                $table->decimal('center_lat', 10, 7)->nullable()->after('geojson');
            }
            if (! Schema::hasColumn('wards', 'center_lng')) {
                $table->decimal('center_lng', 10, 7)->nullable()->after('center_lat');
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('election_result_audits');
        Schema::table('wards', function (Blueprint $table) {
            foreach (['geojson', 'center_lat', 'center_lng'] as $col) {
                if (Schema::hasColumn('wards', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};

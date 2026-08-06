<?php

namespace App\Console\Commands;

use App\Models\Lga;
use App\Models\Ward;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Loads Edo State LGA polygons from database/data/edo_lgas.geojson
 * and attaches them to matching wards (by LGA name) so the live map
 * works without manual JSON upload.
 *
 *   php artisan situation-room:seed-edo-geo
 *   php artisan situation-room:seed-edo-geo --force
 */
class SeedEdoGeoJson extends Command
{
    protected $signature = 'situation-room:seed-edo-geo
                            {--force : Overwrite existing ward geojson}
                            {--path= : Optional path to FeatureCollection geojson}';

    protected $description = 'Seed Edo LGA GeoJSON onto wards (auto-match by LGA name)';

    public function handle(): int
    {
        if (! Schema::hasColumn('wards', 'geojson')) {
            $this->error('wards.geojson column missing — run migrations first.');

            return self::FAILURE;
        }

        $path = $this->option('path')
            ?: database_path('data/edo_lgas.geojson');

        if (! is_file($path)) {
            $this->error("GeoJSON not found: {$path}");

            return self::FAILURE;
        }

        $fc = json_decode(file_get_contents($path), true);
        if (($fc['type'] ?? '') !== 'FeatureCollection' || empty($fc['features'])) {
            $this->error('Invalid FeatureCollection.');

            return self::FAILURE;
        }

        $force = (bool) $this->option('force');
        $updated = 0;
        $skipped = 0;
        $unmatched = [];

        foreach ($fc['features'] as $feature) {
            $props = $feature['properties'] ?? [];
            $name = $props['name'] ?? $props['lga'] ?? null;
            $geom = $feature['geometry'] ?? null;
            if (! $name || ! $geom) {
                continue;
            }

            $lga = $this->findLga($name);
            if (! $lga) {
                $unmatched[] = $name;
                continue;
            }

            $wards = Ward::where('lga_id', $lga->id)->get();
            if ($wards->isEmpty()) {
                // Create a map-only ward so the polygon still appears on the live map
                $wards = collect([
                    Ward::create([
                        'lga_id' => $lga->id,
                        'name' => $name.' (Map)',
                        'code' => 'MAP-'.strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $name), 0, 6)),
                    ]),
                ]);
                $this->line("  created map ward for LGA {$name}");
            }

            foreach ($wards as $ward) {
                if (! $force && ! empty($ward->geojson)) {
                    $skipped++;
                    continue;
                }

                $ward->update([
                    'geojson' => $geom,
                    'center_lat' => $props['center_lat'] ?? $ward->center_lat,
                    'center_lng' => $props['center_lng'] ?? $ward->center_lng,
                ]);
                $updated++;
            }
        }

        $this->info("Updated wards with GeoJSON: {$updated}");
        if ($skipped) {
            $this->comment("Skipped (already set, use --force): {$skipped}");
        }
        if ($unmatched) {
            $this->warn('No LGA row matched (create LGAs first): '.implode(', ', $unmatched));
        }

        $this->info('Done. Live map: GET /api/situation-room/map.geojson');

        return self::SUCCESS;
    }

    private function findLga(string $name): ?Lga
    {
        $norm = $this->norm($name);

        $lgas = Lga::query()->get();
        foreach ($lgas as $lga) {
            if ($this->norm($lga->name) === $norm) {
                return $lga;
            }
        }

        // Fuzzy: strip common variants
        foreach ($lgas as $lga) {
            if (str_contains($this->norm($lga->name), $norm) || str_contains($norm, $this->norm($lga->name))) {
                return $lga;
            }
        }

        return null;
    }

    private function norm(string $s): string
    {
        $s = strtolower($s);
        $s = str_replace(['-', '/', '_'], ' ', $s);
        $s = preg_replace('/\s+/', ' ', $s) ?? $s;

        return trim($s);
    }
}

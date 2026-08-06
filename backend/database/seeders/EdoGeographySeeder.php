<?php

namespace Database\Seeders;

use App\Models\Lga;
use App\Models\State;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;

/**
 * Ensures Edo state + 18 LGAs exist, then attaches LGA polygons to wards.
 */
class EdoGeographySeeder extends Seeder
{
    private array $lgas = [
        'Akoko-Edo',
        'Egor',
        'Esan Central',
        'Esan North-East',
        'Esan South-East',
        'Esan West',
        'Etsako Central',
        'Etsako East',
        'Etsako West',
        'Igueben',
        'Ikpoba-Okha',
        'Oredo',
        'Orhionmwon',
        'Ovia North-East',
        'Ovia South-West',
        'Owan East',
        'Owan West',
        'Uhunmwonde',
    ];

    public function run(): void
    {
        $state = State::firstOrCreate(
            ['name' => 'Edo'],
            ['code' => 'ED']
        );

        foreach ($this->lgas as $name) {
            Lga::firstOrCreate(
                ['state_id' => $state->id, 'name' => $name],
                ['code' => strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $name), 0, 8))]
            );
        }

        if (Schema::hasColumn('wards', 'geojson')) {
            Artisan::call('situation-room:seed-edo-geo', ['--force' => true]);
            $this->command?->info(Artisan::output());
        }
    }
}

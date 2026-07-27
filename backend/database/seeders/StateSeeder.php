<?php

namespace Database\Seeders;

use App\Models\Lga;
use App\Models\State;
use App\Models\Ward;
use Illuminate\Database\Seeder;

class StateSeeder extends Seeder
{
    /**
     * Sample geography so the ward/polling-unit hierarchy is exercised end to end.
     * Replace with the real constituency's states/LGAs/wards before going live.
     */
    public function run(): void
    {
        $state = State::firstOrCreate(['code' => 'ED'], ['name' => 'Edo State']);

        $lgas = [
            'Oredo' => ['Ward 1', 'Ward 2', 'Ward 3'],
            'Egor' => ['Ward 1', 'Ward 2'],
            'Ikpoba-Okha' => ['Ward 1', 'Ward 2'],
        ];

        foreach ($lgas as $lgaName => $wards) {
            $lga = Lga::firstOrCreate(['state_id' => $state->id, 'name' => $lgaName]);

            foreach ($wards as $wardName) {
                Ward::firstOrCreate(['lga_id' => $lga->id, 'name' => $wardName]);
            }
        }
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\CitizenReport;
use App\Models\Donation;
use App\Models\ElectionResult;
use App\Models\Incident;
use App\Models\Volunteer;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use ApiResponse;

    /**
     * Top-level admin dashboard summary. Every widget here is deliberately a
     * cheap aggregate query — no N+1s — since this endpoint loads on every
     * admin session.
     */
    public function index(Request $request)
    {
        return $this->success([
            'campaigns' => [
                'active' => Campaign::where('status', 'active')->count(),
                'total' => Campaign::count(),
            ],
            'donations' => [
                'total_raised' => (float) Donation::where('status', 'successful')->sum('amount'),
                'successful_count' => Donation::where('status', 'successful')->count(),
                'pending_count' => Donation::where('status', 'pending')->count(),
            ],
            'volunteers' => [
                'total' => Volunteer::count(),
                'pending_approval' => Volunteer::where('status', 'pending')->count(),
            ],
            'situation_room' => [
                'results_pending_verification' => ElectionResult::where('status', 'pending')->count(),
                'results_verified' => ElectionResult::where('status', 'verified')->count(),
                'open_incidents' => Incident::whereIn('status', ['reported', 'under_review'])->count(),
                'critical_incidents' => Incident::where('severity', 'critical')->whereIn('status', ['reported', 'under_review'])->count(),
            ],
            'citizen_engagement' => [
                'open_reports' => CitizenReport::whereIn('status', ['submitted', 'assigned', 'in_progress'])->count(),
                'resolved_reports' => CitizenReport::where('status', 'resolved')->count(),
            ],
        ]);
    }
}

<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\CitizenEngagementController;
use App\Http\Controllers\Api\ConstituencyController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DonationController;
use App\Http\Controllers\Api\ElectionController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\FoundationController;
use App\Http\Controllers\Api\GeographyController;
use App\Http\Controllers\Api\HeroSlideController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\SiteSettingController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VolunteerController;
use Illuminate\Support\Facades\Route;

// ---- Public ----
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/campaigns', [CampaignController::class, 'index']);
Route::get('/campaigns/{campaign}', [CampaignController::class, 'show']);
Route::get('/campaigns/{campaign}/progress', [DonationController::class, 'campaignProgress']);

Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{event}', [EventController::class, 'show']);

Route::get('/states', [GeographyController::class, 'states']);
Route::get('/wards', [GeographyController::class, 'wards']);
Route::get('/polling-units', [GeographyController::class, 'pollingUnits']);

Route::post('/volunteers', [VolunteerController::class, 'store']);

Route::post('/donations/initialize', [DonationController::class, 'initialize']);
Route::get('/donations/verify/{reference}', [DonationController::class, 'verify']);
Route::get('/donations/{donation}/receipt', [DonationController::class, 'receipt']);

Route::post('/citizen-reports', [CitizenEngagementController::class, 'store']);

Route::get('/foundation/projects', [FoundationController::class, 'index']);
Route::get('/foundation/projects/{slug}', [FoundationController::class, 'show']);
Route::get('/foundation/success-stories', [FoundationController::class, 'successStories']);

Route::get('/constituency-projects', [ConstituencyController::class, 'index']);
Route::get('/constituency-projects/{constituencyProject}', [ConstituencyController::class, 'show']);

Route::get('/media', [MediaController::class, 'index']);
Route::get('/media/categories', [MediaController::class, 'categories']);
Route::get('/media/{slug}', [MediaController::class, 'show']);

Route::get('/settings', [SiteSettingController::class, 'index']);

Route::get('/hero-slides', [HeroSlideController::class, 'indexPublic']);

// ---- Authenticated ----
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Campaign management (any authenticated staff role can read; write is enforced in controller/policy later)
    Route::post('/campaigns', [CampaignController::class, 'store']);
    Route::put('/campaigns/{campaign}', [CampaignController::class, 'update']);
    Route::delete('/campaigns/{campaign}', [CampaignController::class, 'destroy']);

    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{event}', [EventController::class, 'update']);
    Route::delete('/events/{event}', [EventController::class, 'destroy']);

    // ---- Admin dashboard (any staff role) ----
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // ---- User / staff management — super admin only ----
    Route::middleware('role:super-admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/roles', [UserController::class, 'roles']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::post('/users', [UserController::class, 'store']);
        Route::patch('/users/{user}/role', [UserController::class, 'updateRole']);
        Route::patch('/users/{user}/status', [UserController::class, 'updateStatus']);
    });

    // ---- Donation reports — campaign director + above ----
    Route::middleware('role:campaign-director|super-admin')->group(function () {
        Route::get('/donations', [DonationController::class, 'index']);
    });

    // ---- Election Situation Room ----
    Route::middleware('role:polling-agent|ward-coordinator|campaign-director|super-admin')->group(function () {
        Route::get('/situation-room/results', [ElectionController::class, 'results']);
        Route::post('/situation-room/results', [ElectionController::class, 'submitResult']);
        Route::get('/situation-room/incidents', [ElectionController::class, 'incidents']);
        Route::post('/situation-room/incidents', [ElectionController::class, 'reportIncident']);
    });

    Route::middleware('role:ward-coordinator|campaign-director|super-admin')->group(function () {
        Route::patch('/situation-room/results/{result}/verify', [ElectionController::class, 'verifyResult']);
        Route::patch('/situation-room/incidents/{incident}', [ElectionController::class, 'updateIncidentStatus']);
        Route::get('/situation-room/dashboard/ward/{ward}', [ElectionController::class, 'wardDashboard']);
        Route::get('/situation-room/dashboard/lga/{lga}', [ElectionController::class, 'lgaDashboard']);
        Route::get('/situation-room/dashboard/constituency', [ElectionController::class, 'constituencyDashboard']);
        Route::get('/situation-room/dashboard/live', [ElectionController::class, 'liveDashboard']);

        // Wards & Polling Units setup — feeds the Situation Room, Volunteer Portal, and Constituency Tracker
        Route::post('/wards', [GeographyController::class, 'storeWard']);
        Route::put('/wards/{ward}', [GeographyController::class, 'updateWard']);
        Route::delete('/wards/{ward}', [GeographyController::class, 'destroyWard']);
        Route::post('/polling-units', [GeographyController::class, 'storePollingUnit']);
        Route::put('/polling-units/{pollingUnit}', [GeographyController::class, 'updatePollingUnit']);
        Route::delete('/polling-units/{pollingUnit}', [GeographyController::class, 'destroyPollingUnit']);
    });

    // ---- Volunteers — ward coordinator + above review/approve signups ----
    Route::middleware('role:ward-coordinator|campaign-director|super-admin')->group(function () {
        Route::get('/volunteers', [VolunteerController::class, 'index']);
        Route::get('/volunteers/{volunteer}', [VolunteerController::class, 'show']);
        Route::patch('/volunteers/{volunteer}', [VolunteerController::class, 'updateStatus']);
        Route::delete('/volunteers/{volunteer}', [VolunteerController::class, 'destroy']);
    });

    // ---- Foundation admin ----
    Route::middleware('role:foundation-admin|super-admin')->group(function () {
        Route::post('/foundation/projects', [FoundationController::class, 'store']);
        Route::put('/foundation/projects/{foundationProject}', [FoundationController::class, 'update']);
        Route::delete('/foundation/projects/{foundationProject}', [FoundationController::class, 'destroy']);
        Route::get('/foundation/beneficiaries', [FoundationController::class, 'beneficiaries']);
        Route::post('/foundation/projects/{foundationProject}/beneficiaries', [FoundationController::class, 'storeBeneficiary']);
        Route::patch('/foundation/beneficiaries/{beneficiary}', [FoundationController::class, 'updateBeneficiary']);
    });

    // ---- Constituency project tracker — ward coordinator + above ----
    Route::middleware('role:ward-coordinator|campaign-director|super-admin')->group(function () {
        Route::post('/constituency-projects', [ConstituencyController::class, 'store']);
        Route::put('/constituency-projects/{constituencyProject}', [ConstituencyController::class, 'update']);
        Route::patch('/constituency-projects/{constituencyProject}/progress', [ConstituencyController::class, 'updateProgress']);
        Route::delete('/constituency-projects/{constituencyProject}', [ConstituencyController::class, 'destroy']);

        Route::get('/citizen-reports', [CitizenEngagementController::class, 'index']);
        Route::patch('/citizen-reports/{citizenReport}/assign', [CitizenEngagementController::class, 'assign']);
        Route::patch('/citizen-reports/{citizenReport}', [CitizenEngagementController::class, 'updateStatus']);
    });

    // ---- Media / content team ----
    Route::middleware('role:media-team|content-manager|super-admin')->group(function () {
        Route::post('/media', [MediaController::class, 'store']);
        Route::put('/media/{medium}', [MediaController::class, 'update']);
        Route::delete('/media/{medium}', [MediaController::class, 'destroy']);
        Route::put('/settings', [SiteSettingController::class, 'update']);

        // Hero write-ups
        Route::get('/admin/hero-slides', [HeroSlideController::class, 'index']);
        Route::post('/admin/hero-slides', [HeroSlideController::class, 'store']);
        Route::put('/admin/hero-slides/{heroSlide}', [HeroSlideController::class, 'update']);
        Route::delete('/admin/hero-slides/{heroSlide}', [HeroSlideController::class, 'destroy']);
        Route::post('/admin/hero-slides/reorder', [HeroSlideController::class, 'reorder']);
    });
});
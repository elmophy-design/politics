<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | The frontend (Next.js, on a different domain) calls this API directly
    | via fetch, so every /api/* route needs proper CORS headers or the
    | browser blocks the request before it ever reaches Laravel.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Set FRONTEND_URL in .env to your deployed frontend's exact origin
    // (e.g. https://politics-7u4q.vercel.app). Comma-separate multiple
    // origins (staging + production + a custom domain) if needed.
    'allowed_origins' => array_filter(array_map('trim', explode(',', env('FRONTEND_URL', '')))) ?: ['http://localhost:3000'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // We authenticate with a Bearer token (Sanctum API tokens), not cookies,
    // so credentials support isn't needed here.
    'supports_credentials' => false,

];

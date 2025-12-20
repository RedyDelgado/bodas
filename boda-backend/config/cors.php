<?php

return [

    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
    ],

    'allowed_methods' => ['*'],

    // Define or override via env: CORS_ALLOWED_ORIGINS="http://localhost:5173,http://161.97.169.31"
    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:3000')),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Content-Disposition'],

    'max_age' => 0,

    // Cuando se usan cookies (Sanctum) y credentials=true, no puede ser '*'.
    // Asegúrate de listar explícitamente el origen en CORS_ALLOWED_ORIGINS.
    'supports_credentials' => env('CORS_SUPPORTS_CREDENTIALS', true),
];

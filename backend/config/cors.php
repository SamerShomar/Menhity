<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*'],

    'allowed_methods' => ['*'],

    // واجهة React تعمل على منفذ منفصل في التطوير
    'allowed_origins' => array_filter([
        env('FRONTEND_URL', 'http://localhost:5173'),
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ]),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // نستخدم توكنات Bearer لا كوكيز، فلا حاجة لإرسال الاعتمادات
    'supports_credentials' => false,
];

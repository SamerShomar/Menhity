<?php

/*
 * كل نشرة على Cloudflare Pages تأخذ نطاقاً فرعياً خاصاً بها إلى جانب
 * النطاق الأساسي — مثل 40f971e8.menhity.pages.dev و
 * claude-branch.menhity.pages.dev. وفتح الموقع من أحدها يجعل المتصفّح
 * يرسل أصلاً لا يطابق FRONTEND_URL، فيرفضه الخادم ويحجب المتصفّح الرد،
 * فتظهر الواجهة كأن الخادم ساقط: «تعذّر الاتصال بالخادم».
 *
 * لذا نسمح بالنطاقات الفرعية لمضيف الواجهة نفسه، لا بأي نطاق.
 */
$frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
$frontendHost = parse_url($frontendUrl, PHP_URL_HOST);

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*'],

    'allowed_methods' => ['*'],

    // واجهة React تعمل على منفذ منفصل في التطوير
    'allowed_origins' => array_filter([
        $frontendUrl,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ]),

    'allowed_origins_patterns' => array_filter([
        $frontendHost
            ? '#^https://[a-z0-9-]+\.'.preg_quote($frontendHost, '#').'$#i'
            : null,
    ]),

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // نستخدم توكنات Bearer لا كوكيز، فلا حاجة لإرسال الاعتمادات
    'supports_credentials' => false,
];

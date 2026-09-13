<?php

/**
 * إعدادات منصة منحتي.
 * القيم العامة (اسم المنصة، بيانات التواصل) تُقرأ من هنا وتنعكس
 * على الـ API والواجهة الأمامية معاً.
 */
return [
    'site' => [
        'name' => 'منحتي',
        'name_en' => 'Minhati',
        'tagline' => 'منصة عربية للطلاب والباحثين عن المنح',
        'description' => 'منحتي منصة تساعد الطلاب والباحثين على اكتشاف المنح المناسبة، وتجهيز طلباتهم، ومتابعة مواعيد التقديم باستخدام تقنيات ذكية تجعل رحلة البحث والتقديم أسهل.',
        'email' => 'Menhati@gmail.com',
        'phone' => '0592983443',
        'address' => 'فلسطين، غزة',
        'founded_year' => 2026,
    ],

    'ai' => [
        'api_key' => env('ANTHROPIC_API_KEY'),
        'model' => env('ANTHROPIC_MODEL', 'claude-opus-5'),
        'max_tokens' => 8000,
    ],

    'uploads' => [
        'max_bytes' => 10 * 1024 * 1024, // 10 ميجابايت
        'mimes' => ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'],
    ],

    'pagination' => [
        'public' => 9,
        'admin' => 20,
    ],

    /** مهلة تسليم طلب صياغة السيرة الذاتية بالساعات */
    'cv_order_sla_hours' => 48,
];

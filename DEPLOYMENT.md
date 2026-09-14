# نشر منحتي مجاناً

دليل خطوة بخطوة لرفع المشروع على الإنترنت **بلا أي تكلفة**.

المشروع ثلاث قطع، كلٌّ على خدمة مجانية:

| القطعة | الخدمة | الخطة |
|---|---|---|
| قاعدة البيانات (PostgreSQL) | [Neon](https://neon.tech) | مجانية دائمة |
| الخادم (Laravel API) | [Render](https://render.com) | مجانية — مع تنبيه أدناه |
| الواجهة (React) | [Cloudflare Pages](https://pages.cloudflare.com) | مجانية |

> ⚠️ **تنبيه مهم عن الخطة المجانية في Render**: الخادم **ينام** بعد ١٥ دقيقة بلا زيارات،
> وأول طلب بعد النوم يستغرق **٤٠–٦٠ ثانية** حتى يستيقظ. هذا مقبول لعرض مشروع
> أو للتجربة، لكنه غير مناسب لموقع بزوّار حقيقيين. قبل أي عرض أو مناقشة،
> افتح الموقع مرة قبلها بدقيقتين ليستيقظ.

---

## الخطوة ١ — قاعدة البيانات على Neon

1. سجّل في [neon.tech](https://neon.tech) بحساب GitHub.
2. **Create project** ← اسمه `menhity` ← اختر أقرب منطقة لك (`Frankfurt` مناسبة للمنطقة العربية).
3. من صفحة المشروع انسخ **Connection string**. يبدو هكذا:

```
postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

احتفظ به — ستحتاجه في الخطوة التالية.

---

## الخطوة ٢ — الخادم على Render

### أ) ولّد مفتاح التطبيق

على جهازك، من مجلد `backend`:

```powershell
php artisan key:generate --show
```

سيطبع سطراً مثل `base64:xxxxxxxxxxxx` — انسخه كاملاً.

### ب) أنشئ الخدمة

1. سجّل في [render.com](https://render.com) بحساب GitHub.
2. **New** ← **Web Service** ← اربط مستودع `Menhity`.
3. الإعدادات:

| الحقل | القيمة |
|---|---|
| Name | `menhity-api` |
| Region | `Frankfurt` |
| Root Directory | `backend` |
| Runtime | `Docker` |
| Instance Type | `Free` |

### ج) متغيّرات البيئة

أضفها من **Environment** قبل أول نشر:

| المتغيّر | القيمة |
|---|---|
| `APP_NAME` | `منحتي` |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_KEY` | المفتاح من الخطوة (أ) |
| `APP_URL` | `https://menhity-api.onrender.com` |
| `APP_LOCALE` | `ar` |
| `LOG_CHANNEL` | `stderr` |
| `DB_CONNECTION` | `pgsql` |
| `DB_URL` | رابط Neon من الخطوة ١ |
| `FRONTEND_URL` | `https://menhity.pages.dev` (اضبطه بعد الخطوة ٣) |
| `SESSION_DRIVER` | `database` |
| `CACHE_STORE` | `database` |
| `QUEUE_CONNECTION` | `database` |
| `FILESYSTEM_DISK` | `public` |
| `SEED_ON_DEPLOY` | `true` ← **عند أول نشر فقط** |

اضغط **Create Web Service**. أول بناء يستغرق ٥–١٠ دقائق.

### د) تحقّق

افتح `https://menhity-api.onrender.com/api/v1/stats` — لازم يظهر JSON بالأرقام.

> بعد نجاح أول نشر، **غيّر `SEED_ON_DEPLOY` إلى `false`** حتى لا تُزرع البيانات
> التجريبية مجدداً مع كل نشر.

---

## الخطوة ٣ — الواجهة على Cloudflare Pages

1. سجّل في [dash.cloudflare.com](https://dash.cloudflare.com).
2. **Workers & Pages** ← **Create** ← **Pages** ← **Connect to Git** ← اختر `Menhity`.
3. الإعدادات:

| الحقل | القيمة |
|---|---|
| Project name | `menhity` |
| Production branch | `main` |
| Framework preset | `Vite` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `frontend` |

4. **Environment variables** ← أضف:

| المتغيّر | القيمة |
|---|---|
| `VITE_API_URL` | `https://menhity-api.onrender.com/api/v1` |

5. **Save and Deploy**.

ستحصل على رابط مثل `https://menhity.pages.dev`.

### أغلق الدائرة

ارجع إلى Render واضبط `FRONTEND_URL` على رابط Cloudflare، ثم **Manual Deploy** لإعادة النشر.
بدون هذه الخطوة سيمنع CORS الواجهة من الوصول إلى الـ API.

---

## الخطوة ٤ — النطاق (اختياري)

النطاق الفرعي `menhity.pages.dev` مجاني ويعمل فوراً. لنطاق خاص:

**نطاق مجاني للطلاب**: [GitHub Student Developer Pack](https://education.github.com/pack)
يمنح نطاق `.me` مجاناً لسنة من Namecheap، إضافةً إلى أرصدة أخرى. يحتاج إثبات قيد جامعي.

**نطاق مدفوع**: ~$10–15 سنوياً من [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/)
(يبيع بسعر التكلفة بلا هامش ربح).

بعد الشراء: في Cloudflare Pages ← **Custom domains** ← **Set up a domain**.
إن كان النطاق مسجّلاً في Cloudflare فالربط تلقائي؛ وإلا أضف سجل `CNAME` عند مسجّلك.

ثم حدّث `FRONTEND_URL` في Render إلى نطاقك الجديد.

---

## ما يبقى معطّلاً بعد النشر

| الميزة | لماذا | الحل المجاني |
|---|---|---|
| **استعادة كلمة المرور** | لا مزوّد بريد — الرمز يُطبع في سجل Render | [Resend](https://resend.com) مجاناً حتى ٣٠٠٠ رسالة/شهر |
| **المستندات المرفوعة** | قرص Render مؤقّت — تُمحى مع كل نشر | [Cloudflare R2](https://developers.cloudflare.com/r2/) مجاناً حتى ١٠GB |
| **أدوات الذكاء الاصطناعي** | تعمل بوضع المحاكاة | أضف `ANTHROPIC_API_KEY` (مدفوع بالاستهلاك) |
| **دخول Google / Apple** | لا بيانات اعتماد OAuth | مجاني — يحتاج إعداد في Google Cloud Console |

> **الأهم بينها استعادة كلمة المرور.** إن كان الموقع سيُستخدم فعلاً، اربط البريد أولاً —
> وإلا فمن ينسى كلمة مروره يفقد حسابه نهائياً.

---

## أسئلة شائعة

**لماذا لا أضع كل شيء على Render؟**
تستطيع، لكن قاعدة بيانات Render المجانية **تنتهي صلاحيتها بعد ٩٠ يوماً** وتُحذف.
قاعدة Neon المجانية دائمة. ولهذا فصلناهما.

**لماذا لا أضع الواجهة على Render أيضاً؟**
الواجهة ملفات ثابتة بعد البناء. Cloudflare يوزّعها من شبكته العالمية مجاناً وبسرعة أعلى،
ولا تنام كخدمة Render.

**الخادم بطيء جداً في أول فتح**
هذا نوم الخطة المجانية، لا خطأ في المشروع. راجع التنبيه في أول الصفحة.

**كيف أحدّث الموقع بعد تعديل الكود؟**
ادفع إلى `main` على GitHub — Render وCloudflare ينشران تلقائياً.

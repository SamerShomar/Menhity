import axios from "axios";

const TOKEN_KEY = "menhity_token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // متصفح يمنع التخزين المحلي — نتجاهل بصمت
  }
}

/** مهلة عامة — بدونها يدور مؤشّر التحميل بلا نهاية إن لم يستجب الخادم */
export const REQUEST_TIMEOUT = 30_000;

/** توليد الذكاء الاصطناعي يستغرق دقيقة أو أكثر، فله مهلة خاصة */
export const AI_TIMEOUT = 130_000;

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api/v1",
  headers: { Accept: "application/json" },
  timeout: REQUEST_TIMEOUT,
});

// إرفاق توكن الوصول مع كل طلب
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// انتهاء الجلسة يعيد المستخدم لصفحة الدخول
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const onAuthPage = /\/(login|register|forgot-password|verify|reset-password)/.test(
      window.location.pathname,
    );

    if (status === 401 && !onAuthPage) {
      setToken(null);
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    }

    return Promise.reject(error);
  },
);

/**
 * يستخرج رسالة خطأ عربية صالحة للعرض،
 * وأخطاء الحقول لعرضها أسفل كل حقل.
 */
export function parseApiError(error) {
  const response = error?.response;

  if (!response) {
    const timedOut = error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT";

    return {
      message: timedOut
        ? "استغرق الخادم وقتاً أطول من المتوقّع ولم يردّ. حاول مجدداً بعد قليل."
        : "تعذّر الاتصال بالخادم. تحقّق من اتصالك وحاول مجدداً.",
      errors: {},
    };
  }

  const data = response.data ?? {};
  const errors = {};

  // تُقرأ في المكوّنات بصيغة fieldErrors.field?.[0]، فنبقيها مصفوفات دائماً
  for (const [field, messages] of Object.entries(data.errors ?? {})) {
    errors[field] = Array.isArray(messages) ? messages : [String(messages)];
  }

  return {
    message: data.message ?? "حدث خطأ غير متوقّع. حاول مجدداً.",
    errors,
    status: response.status,
    // جسم الاستجابة كما هو — لحقول إضافية تحملها بعض الأخطاء (مثل link_sent مع 409 لحساب غير مفعَّل)
    data,
  };
}

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

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api/v1",
  headers: { Accept: "application/json" },
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
    return {
      message: "تعذّر الاتصال بالخادم. تحقّق من اتصالك وحاول مجدداً.",
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
  };
}

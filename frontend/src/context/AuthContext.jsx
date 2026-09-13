import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { authApi } from "@/api/endpoints";
import { getToken, setToken } from "@/api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  // استعادة الجلسة عند فتح التطبيق إن وُجد توكن محفوظ
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    authApi
      .me()
      .then((data) => {
        if (!cancelled) setUser(data);
      })
      .catch(() => {
        setToken(null);
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (payload) => {
    const data = await authApi.login(payload);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authApi.register(payload);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => undefined);
    setToken(null);
    setUser(null);
  }, []);

  /** تحديث بيانات المستخدم بعد تعديل الإعدادات أو الملف */
  const refresh = useCallback(async () => {
    const data = await authApi.me();
    setUser(data);
    return data;
  }, []);

  /** إنهاء الجلسة محلياً دون نداء الخادم (بعد حذف الحساب مثلاً) */
  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: Boolean(user?.is_admin_level),
      login,
      register,
      logout,
      refresh,
      setUser,
      clearSession,
    }),
    [user, loading, login, register, logout, refresh, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth يجب أن يُستخدم داخل AuthProvider");
  }

  return context;
}

import { AI_TIMEOUT, api } from "./client";

/** كل نداءات الـ API في مكان واحد حتى لا تتناثر المسارات في المكوّنات */

/* ---------------- عام ---------------- */
export const metaApi = {
  meta: () => api.get("/meta").then((r) => r.data.data),
  stats: () => api.get("/stats").then((r) => r.data.data),
  contact: (payload) => api.post("/contact", payload).then((r) => r.data),
};

/* ---------------- المصادقة ---------------- */
export const authApi = {
  register: (payload) => api.post("/auth/register", payload).then((r) => r.data),
  login: (payload) => api.post("/auth/login", payload).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
  verifyEmail: ({ email, token }) =>
    api.post("/auth/verify-email", { email, token }).then((r) => r.data),
  resendVerification: (payload) => api.post("/auth/resend-verification", payload).then((r) => r.data),
  forgotPassword: (payload) => api.post("/auth/forgot-password", payload).then((r) => r.data),
  resendCode: (payload) => api.post("/auth/resend-code", payload).then((r) => r.data),
  verifyCode: (payload) => api.post("/auth/verify-code", payload).then((r) => r.data),
  resetPassword: (payload) => api.post("/auth/reset-password", payload).then((r) => r.data),
};

/* ---------------- المنح ---------------- */
export const scholarshipApi = {
  list: (params) => api.get("/scholarships", { params }).then((r) => r.data),
  featured: () => api.get("/scholarships/featured").then((r) => r.data.data),
  facets: () => api.get("/scholarships/facets").then((r) => r.data.data),
  show: (slug) => api.get(`/scholarships/${slug}`).then((r) => r.data.data),
  saved: () => api.get("/saved").then((r) => r.data.data),
  toggleSave: (slug) => api.post(`/saved/${slug}`).then((r) => r.data),
};

/* ---------------- لوحة الطالب ---------------- */
export const dashboardApi = {
  overview: () => api.get("/dashboard").then((r) => r.data.data),
};

export const profileApi = {
  show: () => api.get("/profile").then((r) => r.data.data),
  completion: () => api.get("/profile/completion").then((r) => r.data.data),
  updatePersonal: (payload) => api.put("/profile", payload).then((r) => r.data.data),
  addItem: (type, payload) => api.post(`/profile/${type}`, payload).then((r) => r.data.data),
  updateItem: (type, id, payload) => api.put(`/profile/${type}/${id}`, payload).then((r) => r.data.data),
  removeItem: (type, id) => api.delete(`/profile/${type}/${id}`).then((r) => r.data.data),
};

export const documentApi = {
  list: () => api.get("/documents").then((r) => r.data.data),
  upload: (file, kind) => {
    const form = new FormData();
    form.append("file", file);
    form.append("kind", kind);
    return api
      .post("/documents", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data.data);
  },
  remove: (id) => api.delete(`/documents/${id}`).then((r) => r.data),
};

export const notificationApi = {
  list: (tab) => api.get("/notifications", { params: { tab } }).then((r) => r.data),
  unreadCount: () => api.get("/notifications/unread-count").then((r) => r.data.count),
  markAllRead: () => api.post("/notifications/read-all").then((r) => r.data),
  markRead: (id) => api.post(`/notifications/${id}/read`).then((r) => r.data),
};

export const settingsApi = {
  sessions: () => api.get("/sessions").then((r) => r.data.data),
  revokeSession: (id) => api.delete(`/sessions/${id}`).then((r) => r.data),
  revokeAllSessions: () => api.delete("/sessions/all").then((r) => r.data),
  updatePassword: (payload) => api.put("/settings/password", payload).then((r) => r.data),
  updatePrivacy: (payload) => api.put("/settings/privacy", payload).then((r) => r.data.data),
  updateNotifications: (payload) => api.put("/settings/notifications", payload).then((r) => r.data.data),
  updateLocale: (payload) => api.put("/settings/locale", payload).then((r) => r.data.data),
  deactivate: () => api.post("/settings/deactivate").then((r) => r.data),
  deleteAccount: (confirm) => api.delete("/settings/account", { data: { confirm } }).then((r) => r.data),
};

/* ---------------- أدوات الذكاء الاصطناعي ---------------- */
export const aiApi = {
  tools: () => api.get("/ai-tools").then((r) => r.data),
  run: (key, payload) =>
    api.post(`/ai-tools/${key}/run`, payload, { timeout: AI_TIMEOUT }).then((r) => r.data.data),
};

export const cvOrderApi = {
  active: () => api.get("/cv-orders/active").then((r) => r.data.data),
  readiness: () => api.get("/cv-orders/readiness").then((r) => r.data.data),
  show: (id) => api.get(`/cv-orders/${id}`).then((r) => r.data.data),
  paymentInfo: () => api.get("/cv-orders/payment-info").then((r) => r.data.data),
  submit: ({ kind = "cv_build", file, note, receipt, paymentNote } = {}) => {
    const form = new FormData();
    form.append("kind", kind);
    if (file) form.append("file", file);
    if (note) form.append("note", note);
    if (receipt) form.append("receipt", receipt);
    if (paymentNote) form.append("payment_note", paymentNote);
    return api
      .post("/cv-orders", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },
  /** إشعار بديل بعد رفض الأول */
  replaceReceipt: ({ id, receipt, paymentNote }) => {
    const form = new FormData();
    form.append("receipt", receipt);
    if (paymentNote) form.append("payment_note", paymentNote);
    return api
      .post(`/cv-orders/${id}/receipt`, form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },
  /* الملفات على قرص خاص، فتُحمَّل عبر مسار مصرّح لا برابط مباشر */
  downloadFinal: (id, name) => downloadFile(`/cv-orders/${id}/file`, name),
  addNote: (id, body) => api.post(`/cv-orders/${id}/notes`, { body }).then((r) => r.data.data),
};

/**
 * يجلب ملفاً محمياً بالتوكن ويعيد رابط كائن لعرضه داخل الصفحة.
 * الملفات على قرص خاص فلا يصلح وضع مسارها في src مباشرة.
 *
 * على المستدعي استدعاء URL.revokeObjectURL عند الإغلاق.
 */
async function fetchBlobUrl(url) {
  const response = await api.get(url, { responseType: "blob" });

  return { url: URL.createObjectURL(response.data), type: response.data.type };
}

/** يحمّل ملفاً محمياً بالتوكن ثم يسلّمه للمتصفح كتنزيل */
async function downloadFile(url, fallbackName) {
  const response = await api.get(url, { responseType: "blob" });
  const objectUrl = URL.createObjectURL(response.data);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = fallbackName ?? "منحتي";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

/* ---------------- لوحة الإدارة ---------------- */
export const adminApi = {
  dashboard: () => api.get("/admin/dashboard").then((r) => r.data.data),

  scholarships: (params) => api.get("/admin/scholarships", { params }).then((r) => r.data),
  scholarship: (slug) => api.get(`/admin/scholarships/${slug}`).then((r) => r.data.data),
  createScholarship: (payload) => api.post("/admin/scholarships", payload).then((r) => r.data),
  updateScholarship: (slug, payload) => api.put(`/admin/scholarships/${slug}`, payload).then((r) => r.data),
  setScholarshipStatus: (slug, status) =>
    api.patch(`/admin/scholarships/${slug}/status`, { status }).then((r) => r.data),
  deleteScholarship: (slug) => api.delete(`/admin/scholarships/${slug}`).then((r) => r.data),

  users: (params) => api.get("/admin/users", { params }).then((r) => r.data),
  setUserStatus: (id, status, reason) =>
    api.patch(`/admin/users/${id}/status`, { status, reason }).then((r) => r.data),
  setUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data),
  /** تنزيل CSV عبر الـ API حتى يُرسَل توكن المصادقة مع الطلب */
  exportUsers: () => api.get("/admin/users/export", { responseType: "blob" }).then((r) => r.data),

  aiTools: () => api.get("/admin/ai-tools").then((r) => r.data),
  toggleAiTool: (key) => api.patch(`/admin/ai-tools/${key}/toggle`).then((r) => r.data),

  orders: (deleted) =>
    api.get("/admin/orders", { params: deleted ? { deleted: 1 } : {} }).then((r) => r.data),
  deleteOrder: (id, reason) =>
    api.delete(`/admin/orders/${id}`, { data: { reason } }).then((r) => r.data),
  restoreOrder: (id) => api.post(`/admin/orders/${id}/restore`).then((r) => r.data),
  downloadOrderSource: (id, name) => downloadFile(`/admin/orders/${id}/source`, name),
  deliverOrder: (id, file) => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post(`/admin/orders/${id}/deliver`, form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },
  advanceOrder: (id, status) => api.patch(`/admin/orders/${id}/advance`, { status }).then((r) => r.data),
  /* الإشعار يُعاين لا يُنزَّل: المدير يتأكّد منه بالنظر */
  openOrderReceipt: (id) => fetchBlobUrl(`/admin/orders/${id}/receipt`),
  reviewPayment: (id, decision, reason) =>
    api.post(`/admin/orders/${id}/payment`, { decision, reason }).then((r) => r.data),

  notifications: () => api.get("/admin/notifications").then((r) => r.data),
  broadcast: (payload) => api.post("/admin/notifications/broadcast", payload).then((r) => r.data),

  reports: () => api.get("/admin/reports").then((r) => r.data.data),
  settings: () => api.get("/admin/settings").then((r) => r.data.data),
  updatePayment: (payload) => api.put("/admin/settings/payment", payload).then((r) => r.data),
};

/* ---------------- مساحة عمل الخبير ---------------- */
export const expertApi = {
  orders: () => api.get("/expert/orders").then((r) => r.data),
  order: (id) => api.get(`/expert/orders/${id}`).then((r) => r.data.data),
  downloadOrderSource: (id, name) => downloadFile(`/expert/orders/${id}/source`, name),
  deliverOrder: (id, file) => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post(`/expert/orders/${id}/deliver`, form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },
  advanceOrder: (id, status) => api.patch(`/expert/orders/${id}/advance`, { status }).then((r) => r.data),
  addNote: (id, body) => api.post(`/cv-orders/${id}/notes`, { body }).then((r) => r.data),
};

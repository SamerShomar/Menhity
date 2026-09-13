import type {
  AiRunStatus,
  ApplicationStatus,
  CvOrderStatus,
  DegreeLevel,
  DocumentKind,
  ExperienceType,
  FundingType,
  Gender,
  LanguageRequirement,
  NotificationType,
  ScholarshipStatus,
  UserRole,
  UserStatus,
} from "@prisma/client";

/* ============================================================
   معلومات المنصة
   ============================================================ */

export const SITE = {
  name: "منحتي",
  nameEn: "Minhati",
  tagline: "منصة عربية للطلاب والباحثين عن المنح",
  description:
    "منحتي منصة تساعد الطلاب والباحثين على اكتشاف المنح المناسبة، وتجهيز طلباتهم، ومتابعة مواعيد التقديم باستخدام تقنيات ذكية تجعل رحلة البحث والتقديم أسهل.",
  email: "Menhati@gmail.com",
  phone: "0592983443",
  address: "فلسطين، غزة",
  foundedYear: 2026,
  social: {
    linkedin: "#",
    instagram: "#",
    facebook: "#",
  },
} as const;

/* ============================================================
   التنقّل
   قرار توحيد: تسميات موحّدة في كل الشاشات (كانت مختلفة في الملف)
   ============================================================ */

export const PUBLIC_NAV = [
  { href: "/", label: "الرئيسية" },
  { href: "/scholarships", label: "اكتشف المنح" },
  { href: "/tools", label: "أدوات الذكاء الاصطناعي" },
  { href: "/about", label: "من نحن" },
] as const;

export const DASHBOARD_NAV = [
  { href: "/dashboard", label: "نظرة عامة", icon: "LayoutGrid" },
  { href: "/dashboard/profile", label: "الملف الأكاديمي", icon: "UserRound" },
  { href: "/dashboard/saved", label: "المحفوظات", icon: "Bookmark" },
  { href: "/dashboard/documents", label: "المستندات", icon: "FileText" },
  { href: "/dashboard/settings", label: "الإعدادات", icon: "Settings" },
] as const;

export const DASHBOARD_NAV_FOOTER = [
  { href: "/help", label: "مركز المساعدة", icon: "CircleHelp" },
] as const;

/** قرار دمج: السايدبار الإداري ظهر بنسختين مختلفتين — دُمجتا في قائمة واحدة */
export const ADMIN_NAV = [
  { href: "/admin", label: "الرئيسية", icon: "LayoutDashboard" },
  { href: "/admin/scholarships", label: "إدارة المنح", icon: "GraduationCap" },
  { href: "/admin/users", label: "المستخدمون", icon: "Users" },
  { href: "/admin/ai-tools", label: "أدوات الذكاء الاصطناعي", icon: "Sparkles" },
  { href: "/admin/orders", label: "الطلبات", icon: "ClipboardList" },
  { href: "/admin/notifications", label: "الإشعارات", icon: "Bell" },
  { href: "/admin/reports", label: "التقارير والإحصائيات", icon: "BarChart3" },
  { href: "/admin/settings", label: "الإعدادات", icon: "Settings" },
] as const;

export const FOOTER_LINKS = {
  quick: [
    { href: "/", label: "الرئيسية" },
    { href: "/scholarships", label: "اكتشف المنح" },
    { href: "/tools", label: "أدوات الذكاء الاصطناعي" },
    { href: "/about", label: "من نحن؟" },
  ],
  support: [
    { href: "/about", label: "عن المنصة" },
    { href: "/contact", label: "تواصل معنا" },
    { href: "/faq", label: "الأسئلة الشائعة" },
    { href: "/terms", label: "شروط الاستخدام" },
    { href: "/privacy", label: "سياسة الخصوصية" },
  ],
} as const;

/* ============================================================
   ترجمة التعدادات إلى العربية
   ============================================================ */

export const DEGREE_LABELS: Record<DegreeLevel, string> = {
  HIGH_SCHOOL: "الثانوية العامة",
  DIPLOMA: "دبلوم",
  BACHELOR: "بكالوريوس",
  MASTER: "ماجستير",
  PHD: "دكتوراه",
};

/** المستويات المتاحة للتصفية في صفحة المنح */
export const FILTERABLE_DEGREES: DegreeLevel[] = ["BACHELOR", "MASTER", "PHD"];

export const FUNDING_LABELS: Record<FundingType, string> = {
  FULL: "ممولة بالكامل",
  PARTIAL: "تمويل جزئي",
  TUITION_ONLY: "رسوم دراسية فقط",
};

export const LANGUAGE_REQ_LABELS: Record<LanguageRequirement, string> = {
  REQUIRED: "يتطلب أيلتس / توفل",
  NOT_REQUIRED: "لا يشترط شهادة لغة",
};

export const SCHOLARSHIP_STATUS_LABELS: Record<ScholarshipStatus, string> = {
  DRAFT: "مسودة",
  PENDING_REVIEW: "بانتظار المراجعة",
  PUBLISHED: "مفعّلة",
  EXPIRED: "منتهية",
  ARCHIVED: "مؤرشفة",
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: "طالب",
  EXPERT: "خبير أكاديمي",
  MODERATOR: "مشرف",
  ADMIN: "مدير النظام",
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: "نشط",
  INACTIVE: "غير نشط",
  SUSPENDED: "موقوف",
};

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: "ذكر",
  FEMALE: "أنثى",
};

export const EXPERIENCE_TYPE_LABELS: Record<ExperienceType, string> = {
  INTERNSHIP: "تدريب",
  JOB: "عمل",
  RESEARCH: "بحثي",
  VOLUNTEER: "تطوعي",
};

export const DOCUMENT_KIND_LABELS: Record<DocumentKind, string> = {
  CV: "سيرة ذاتية",
  MOTIVATION_LETTER: "خطاب دافع",
  TRANSCRIPT: "سجل أكاديمي",
  RECOMMENDATION: "خطاب توصية",
  PASSPORT: "جواز سفر",
  CERTIFICATE: "شهادة",
  OTHER: "أخرى",
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  NEW_MATCH: "منحة جديدة تناسبك",
  DEADLINE_REMINDER: "تذكير بموعد التقديم",
  DOCUMENT_REVIEWED: "اكتمال مراجعة المستندات",
  SAVED_UPDATED: "تحديث المحفوظات",
  DEADLINE_PASSED: "انتهاء موعد التقديم",
  ORDER_UPDATE: "تحديث على طلبك",
  SYSTEM: "إشعار من المنصة",
};

export const CV_ORDER_STATUS_LABELS: Record<CvOrderStatus, string> = {
  DRAFT: "مسودة",
  SUBMITTED: "تم الاستلام",
  IN_EXPERT_REVIEW: "قيد المراجعة اليدوية بواسطة الخبير",
  ATS_CHECK: "الفحص الدقيق لمعايير ATS",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
};

export const AI_RUN_STATUS_LABELS: Record<AiRunStatus, string> = {
  RUNNING: "قيد التنفيذ",
  SUCCESS: "مكتمل",
  FAILED: "فشل",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  PLANNED: "ينوي التقديم",
  IN_PROGRESS: "قيد التجهيز",
  SUBMITTED: "تم التقديم",
  ACCEPTED: "مقبول",
  REJECTED: "مرفوض",
};

/* ============================================================
   أدوات الذكاء الاصطناعي (5 أدوات — مطابقة للوحة الإدارة)
   ============================================================ */

export const AI_TOOLS = [
  {
    key: "cv-builder",
    nameAr: "إنشاء السيرة الذاتية",
    description: "أنشئ سيرة ذاتية احترافية بناءً على بيانات ملفك الأكاديمي.",
    icon: "FileUser",
    href: "/tools/cv-builder",
  },
  {
    key: "cv-enhancer",
    nameAr: "تحسين السيرة الذاتية",
    description: "حلّل سيرتك الذاتية الحالية واقترح تحسينات تجعلها أكثر احترافية وملاءمة للمنح.",
    icon: "Wand2",
    href: "/tools/cv-enhancer",
  },
  {
    key: "letter-builder",
    nameAr: "إنشاء خطاب الدافع",
    description: "أنشئ خطاب دافع مخصص بناءً على معلومات المستند والمنحة التي تقدّم إليها.",
    icon: "PenLine",
    href: "/tools/letter-builder",
  },
  {
    key: "letter-enhancer",
    nameAr: "تحسين خطاب الدافع",
    description: "حلّل خطاب الدافع واقترح تحسينات على المحتوى والأسلوب ومدى ملاءمته للمنحة.",
    icon: "Sparkles",
    href: "/tools/letter-enhancer",
  },
  {
    key: "profile-review",
    nameAr: "تقييم الملف الشخصي",
    description: "تقييم مدى جاهزية ملفك للتقديم على المنح وتحديد نقاط القوة والفجوات التي تحتاج إلى تحسين.",
    icon: "Star",
    href: "/tools/profile-review",
  },
] as const;

export type AiToolKey = (typeof AI_TOOLS)[number]["key"];

/* ============================================================
   خيارات ثابتة
   ============================================================ */

export const GPA_SCALES = [
  { value: 4, label: "من 4.00" },
  { value: 5, label: "من 5.00" },
  { value: 100, label: "نسبة مئوية (100)" },
] as const;

export const LANGUAGE_PROFICIENCY = [
  "اللغة الأم",
  "متقدم جداً (C2)",
  "متقدم (C1)",
  "متوسط مرتفع (B2)",
  "متوسط (B1)",
  "مبتدئ (A2)",
] as const;

export const SKILL_SUGGESTIONS = [
  "Git & GitHub",
  "حل المشكلات المعقدة",
  "Scrum & Agile",
  "البحث العلمي والتوثيق الأكاديمي",
  "القيادة وإدارة المشاريع",
  "تحليل البيانات",
  "العمل ضمن فريق",
  "الكتابة الأكاديمية",
] as const;

/** ترتيب نتائج البحث */
export const SORT_OPTIONS = [
  { value: "newest", label: "الأحدث" },
  { value: "deadline", label: "الأقرب موعداً" },
  { value: "match", label: "الأعلى مطابقة" },
  { value: "title", label: "الاسم (أ - ي)" },
] as const;

export const PAGE_SIZE = 9;
export const ADMIN_PAGE_SIZE = 20;

/** حدود رفع الملفات */
export const UPLOAD = {
  maxBytes: 10 * 1024 * 1024, // 10 ميجابايت
  allowedMime: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
  ],
  allowedExt: [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg"],
} as const;

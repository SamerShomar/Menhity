import { z } from "zod";

/* ============================================================
   قواعد التحقق — نفس الشروط المعروضة في الواجهات
   ============================================================ */

/** 8 أحرف على الأقل، حرف كبير، رقم، ورمز واحد على الأقل */
export const passwordSchema = z
  .string()
  .min(8, "كلمة المرور يجب ألا تقل عن 8 أحرف")
  .regex(/[A-Z]/, "يجب أن تحتوي على حرف كبير واحد على الأقل")
  .regex(/[a-z]/, "يجب أن تحتوي على حرف صغير واحد على الأقل")
  .regex(/[0-9]/, "يجب أن تحتوي على رقم واحد على الأقل")
  .regex(/[^A-Za-z0-9]/, "يجب أن تحتوي على رمز واحد على الأقل");

export const emailSchema = z
  .string()
  .min(1, "البريد الإلكتروني مطلوب")
  .email("صيغة البريد الإلكتروني غير صحيحة")
  .transform((v) => v.trim().toLowerCase());

export const registerSchema = z
  .object({
    fullName: z.string().min(3, "الاسم الكامل مطلوب").max(120),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      message: "يجب الموافقة على شروط الاستخدام وسياسة الخصوصية",
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "كلمة المرور مطلوبة"),
  remember: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const verifyCodeSchema = z.object({
  email: emailSchema,
  code: z.string().regex(/^\d{6}$/, "الرمز يتكوّن من 6 أرقام"),
});

export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    code: z.string().regex(/^\d{6}$/, "الرمز غير صحيح"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

/* ============================================================
   الملف الأكاديمي
   ============================================================ */

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v))
  .refine((v) => v === undefined || /^https?:\/\/.+/i.test(v) || /^[\w.-]+\.[a-z]{2,}/i.test(v), {
    message: "الرابط غير صالح",
  });

export const personalInfoSchema = z.object({
  fullNameAr: z.string().trim().min(3, "الاسم بالعربية مطلوب").max(160),
  fullNameEn: optionalText,
  academicEmail: optionalText,
  phone: optionalText,
  birthDate: optionalText,
  nationality: optionalText,
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  country: optionalText,
  city: optionalText,
  linkedinUrl: optionalUrl,
  portfolioUrl: optionalUrl,
  bio: z.string().trim().max(2000).optional(),
});

export const educationSchema = z.object({
  id: z.string().optional(),
  degree: z.enum(["HIGH_SCHOOL", "DIPLOMA", "BACHELOR", "MASTER", "PHD"]),
  major: optionalText,
  institution: z.string().trim().min(2, "اسم الجامعة أو المؤسسة مطلوب"),
  country: optionalText,
  graduationYear: z.coerce.number().int().min(1950).max(2100).optional(),
  gpaValue: z.coerce.number().min(0).max(100).optional(),
  gpaScale: z.coerce.number().refine((v) => [4, 5, 100].includes(v), "نظام تقييم غير مدعوم").optional(),
  honors: optionalText,
  thesisTitle: z.string().trim().max(1000).optional(),
  isCurrent: z.boolean().optional(),
});

export const experienceSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2, "المسمى الوظيفي مطلوب"),
  type: z.enum(["INTERNSHIP", "JOB", "RESEARCH", "VOLUNTEER"]),
  organization: z.string().trim().min(2, "جهة العمل أو المؤسسة مطلوبة"),
  country: optionalText,
  city: optionalText,
  startDate: optionalText,
  endDate: optionalText,
  isCurrent: z.boolean().optional(),
  description: z.string().trim().max(3000).optional(),
});

export const certificationSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2, "اسم الشهادة مطلوب"),
  issuer: optionalText,
  credentialId: optionalText,
  issueDate: optionalText,
  url: optionalUrl,
});

export const projectSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2, "عنوان المشروع أو الإنجاز مطلوب"),
  description: z.string().trim().max(3000).optional(),
  year: z.coerce.number().int().min(1950).max(2100).optional(),
  url: optionalUrl,
});

export const languageSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "اسم اللغة مطلوب"),
  proficiency: z.string().trim().min(2, "مستوى الإتقان مطلوب"),
  certificate: optionalText,
});

/* ============================================================
   الإعدادات
   ============================================================ */

export const privacySettingsSchema = z.object({
  profileVisible: z.boolean(),
  shareDataWithUniversities: z.boolean(),
});

export const notificationSettingsSchema = z.object({
  notifyNewMatches: z.boolean(),
  notifyApplicationStatus: z.boolean(),
  notifyNews: z.boolean(),
});

export const localeSettingsSchema = z.object({
  locale: z.enum(["ar", "en"]),
  timezone: z.string().min(2),
});

/* ============================================================
   المنح (لوحة الإدارة)
   ============================================================ */

export const scholarshipSchema = z.object({
  titleAr: z.string().trim().min(3, "اسم المنحة بالعربية مطلوب"),
  titleEn: optionalText,
  provider: z.string().trim().min(2, "الجهة المانحة مطلوبة"),
  universityName: optionalText,
  countryCode: z.string().trim().length(2, "رمز الدولة يتكوّن من حرفين"),
  countryNameAr: z.string().trim().min(2, "اسم الدولة مطلوب"),
  region: optionalText,
  fundingType: z.enum(["FULL", "PARTIAL", "TUITION_ONLY"]),
  languageRequirement: z.enum(["REQUIRED", "NOT_REQUIRED"]),
  status: z.enum(["DRAFT", "PENDING_REVIEW", "PUBLISHED", "EXPIRED", "ARCHIVED"]),
  description: z.string().trim().max(8000).optional(),
  applyUrl: optionalUrl,
  coverImageUrl: optionalText,
  logoUrl: optionalText,
  openDate: optionalText,
  deadline: optionalText,
  minGpa: z.coerce.number().min(0).max(100).optional(),
  gpaScale: z.coerce.number().optional(),
  acceptanceRate: z.coerce.number().min(0).max(100).optional(),
  isFeatured: z.boolean().optional(),
  levels: z.array(z.enum(["HIGH_SCHOOL", "DIPLOMA", "BACHELOR", "MASTER", "PHD"])).min(1, "اختر مستوى دراسي واحداً على الأقل"),
  majors: z.array(z.string().trim().min(1)).optional(),
  eligibility: z.array(z.string().trim().min(1)).optional(),
  documents: z.array(z.object({ name: z.string().trim().min(1), note: z.string().trim().optional() })).optional(),
  benefits: z.array(z.object({ title: z.string().trim().min(1), description: z.string().trim().optional(), icon: z.string().trim().optional() })).optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "الاسم مطلوب"),
  email: emailSchema,
  subject: optionalText,
  body: z.string().trim().min(10, "الرسالة قصيرة جداً"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ScholarshipInput = z.infer<typeof scholarshipSchema>;

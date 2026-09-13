import "dotenv/config";
import { PrismaClient, type DegreeLevel, type FundingType, type LanguageRequirement, type ScholarshipStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/** إزاحة بالأيام من اليوم */
function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(12, 0, 0, 0);
  return d;
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ıİ]/g, "i")
    .replace(/[øØ]/g, "o")
    .replace(/[ßẞ]/g, "ss")
    .replace(/[æÆ]/g, "ae")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

type SeedScholarship = {
  titleAr: string;
  titleEn: string;
  provider: string;
  universityName?: string;
  countryCode: string;
  countryNameAr: string;
  region: string;
  fundingType: FundingType;
  languageRequirement: LanguageRequirement;
  status?: ScholarshipStatus;
  deadlineInDays: number;
  levels: DegreeLevel[];
  majors: string[];
  minGpa?: number;
  gpaScale?: number;
  acceptanceRate?: number;
  isFeatured?: boolean;
  description: string;
  eligibility: string[];
  documents: { name: string; note?: string }[];
  benefits: { title: string; description: string; icon: string }[];
};

const FULL_FUNDING_BENEFITS = [
  {
    title: "تغطية كاملة",
    description: "إعفاء كامل من الرسوم الدراسية طوال فترة البرنامج.",
    icon: "Wallet",
  },
  {
    title: "تذاكر السفر",
    description: "تذاكر ذهاب وعودة بدرجة سياحية على حساب الجهة المانحة.",
    icon: "Plane",
  },
  {
    title: "راتب شهري",
    description: "مخصّص شهري كافٍ لتغطية المعيشة والسكن والتأمين الصحي.",
    icon: "Coins",
  },
];

const PARTIAL_FUNDING_BENEFITS = [
  {
    title: "تغطية جزئية للرسوم",
    description: "خصم يتراوح بين 50% و70% من الرسوم الدراسية.",
    icon: "Wallet",
  },
  {
    title: "تأمين صحي",
    description: "تغطية تأمين صحي أساسي طوال مدة الدراسة.",
    icon: "HeartPulse",
  },
];

const COMMON_DOCS = [
  { name: "السيرة الذاتية (CV)", note: "PDF" },
  { name: "السجلات الأكاديمية (Transcripts)", note: "مترجمة ومعتمدة" },
  { name: "خطابات التوصية", note: "من أكاديميين" },
  { name: "بيان الغرض الشخصي (SOP)", note: "1000 كلمة" },
  { name: "صورة جواز السفر", note: "سارية المفعول" },
];

const SCHOLARSHIPS: SeedScholarship[] = [
  {
    titleAr: "المنحة الحكومية التركية",
    titleEn: "Türkiye Bursları",
    provider: "الحكومة التركية",
    countryCode: "TR",
    countryNameAr: "تركيا",
    region: "أوروبا وآسيا",
    fundingType: "FULL",
    languageRequirement: "NOT_REQUIRED",
    deadlineInDays: 42,
    levels: ["BACHELOR", "MASTER", "PHD"],
    majors: ["الهندسة", "الطب", "العلوم الإنسانية", "إدارة الأعمال", "هندسة البرمجيات"],
    minGpa: 70,
    gpaScale: 100,
    acceptanceRate: 8,
    isFeatured: true,
    description:
      "المنحة الحكومية التركية من أوسع برامج المنح في العالم، تقدّمها الحكومة التركية للطلاب الدوليين في مختلف المراحل الدراسية. تشمل المنحة الرسوم الدراسية كاملة، والسكن، والتأمين الصحي، ومخصّصاً شهرياً، إضافة إلى سنة تحضيرية لتعلّم اللغة التركية.",
    eligibility: [
      "أن يكون المتقدّم من غير حاملي الجنسية التركية.",
      "ألا يتجاوز عمر المتقدّم 21 عاماً للبكالوريوس، و30 عاماً للماجستير، و35 عاماً للدكتوراه.",
      "الحصول على معدل لا يقل عن 70% للبكالوريوس والماجستير، و75% للدكتوراه.",
      "ألا يكون المتقدّم طالباً مسجّلاً حالياً في إحدى الجامعات التركية.",
    ],
    documents: COMMON_DOCS,
    benefits: FULL_FUNDING_BENEFITS,
  },
  {
    titleAr: "منحة DAAD الألمانية للدراسات العليا",
    titleEn: "DAAD Study Scholarships",
    provider: "الهيئة الألمانية للتبادل الأكاديمي (DAAD)",
    countryCode: "DE",
    countryNameAr: "ألمانيا",
    region: "أوروبا",
    fundingType: "FULL",
    languageRequirement: "REQUIRED",
    deadlineInDays: 64,
    levels: ["MASTER", "PHD"],
    majors: ["الهندسة", "علوم الحاسوب", "الذكاء الاصطناعي وتعلم الآلة", "العلوم الطبيعية", "الاقتصاد"],
    minGpa: 3.0,
    gpaScale: 4,
    acceptanceRate: 12,
    isFeatured: true,
    description:
      "تقدّم الهيئة الألمانية للتبادل الأكاديمي (DAAD) منحاً للدراسات العليا في الجامعات الألمانية للخريجين المتميّزين من مختلف دول العالم. تركّز المنحة على البرامج البحثية والتخصصات التقنية، وتشمل مخصّصاً شهرياً وتأميناً صحياً ودعماً لتكاليف السفر.",
    eligibility: [
      "الحصول على درجة البكالوريوس بتقدير جيد جداً على الأقل.",
      "ألا يكون قد مضى على التخرّج أكثر من ست سنوات.",
      "إتقان اللغة الإنجليزية أو الألمانية بما يتوافق مع لغة البرنامج.",
      "خبرة عملية لا تقل عن سنتين في بعض البرامج.",
    ],
    documents: COMMON_DOCS,
    benefits: FULL_FUNDING_BENEFITS,
  },
  {
    titleAr: "منحة تشيفينينغ البريطانية",
    titleEn: "Chevening Scholarships",
    provider: "وزارة الخارجية البريطانية",
    countryCode: "GB",
    countryNameAr: "المملكة المتحدة",
    region: "أوروبا",
    fundingType: "FULL",
    languageRequirement: "REQUIRED",
    deadlineInDays: 12,
    levels: ["MASTER"],
    majors: ["السياسات العامة", "إدارة الأعمال", "القانون", "الإعلام", "التنمية المستدامة"],
    minGpa: 3.2,
    gpaScale: 4,
    acceptanceRate: 3,
    isFeatured: true,
    description:
      "منحة تشيفينينغ هي برنامج المنح الرسمي للحكومة البريطانية، يستهدف القادة الواعدين من مختلف أنحاء العالم لدراسة الماجستير في الجامعات البريطانية. تركّز المنحة على القدرة القيادية وأثر المتقدّم المتوقّع في بلده بعد التخرّج.",
    eligibility: [
      "خبرة عملية لا تقل عن سنتين (2800 ساعة عمل).",
      "الحصول على درجة البكالوريوس بتقدير يؤهّل للالتحاق ببرنامج ماجستير بريطاني.",
      "التقديم على ثلاثة برامج ماجستير مختلفة في جامعات بريطانية.",
      "الالتزام بالعودة إلى بلد الجنسية لمدة سنتين بعد انتهاء المنحة.",
    ],
    documents: COMMON_DOCS,
    benefits: FULL_FUNDING_BENEFITS,
  },
  {
    titleAr: "برنامج فولبرايت الأمريكي",
    titleEn: "Fulbright Foreign Student Program",
    provider: "وزارة الخارجية الأمريكية",
    countryCode: "US",
    countryNameAr: "الولايات المتحدة",
    region: "أمريكا الشمالية",
    fundingType: "PARTIAL",
    languageRequirement: "REQUIRED",
    deadlineInDays: 95,
    levels: ["MASTER", "PHD"],
    majors: ["العلوم الاجتماعية", "الهندسة", "الصحة العامة", "علوم البيانات"],
    minGpa: 3.3,
    gpaScale: 4,
    acceptanceRate: 5,
    isFeatured: true,
    description:
      "برنامج فولبرايت من أعرق برامج التبادل الأكاديمي في العالم، يتيح للطلاب الدوليين إكمال دراساتهم العليا في الجامعات الأمريكية، مع التركيز على التبادل الثقافي والبحث العلمي.",
    eligibility: [
      "درجة البكالوريوس أو ما يعادلها من مؤسسة معترف بها.",
      "إتقان اللغة الإنجليزية مثبت بشهادة TOEFL أو IELTS.",
      "خبرة أكاديمية أو مهنية ذات صلة بالتخصص المطلوب.",
      "الالتزام بالعودة إلى البلد الأم بعد إتمام البرنامج.",
    ],
    documents: COMMON_DOCS,
    benefits: PARTIAL_FUNDING_BENEFITS,
  },
  {
    titleAr: "منحة الحكومة اليابانية MEXT",
    titleEn: "MEXT Japanese Government Scholarship",
    provider: "وزارة التعليم اليابانية",
    countryCode: "JP",
    countryNameAr: "اليابان",
    region: "آسيا",
    fundingType: "FULL",
    languageRequirement: "NOT_REQUIRED",
    deadlineInDays: 130,
    levels: ["BACHELOR", "MASTER", "PHD"],
    majors: ["الهندسة", "الروبوتات", "علوم الحاسوب", "الدراسات اليابانية", "الطب"],
    minGpa: 3.0,
    gpaScale: 4,
    acceptanceRate: 7,
    isFeatured: true,
    description:
      "تقدّم الحكومة اليابانية منحة MEXT للطلاب الدوليين للدراسة في الجامعات اليابانية. تشمل المنحة الرسوم الدراسية كاملة، ومخصّصاً شهرياً، وتذاكر الطيران، إضافة إلى دورة لغة يابانية تحضيرية.",
    eligibility: [
      "ألا يتجاوز عمر المتقدّم 35 عاماً.",
      "الحصول على معدل تراكمي مرتفع في المرحلة السابقة.",
      "الاستعداد لتعلّم اللغة اليابانية.",
      "عدم حمل الجنسية اليابانية.",
    ],
    documents: COMMON_DOCS,
    benefits: FULL_FUNDING_BENEFITS,
  },
  {
    titleAr: "منحة إيراسموس موندوس المشتركة",
    titleEn: "Erasmus Mundus Joint Masters",
    provider: "الاتحاد الأوروبي",
    countryCode: "EU",
    countryNameAr: "أوروبا (دول متعددة)",
    region: "أوروبا",
    fundingType: "FULL",
    languageRequirement: "REQUIRED",
    deadlineInDays: 78,
    levels: ["MASTER"],
    majors: ["علوم البيانات", "الاستدامة البيئية", "الهندسة", "الدراسات الأوروبية"],
    minGpa: 3.0,
    gpaScale: 4,
    acceptanceRate: 10,
    isFeatured: true,
    description:
      "برامج ماجستير مشتركة تُدرَّس في أكثر من جامعة أوروبية، بتمويل كامل من الاتحاد الأوروبي. يتنقّل الطالب بين دولتين أوروبيتين على الأقل خلال فترة الدراسة، ويحصل على شهادة مشتركة.",
    eligibility: [
      "درجة بكالوريوس في تخصص ذي صلة.",
      "إتقان اللغة الإنجليزية (IELTS 6.5 أو ما يعادلها).",
      "خطاب دافع يوضّح سبب اختيار البرنامج المشترك.",
      "خطابا توصية أكاديميان.",
    ],
    documents: COMMON_DOCS,
    benefits: FULL_FUNDING_BENEFITS,
  },
  {
    titleAr: "منحة الحكومة الكورية GKS",
    titleEn: "Global Korea Scholarship",
    provider: "المعهد الوطني للتعليم الدولي (NIIED)",
    countryCode: "KR",
    countryNameAr: "كوريا الجنوبية",
    region: "آسيا",
    fundingType: "FULL",
    languageRequirement: "NOT_REQUIRED",
    deadlineInDays: -20,
    levels: ["BACHELOR", "MASTER", "PHD"],
    majors: ["الهندسة", "الدراسات الكورية", "إدارة الأعمال", "علوم الحاسوب"],
    minGpa: 80,
    gpaScale: 100,
    acceptanceRate: 6,
    description:
      "منحة الحكومة الكورية للطلاب الدوليين، تغطّي الرسوم الدراسية والسكن والمخصّص الشهري، مع سنة تحضيرية لتعلّم اللغة الكورية.",
    eligibility: [
      "ألا يتجاوز العمر 25 عاماً للبكالوريوس و40 عاماً للدراسات العليا.",
      "معدل تراكمي لا يقل عن 80%.",
      "لياقة صحية تسمح بالدراسة في الخارج.",
      "عدم الحصول على منحة كورية حكومية سابقة.",
    ],
    documents: COMMON_DOCS,
    benefits: FULL_FUNDING_BENEFITS,
  },
  {
    titleAr: "منحة جامعة الملك عبدالله للعلوم والتقنية",
    titleEn: "KAUST Fellowship",
    provider: "جامعة الملك عبدالله للعلوم والتقنية",
    universityName: "جامعة الملك عبدالله للعلوم والتقنية (KAUST)",
    countryCode: "SA",
    countryNameAr: "السعودية",
    region: "الشرق الأوسط",
    fundingType: "FULL",
    languageRequirement: "REQUIRED",
    deadlineInDays: 55,
    levels: ["MASTER", "PHD"],
    majors: ["علوم الحاسوب", "الطاقة المتجددة المتقدمة", "علوم البحار", "الهندسة الكيميائية"],
    minGpa: 3.2,
    gpaScale: 4,
    acceptanceRate: 15,
    description:
      "منحة بحثية كاملة في جامعة الملك عبدالله للعلوم والتقنية، تشمل الرسوم والسكن والتأمين ومخصّصاً شهرياً سخياً، في بيئة بحثية عالمية المستوى.",
    eligibility: [
      "درجة بكالوريوس في تخصص علمي أو هندسي.",
      "معدل تراكمي 3.2 من 4.0 كحد أدنى.",
      "شهادة لغة إنجليزية (IELTS 6.5 أو TOEFL 79).",
      "خطاب دافع وخطة بحثية مختصرة.",
    ],
    documents: COMMON_DOCS,
    benefits: FULL_FUNDING_BENEFITS,
  },
  {
    titleAr: "منحة الرئيس لبرامج الدراسات العليا في جامعة هارفارد",
    titleEn: "Harvard Presidential Graduate Fellowship",
    provider: "جامعة هارفارد",
    universityName: "جامعة هارفارد",
    countryCode: "US",
    countryNameAr: "الولايات المتحدة",
    region: "أمريكا الشمالية",
    fundingType: "FULL",
    languageRequirement: "REQUIRED",
    deadlineInDays: 12,
    levels: ["MASTER", "PHD"],
    majors: [
      "الذكاء الاصطناعي وتعلم الآلة",
      "علوم البيانات الحيوية",
      "أخلاقيات التكنولوجيا والسياسات",
      "الطاقة المتجددة المتقدمة",
    ],
    minGpa: 3.6,
    gpaScale: 4,
    acceptanceRate: 50,
    isFeatured: true,
    description:
      "تُعد منحة الرئيس في جامعة هارفارد واحدة من أكثر المسارات الأكاديمية مرموقةً عالمياً، حيث تستهدف استقطاب النخبة المتفوّقة وإتاحة الفرصة لهم لقيادة أبحاث عالمية المستوى في مجالات المستقبل. تُغطّي المنحة كامل التكاليف الدراسية وتوفّر بيئة بحثية متكاملة ودعماً مالياً غير مشروط بعمل إضافي.",
    eligibility: [
      "الحصول على درجة البكالوريوس أو الماجستير بتقدير لا يقل عن ممتاز (أو ما يعادلها).",
      "اجتياز اختبار اللغة الإنجليزية بعلامة معتمدة (TOEFL بحد أدنى 100 أو IELTS بحد أدنى 7.5).",
      "تقديم خطة بحثية واضحة ومبتكرة تخدم التحديات العلمية المعاصرة.",
      "خلو السجل الأكاديمي من أي عقوبات تأديبية أو سوابق أكاديمية.",
    ],
    documents: [
      { name: "السيرة الذاتية (CV)", note: "PDF" },
      { name: "السجلات الأكاديمية (Transcripts)", note: "مترجمة ومعتمدة" },
      { name: "خطابات التوصية", note: "3 خطابات من أكاديميين" },
      { name: "بيان الغرض الشخصي (SOP)", note: "1000 كلمة" },
    ],
    benefits: FULL_FUNDING_BENEFITS,
  },
  {
    titleAr: "منحة الحكومة الكندية فانير",
    titleEn: "Vanier Canada Graduate Scholarships",
    provider: "الحكومة الكندية",
    countryCode: "CA",
    countryNameAr: "كندا",
    region: "أمريكا الشمالية",
    fundingType: "FULL",
    languageRequirement: "REQUIRED",
    deadlineInDays: 110,
    levels: ["PHD"],
    majors: ["الصحة العامة", "العلوم الطبيعية", "الهندسة", "العلوم الاجتماعية"],
    minGpa: 3.5,
    gpaScale: 4,
    acceptanceRate: 9,
    description:
      "منحة فانير الكندية موجّهة لطلاب الدكتوراه المتميّزين على مستوى العالم، وتركّز على التميّز الأكاديمي والقدرة البحثية والإمكانات القيادية.",
    eligibility: [
      "التسجيل في برنامج دكتوراه في جامعة كندية مؤهّلة.",
      "معدل تراكمي ممتاز في المرحلتين السابقتين.",
      "ترشيح من الجامعة الكندية المضيفة.",
      "سجل بحثي موثّق.",
    ],
    documents: COMMON_DOCS,
    benefits: FULL_FUNDING_BENEFITS,
  },
  {
    titleAr: "منحة الحكومة الأسترالية للتنمية",
    titleEn: "Australia Awards Scholarships",
    provider: "الحكومة الأسترالية",
    countryCode: "AU",
    countryNameAr: "أستراليا",
    region: "أوقيانوسيا",
    fundingType: "FULL",
    languageRequirement: "REQUIRED",
    deadlineInDays: 88,
    levels: ["MASTER", "PHD"],
    majors: ["التنمية المستدامة", "الصحة العامة", "الزراعة", "إدارة الأعمال"],
    minGpa: 3.0,
    gpaScale: 4,
    acceptanceRate: 11,
    description:
      "منح تقدّمها الحكومة الأسترالية للطلاب من الدول النامية، بهدف بناء القدرات وتعزيز الروابط التنموية. تشمل الرسوم كاملة والمعيشة والتأمين الصحي.",
    eligibility: [
      "أن يكون المتقدّم من إحدى الدول المؤهّلة للبرنامج.",
      "خبرة عملية لا تقل عن سنتين.",
      "شهادة لغة إنجليزية سارية.",
      "الالتزام بالعودة للبلد الأم بعد التخرّج.",
    ],
    documents: COMMON_DOCS,
    benefits: FULL_FUNDING_BENEFITS,
  },
  {
    titleAr: "منحة الحكومة الهولندية أورانج توليب",
    titleEn: "Orange Tulip Scholarship",
    provider: "نوفيك الهولندية (Nuffic)",
    countryCode: "NL",
    countryNameAr: "هولندا",
    region: "أوروبا",
    fundingType: "PARTIAL",
    languageRequirement: "REQUIRED",
    deadlineInDays: 33,
    levels: ["BACHELOR", "MASTER"],
    majors: ["إدارة الأعمال", "التصميم", "الهندسة", "العلوم الاجتماعية"],
    minGpa: 3.0,
    gpaScale: 4,
    acceptanceRate: 18,
    description:
      "منحة جزئية تقدّمها المؤسسات الهولندية للطلاب الدوليين، تغطّي جزءاً من الرسوم الدراسية في برامج البكالوريوس والماجستير.",
    eligibility: [
      "قبول مبدئي في إحدى الجامعات الهولندية المشاركة.",
      "شهادة لغة إنجليزية معتمدة.",
      "سجل أكاديمي جيد.",
      "خطاب دافع.",
    ],
    documents: COMMON_DOCS.slice(0, 4),
    benefits: PARTIAL_FUNDING_BENEFITS,
  },
  {
    titleAr: "منحة إيفل الفرنسية للتميّز",
    titleEn: "Eiffel Excellence Scholarship",
    provider: "وزارة أوروبا والشؤون الخارجية الفرنسية",
    countryCode: "FR",
    countryNameAr: "فرنسا",
    region: "أوروبا",
    fundingType: "FULL",
    languageRequirement: "NOT_REQUIRED",
    deadlineInDays: 25,
    levels: ["MASTER", "PHD"],
    majors: ["القانون", "الاقتصاد", "الهندسة", "العلوم السياسية"],
    minGpa: 3.2,
    gpaScale: 4,
    acceptanceRate: 14,
    description:
      "برنامج إيفل للتميّز يستقطب الطلاب الأجانب المتميّزين للدراسة في المؤسسات الفرنسية العليا، ويشمل مخصّصاً شهرياً وتذاكر سفر وتأميناً صحياً.",
    eligibility: [
      "ألا يتجاوز العمر 25 عاماً للماجستير و30 عاماً للدكتوراه.",
      "ترشيح من المؤسسة الفرنسية المضيفة.",
      "ألا يكون المتقدّم حاصلاً على منحة فرنسية سابقة.",
      "تفوّق أكاديمي واضح.",
    ],
    documents: COMMON_DOCS,
    benefits: FULL_FUNDING_BENEFITS,
  },
  {
    titleAr: "منحة الحكومة الصينية CSC",
    titleEn: "Chinese Government Scholarship",
    provider: "مجلس المنح الصيني (CSC)",
    countryCode: "CN",
    countryNameAr: "الصين",
    region: "آسيا",
    fundingType: "FULL",
    languageRequirement: "NOT_REQUIRED",
    deadlineInDays: 70,
    levels: ["BACHELOR", "MASTER", "PHD"],
    majors: ["الهندسة", "الطب", "الدراسات الصينية", "علوم الحاسوب", "التجارة الدولية"],
    minGpa: 75,
    gpaScale: 100,
    acceptanceRate: 20,
    description:
      "منحة شاملة تقدّمها الحكومة الصينية للطلاب الدوليين في مختلف المراحل، تغطّي الرسوم والسكن والتأمين ومخصّصاً شهرياً.",
    eligibility: [
      "ألا يتجاوز العمر 25 عاماً للبكالوريوس و35 للماجستير و40 للدكتوراه.",
      "صحة جيدة مثبتة بتقرير طبي.",
      "معدل تراكمي جيد.",
      "عدم حمل الجنسية الصينية.",
    ],
    documents: COMMON_DOCS,
    benefits: FULL_FUNDING_BENEFITS,
  },
  {
    titleAr: "منحة جامعة خان الإسبانية",
    titleEn: "Khan University Spain Scholarship",
    provider: "مؤسسة خان التعليمية",
    universityName: "جامعة خان",
    countryCode: "ES",
    countryNameAr: "إسبانيا",
    region: "أوروبا",
    fundingType: "PARTIAL",
    languageRequirement: "NOT_REQUIRED",
    deadlineInDays: 24,
    levels: ["MASTER"],
    majors: ["إدارة الأعمال", "السياحة والضيافة", "التصميم"],
    minGpa: 2.8,
    gpaScale: 4,
    acceptanceRate: 25,
    description:
      "منحة جزئية للدراسات العليا في إسبانيا، تركّز على برامج إدارة الأعمال والتخصصات الإبداعية، وتغطّي جزءاً من الرسوم الدراسية.",
    eligibility: [
      "درجة بكالوريوس معترف بها.",
      "معدل تراكمي لا يقل عن 2.8 من 4.0.",
      "خطاب دافع باللغة الإنجليزية أو الإسبانية.",
      "مقابلة شخصية عن بُعد.",
    ],
    documents: COMMON_DOCS.slice(0, 3),
    benefits: PARTIAL_FUNDING_BENEFITS,
  },
  {
    titleAr: "منحة الجامعة الماليزية الدولية",
    titleEn: "Malaysia International Scholarship",
    provider: "وزارة التعليم العالي الماليزية",
    countryCode: "MY",
    countryNameAr: "ماليزيا",
    region: "آسيا",
    fundingType: "PARTIAL",
    languageRequirement: "REQUIRED",
    deadlineInDays: 47,
    levels: ["MASTER", "PHD"],
    majors: ["التكنولوجيا الحيوية", "الهندسة", "تكنولوجيا المعلومات", "الاقتصاد الإسلامي"],
    minGpa: 3.0,
    gpaScale: 4,
    acceptanceRate: 22,
    description:
      "منحة ماليزية للطلاب الدوليين المتميّزين في برامج الدراسات العليا، تغطّي الرسوم الدراسية ومخصّصاً شهرياً جزئياً.",
    eligibility: [
      "ألا يتجاوز العمر 40 عاماً للماجستير و45 للدكتوراه.",
      "معدل تراكمي 3.0 من 4.0 كحد أدنى.",
      "IELTS 6.5 أو ما يعادلها.",
      "مقترح بحثي للمتقدّمين لبرامج البحث.",
    ],
    documents: COMMON_DOCS.slice(0, 4),
    benefits: PARTIAL_FUNDING_BENEFITS,
  },
  {
    titleAr: "منحة الحكومة الإيطالية للطلاب الدوليين",
    titleEn: "Italian Government Scholarship",
    provider: "وزارة الخارجية الإيطالية",
    countryCode: "IT",
    countryNameAr: "إيطاليا",
    region: "أوروبا",
    fundingType: "PARTIAL",
    languageRequirement: "NOT_REQUIRED",
    deadlineInDays: 6,
    levels: ["MASTER", "PHD"],
    majors: ["الفنون والتصميم", "الهندسة المعمارية", "الآثار", "الموسيقى"],
    minGpa: 2.9,
    gpaScale: 4,
    acceptanceRate: 19,
    description:
      "منحة تقدّمها الحكومة الإيطالية للطلاب الأجانب لدراسة الماجستير والدكتوراه ودورات اللغة الإيطالية، مع مخصّص شهري وإعفاء من الرسوم.",
    eligibility: [
      "ألا يتجاوز العمر 28 عاماً لبرامج الماجستير.",
      "شهادة لغة إيطالية أو إنجليزية حسب البرنامج.",
      "سجل أكاديمي جيد.",
      "ملف أعمال للتخصصات الفنية.",
    ],
    documents: COMMON_DOCS.slice(0, 4),
    benefits: PARTIAL_FUNDING_BENEFITS,
  },
  // --- منح بحالات إدارية مختلفة (مسودة / بانتظار المراجعة) ---
  {
    titleAr: "منحة مؤسسة المستقبل للبحث العلمي",
    titleEn: "Future Foundation Research Grant",
    provider: "مؤسسة المستقبل",
    countryCode: "AE",
    countryNameAr: "الإمارات",
    region: "الشرق الأوسط",
    fundingType: "PARTIAL",
    languageRequirement: "NOT_REQUIRED",
    status: "PENDING_REVIEW",
    deadlineInDays: 120,
    levels: ["MASTER", "PHD"],
    majors: ["الذكاء الاصطناعي وتعلم الآلة", "الفضاء", "الاستدامة البيئية"],
    description: "منحة بحثية لدعم مشاريع البحث في مجالات التقنيات الناشئة. البيانات قيد المراجعة.",
    eligibility: ["مقترح بحثي مفصّل.", "إشراف أكاديمي معتمد."],
    documents: COMMON_DOCS.slice(0, 3),
    benefits: PARTIAL_FUNDING_BENEFITS,
  },
  {
    titleAr: "منحة التميّز الرقمي",
    titleEn: "Digital Excellence Scholarship",
    provider: "مبادرة التحول الرقمي",
    countryCode: "QA",
    countryNameAr: "قطر",
    region: "الشرق الأوسط",
    fundingType: "TUITION_ONLY",
    languageRequirement: "NOT_REQUIRED",
    status: "DRAFT",
    deadlineInDays: 160,
    levels: ["BACHELOR"],
    majors: ["علوم الحاسوب", "الأمن السيبراني"],
    description: "مسودة منحة قيد الإعداد — بانتظار استكمال بيانات الجهة المانحة والمزايا.",
    eligibility: ["قيد الإعداد."],
    documents: [],
    benefits: [],
  },
];

async function main() {
  console.info("🌱 بدء تعبئة قاعدة البيانات…");

  // --- تنظيف البيانات السابقة ---
  await prisma.$transaction([
    prisma.aiToolRun.deleteMany(),
    prisma.aiTool.deleteMany(),
    prisma.cvAtsCheck.deleteMany(),
    prisma.cvOrderNote.deleteMany(),
    prisma.cvOrderEvent.deleteMany(),
    prisma.cvOrder.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.scholarshipMatch.deleteMany(),
    prisma.savedScholarship.deleteMany(),
    prisma.application.deleteMany(),
    prisma.document.deleteMany(),
    prisma.scholarshipBenefit.deleteMany(),
    prisma.scholarshipDocument.deleteMany(),
    prisma.scholarshipEligibility.deleteMany(),
    prisma.scholarshipMajor.deleteMany(),
    prisma.scholarshipLevel.deleteMany(),
    prisma.scholarship.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.contactMessage.deleteMany(),
    prisma.session.deleteMany(),
    prisma.verificationCode.deleteMany(),
    prisma.expertProfile.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const password = await bcrypt.hash("Menhity@2026", 12);

  /* ---------- المستخدمون ---------- */

  const admin = await prisma.user.create({
    data: {
      email: "admin@menhity.com",
      passwordHash: password,
      fullName: "أحمد محمد",
      role: "ADMIN",
      emailVerifiedAt: new Date(),
      acceptedTermsAt: new Date(),
    },
  });

  await prisma.user.create({
    data: {
      email: "moderator@menhity.com",
      passwordHash: password,
      fullName: "عمر السعيد",
      role: "MODERATOR",
      emailVerifiedAt: new Date(),
      acceptedTermsAt: new Date(),
    },
  });

  const expert = await prisma.user.create({
    data: {
      email: "expert@menhity.com",
      passwordHash: password,
      fullName: "عبد الرحمن النجار",
      role: "EXPERT",
      emailVerifiedAt: new Date(),
      acceptedTermsAt: new Date(),
      expertProfile: {
        create: {
          titlePrefix: "د.",
          specialization: "استشاري قبولات ومنح دولية",
          bio: "باحث ومستشار أكاديمي، أشرف على أكثر من 600 ملف تقديم لبرامج المنح الدولية.",
        },
      },
    },
  });

  const student = await prisma.user.create({
    data: {
      email: "student@menhity.com",
      passwordHash: password,
      fullName: "أحمد عبدالله",
      role: "STUDENT",
      phone: "+970 59 912 3456",
      emailVerifiedAt: new Date(),
      acceptedTermsAt: new Date(),
      profile: {
        create: {
          fullNameAr: "أحمد محمد عبدالله سالم",
          fullNameEn: "Ahmed Mohamed Abdullah Salem",
          academicEmail: "ahmed.salem@example.com",
          nationality: "فلسطيني",
          gender: "MALE",
          country: "فلسطين",
          city: "غزة",
          birthDate: new Date("1999-03-15"),
          linkedinUrl: "https://linkedin.com/in/ahmed-salem",
          portfolioUrl: "https://ahmedsalem.dev",
          headline: "طالب هندسة برمجيات",
          bio: "طالب هندسة برمجيات شغوف بالذكاء الاصطناعي وعلوم البيانات. أمتلك خبرة عملية في تطوير حلول الويب والمشاركة في المشاريع البحثية، وأطمح لإتمام دراساتي العليا عبر منحة دراسية متقدمة للإسهام في رقمنة الخدمات التعليمية.",
          educations: {
            create: [
              {
                degree: "BACHELOR",
                major: "هندسة البرمجيات",
                institution: "الجامعة الإسلامية بغزة",
                country: "فلسطين",
                graduationYear: 2027,
                gpaValue: 3.88,
                gpaScale: 4,
                honors: "امتياز مع مرتبة الشرف",
                isCurrent: true,
                thesisTitle:
                  "منصة رقمية ذكية لتحليل وتقييم فرص قبول المنح بالذكاء الاصطناعي",
                sortOrder: 0,
              },
              {
                degree: "HIGH_SCHOOL",
                major: "علمي",
                institution: "مدرسة دار العلوم",
                country: "فلسطين",
                graduationYear: 2017,
                gpaValue: 99,
                gpaScale: 100,
                sortOrder: 1,
              },
            ],
          },
          experiences: {
            create: [
              {
                title: "مطوّر برمجيات متدرّب وباحث مساعد",
                type: "RESEARCH",
                organization: "مركز الابتكار التكنولوجي الطلابي",
                country: "فلسطين",
                city: "غزة",
                startDate: new Date("2024-01-01"),
                isCurrent: true,
                description:
                  "المساهمة في بناء منصات ويب تفاعلية لخدمة أكثر من 3000 طالب وباحث، والمشاركة في إعداد وتوثيق أدوات الذكاء الاصطناعي التطبيقي.",
                sortOrder: 0,
              },
            ],
          },
          skills: {
            create: [
              { name: "Full-Stack Web (React/Node)" },
              { name: "Python & Data Analysis" },
              { name: "البحث العلمي والتوثيق الأكاديمي" },
              { name: "القيادة وإدارة المشاريع" },
              { name: "التعلم الآلي (Machine Learning)" },
            ],
          },
          languages: {
            create: [
              { name: "العربية", proficiency: "اللغة الأم" },
              { name: "الإنجليزية", proficiency: "متقدم (C1)", certificate: "IELTS 7.5" },
            ],
          },
          certifications: {
            create: [
              {
                title: "شهادة محترف الذكاء الاصطناعي (DeepLearning.AI)",
                issuer: "Coursera",
                credentialId: "DL-AI-2024-6891",
                issueDate: new Date("2024-06-01"),
              },
              {
                title: "شهادة اجتياز اختبار IELTS الأكاديمي بمعدل 7.5",
                issuer: "British Council",
                credentialId: "C1-Advanced",
                issueDate: new Date("2025-02-10"),
              },
            ],
          },
          projects: {
            create: [
              {
                title: "مشروع تخرّج حائز على جائزة التميّز للابتكار الرقمي",
                description:
                  "مشروع تخرّج تطبيقي حاز على المركز الأول في معرض مشاريع التخرّج الجامعية، واستخدمه أكثر من 1000 طالب وباحث في تسريع عمليات البحث والتقديم للمنح.",
                year: 2024,
              },
            ],
          },
          interests: {
            create: [{ name: "الذكاء الاصطناعي" }, { name: "علوم البيانات" }],
          },
        },
      },
    },
  });

  // طلاب إضافيون لتغذية إحصائيات لوحة الإدارة
  const extraStudents = [
    { name: "سارة علي", email: "sara@example.com", status: "ACTIVE" as const },
    { name: "محمد حسن", email: "mohamed@example.com", status: "INACTIVE" as const },
    { name: "لينا خالد", email: "lina@example.com", status: "SUSPENDED" as const },
    { name: "نور أحمد", email: "nour@example.com", status: "ACTIVE" as const },
    { name: "إيمان شعبان", email: "eman@example.com", status: "ACTIVE" as const },
  ];

  for (const s of extraStudents) {
    await prisma.user.create({
      data: {
        email: s.email,
        passwordHash: password,
        fullName: s.name,
        role: "STUDENT",
        status: s.status,
        suspendedAt: s.status === "SUSPENDED" ? new Date() : null,
        suspensionReason: s.status === "SUSPENDED" ? "مخالفة سياسة الاستخدام / تكرار الإرسال" : null,
        emailVerifiedAt: new Date(),
        acceptedTermsAt: new Date(),
        profile: { create: { fullNameAr: s.name } },
      },
    });
  }

  console.info(`✓ تم إنشاء ${extraStudents.length + 4} مستخدماً`);

  /* ---------- المنح ---------- */

  const createdScholarships = [];

  for (const s of SCHOLARSHIPS) {
    const status = s.status ?? (s.deadlineInDays < 0 ? "EXPIRED" : "PUBLISHED");

    const created = await prisma.scholarship.create({
      data: {
        slug: slugify(s.titleEn),
        titleAr: s.titleAr,
        titleEn: s.titleEn,
        provider: s.provider,
        universityName: s.universityName,
        countryCode: s.countryCode,
        countryNameAr: s.countryNameAr,
        region: s.region,
        fundingType: s.fundingType,
        languageRequirement: s.languageRequirement,
        status,
        description: s.description,
        deadline: daysFromNow(s.deadlineInDays),
        openDate: daysFromNow(s.deadlineInDays - 120),
        minGpa: s.minGpa,
        gpaScale: s.gpaScale,
        acceptanceRate: s.acceptanceRate,
        isFeatured: s.isFeatured ?? false,
        createdById: admin.id,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        viewsCount: Math.floor(Math.random() * 900) + 50,
        levels: { create: s.levels.map((level) => ({ level })) },
        majors: { create: s.majors.map((name) => ({ name })) },
        eligibility: {
          create: s.eligibility.map((text, i) => ({ text, sortOrder: i })),
        },
        documents: {
          create: s.documents.map((d, i) => ({ name: d.name, note: d.note, sortOrder: i })),
        },
        benefits: {
          create: s.benefits.map((b, i) => ({ ...b, sortOrder: i })),
        },
      },
      include: { levels: true, majors: true },
    });

    createdScholarships.push(created);
  }

  console.info(`✓ تم إنشاء ${createdScholarships.length} منحة`);

  /* ---------- المحفوظات والمطابقات والإشعارات ---------- */

  const turkey = createdScholarships.find((s) => s.countryCode === "TR")!;
  const daad = createdScholarships.find((s) => s.countryCode === "DE")!;
  const chevening = createdScholarships.find((s) => s.slug.includes("chevening"))!;
  const erasmus = createdScholarships.find((s) => s.countryCode === "EU")!;
  const fulbright = createdScholarships.find((s) => s.slug.includes("fulbright"))!;
  const gks = createdScholarships.find((s) => s.countryCode === "KR")!;

  await prisma.savedScholarship.createMany({
    data: [erasmus, fulbright, chevening].map((s) => ({
      userId: student.id,
      scholarshipId: s.id,
    })),
  });

  await prisma.scholarshipMatch.createMany({
    data: [
      { userId: student.id, scholarshipId: turkey.id, score: 92, reasons: ["المنحة متاحة لمستوى ماجستير، وهو المستوى التالي في مسارك الأكاديمي.", "لا تشترط هذه المنحة شهادة لغة، وهو ما يسهّل تقديمك.", "معدلك التراكمي يتجاوز الحد الأدنى المطلوب للمنحة."] },
      { userId: student.id, scholarshipId: daad.id, score: 88, reasons: ["تخصصك يتوافق مع مجال «علوم الحاسوب» المطلوب في المنحة.", "لديك شهادة لغة معتمدة تغطّي متطلبات المنحة."] },
      { userId: student.id, scholarshipId: chevening.id, score: 75, reasons: ["المنحة ممولة بالكامل، وتغطّي تكاليف الدراسة والمعيشة."] },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: student.id,
        type: "NEW_MATCH",
        title: "منحة جديدة تناسبك",
        body: "تم العثور على منحة جديدة تتوافق مع ملفك الأكاديمي.",
        badgeLabel: "مطابقة 92%",
        actionLabel: "عرض المنحة",
        actionUrl: `/scholarships/${turkey.slug}`,
        scholarshipId: turkey.id,
        createdAt: new Date(Date.now() - 2 * 3600_000),
      },
      {
        userId: student.id,
        type: "DEADLINE_REMINDER",
        title: "تذكير بموعد التقديم",
        body: "تبقّى وقت قصير على انتهاء التقديم لمنحة تشيفينينغ البريطانية.",
        badgeLabel: "ينتهي قريباً",
        actionLabel: "قدّم الآن",
        actionUrl: `/scholarships/${chevening.slug}`,
        scholarshipId: chevening.id,
        createdAt: new Date(Date.now() - 5 * 3600_000),
      },
      {
        userId: student.id,
        type: "DOCUMENT_REVIEWED",
        title: "اكتمال مراجعة المستندات بنجاح",
        body: "تم التحقق من سيرتك الذاتية ومستنداتك وجاهزيتها للتقديم بنجاح.",
        badgeLabel: "تم بنجاح",
        actionLabel: "استعراض الملف",
        actionUrl: "/dashboard/documents",
        readAt: new Date(),
        createdAt: new Date(Date.now() - 2 * 86_400_000),
      },
      {
        userId: student.id,
        type: "SAVED_UPDATED",
        title: "تحديث المحفوظات",
        body: "تم تحديث مقاعد التقديم والشروط المطلوبة في منحة محفوظة لديك.",
        badgeLabel: "محدّث",
        actionLabel: "عرض التفاصيل",
        actionUrl: "/dashboard/saved",
        readAt: new Date(),
        createdAt: new Date(Date.now() - 4 * 86_400_000),
      },
      {
        userId: student.id,
        type: "DEADLINE_PASSED",
        title: "انتهاء موعد التقديم لمنحة الحكومة الكورية GKS",
        body: "أُغلق باب استقبال الطلبات رسمياً لهذه الدورة. يمكنك تصفّح فرص بديلة متطابقة مع مؤهلاتك.",
        badgeLabel: "منتهية",
        actionLabel: "اكتشف منحاً بديلة",
        actionUrl: "/scholarships",
        scholarshipId: gks.id,
        readAt: new Date(),
        createdAt: new Date(Date.now() - 14 * 86_400_000),
      },
    ],
  });

  /* ---------- المستندات ---------- */

  await prisma.document.createMany({
    data: [
      {
        userId: student.id,
        kind: "CV",
        originalName: "Ahmed_CV_2026.pdf",
        storedName: "sample-cv.pdf",
        mimeType: "application/pdf",
        sizeBytes: 2_516_582,
        url: "/uploads/sample-cv.pdf",
      },
      {
        userId: student.id,
        kind: "MOTIVATION_LETTER",
        originalName: "Motivation_Letter.docx",
        storedName: "sample-letter.docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        sizeBytes: 1_153_433,
        url: "/uploads/sample-letter.docx",
      },
      {
        userId: student.id,
        kind: "TRANSCRIPT",
        originalName: "Transcripts_BSc.pdf",
        storedName: "sample-transcript.pdf",
        mimeType: "application/pdf",
        sizeBytes: 5_872_025,
        url: "/uploads/sample-transcript.pdf",
      },
    ],
  });

  /* ---------- أدوات الذكاء الاصطناعي ---------- */

  const tools = [
    { key: "cv-builder", nameAr: "إنشاء السيرة الذاتية", description: "إنشاء سيرة ذاتية احترافية بناءً على بيانات المستخدم.", icon: "FileUser", runs: 1420 },
    { key: "cv-enhancer", nameAr: "تحسين السيرة الذاتية", description: "تحليل السيرة الذاتية واقتراح تحسينات تجعلها أكثر احترافية وملاءمة للمنح.", icon: "Wand2", runs: 820 },
    { key: "letter-builder", nameAr: "إنشاء خطاب الدافع", description: "إنشاء خطاب دافع مخصص بناءً على معلومات المستند والمنحة التي يتقدّم إليها.", icon: "PenLine", runs: 1156 },
    { key: "letter-enhancer", nameAr: "تحسين خطاب الدافع", description: "تحليل خطاب الدافع واقتراح تحسينات على المحتوى والأسلوب ومدى ملاءمته للمنحة.", icon: "Sparkles", runs: 645 },
    { key: "profile-review", nameAr: "تقييم الملف الشخصي", description: "تقييم مدى جاهزية ملف المستخدم للتقديم وتحديد نقاط القوة والفجوات التي تحتاج إلى تحسين.", icon: "Star", runs: 1266 },
  ];

  const allStudents = await prisma.user.findMany({ where: { role: "STUDENT" } });

  for (const [i, t] of tools.entries()) {
    const tool = await prisma.aiTool.create({
      data: {
        key: t.key,
        nameAr: t.nameAr,
        description: t.description,
        icon: t.icon,
        sortOrder: i,
      },
    });

    // سجلّات استخدام حديثة لجدول "آخر الاستخدامات"
    for (let j = 0; j < 4; j++) {
      const user = allStudents[(i + j) % allStudents.length]!;
      const failed = i === 1 && j === 0;
      await prisma.aiToolRun.create({
        data: {
          toolId: tool.id,
          userId: user.id,
          status: failed ? "FAILED" : "SUCCESS",
          durationMs: 1200 + Math.floor(Math.random() * 3000),
          errorMessage: failed ? "انتهت مهلة الاتصال بمزوّد الذكاء الاصطناعي." : null,
          output: failed ? null : "ناتج تجريبي.",
          createdAt: new Date(Date.now() - (i * 4 + j) * 7 * 60_000),
        },
      });
    }
  }

  console.info(`✓ تم إنشاء ${tools.length} أدوات ذكاء اصطناعي`);

  /* ---------- طلب صياغة سيرة ذاتية ---------- */

  const order = await prisma.cvOrder.create({
    data: {
      orderNumber: "MNH-CV-8921",
      userId: student.id,
      expertId: expert.id,
      status: "IN_EXPERT_REVIEW",
      currentStep: 5,
      atsScore: 98,
      submittedAt: new Date(Date.now() - 6 * 3600_000),
      expectedDeliveryAt: new Date(Date.now() + 42 * 3600_000),
      dataSnapshot: { source: "seed" },
      timeline: {
        create: [
          {
            title: "استلام ومطابقة البيانات الأكاديمية والوثائق المدخلة",
            status: "DONE",
            sortOrder: 0,
            occurredAt: new Date(Date.now() - 6 * 3600_000),
          },
          {
            title: "المراجعة اليدوية وإعادة صياغة الإنجازات بلغة المنح الأكاديمية",
            status: "IN_PROGRESS",
            sortOrder: 1,
            occurredAt: new Date(Date.now() - 2 * 3600_000),
          },
          {
            title: "الفحص الدقيق لمعايير ATS والتنسيق الأكاديمي الدولي المعتمد",
            status: "PENDING",
            sortOrder: 2,
          },
          {
            title: "تسليم النسخة النهائية واعتمادها للتنزيل المباشر",
            status: "PENDING",
            sortOrder: 3,
          },
        ],
      },
      atsChecks: {
        create: [
          { label: "هيكلية نظيفة بنمط نصّي مقروء من قبل كافة برمجيات الفرز الدولية.", passed: true, sortOrder: 0 },
          { label: "صياغة الإنجازات باستخدام أفعال قوية ونتائج عددية واضحة.", passed: true, sortOrder: 1 },
          { label: "تطابق الكلمات المفتاحية مع معايير المنح البحثية العالمية (DAAD و Chevening).", passed: true, sortOrder: 2 },
          { label: "تضمين مؤشر الكفاءة اللغوية المعتمد دولياً (IELTS 7.5).", passed: true, sortOrder: 3 },
        ],
      },
    },
  });

  await prisma.cvOrderNote.create({
    data: {
      orderId: order.id,
      authorId: expert.id,
      body: "تم استلام ملفك وبدأت المراجعة. سأركّز على إبراز مشروع التخرّج والنتائج العددية.",
    },
  });

  console.info("✓ تم إنشاء طلب صياغة سيرة ذاتية تجريبي");

  /* ---------- رسائل تواصل ---------- */

  await prisma.contactMessage.createMany({
    data: [
      {
        name: "خالد يوسف",
        email: "khaled@example.com",
        subject: "استفسار عن المنحة التركية",
        body: "السلام عليكم، أرغب بمعرفة إن كانت المنحة التركية تقبل خريجي الدبلوم أم البكالوريوس فقط. شكراً لكم.",
      },
    ],
  });

  console.info("\n✅ اكتملت التعبئة بنجاح");
  console.info("──────────────────────────────────────");
  console.info("حسابات الدخول التجريبية (كلمة المرور: Menhity@2026)");
  console.info("  المدير    : admin@menhity.com");
  console.info("  المشرف    : moderator@menhity.com");
  console.info("  الخبير    : expert@menhity.com");
  console.info("  الطالب    : student@menhity.com");
  console.info("──────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ فشلت التعبئة:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

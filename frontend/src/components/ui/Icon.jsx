import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Bookmark,
  Building2,
  CalendarDays,
  ClipboardList,
  Coins,
  FileText,
  FileUser,
  Globe2,
  GraduationCap,
  Home,
  Languages,
  LayoutDashboard,
  LayoutGrid,
  HeartPulse,
  PenLine,
  Plane,
  Settings,
  Sparkles,
  Star,
  Target,
  UserRound,
  Users,
  Wallet,
  Wand2,
} from "lucide-react";

/**
 * سجل الأيقونات المسموح بها بالاسم.
 * الثوابت والـ API يخزّنان اسم الأيقونة كنص، ولا نستورد الحزمة كاملة
 * حتى لا تتضخّم حزمة البناء.
 */
const REGISTRY = {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Bookmark,
  Building2,
  CalendarDays,
  ClipboardList,
  Coins,
  FileText,
  FileUser,
  Globe2,
  GraduationCap,
  HeartPulse,
  Home,
  Languages,
  LayoutDashboard,
  LayoutGrid,
  PenLine,
  Plane,
  Settings,
  Sparkles,
  Star,
  Target,
  UserRound,
  Users,
  Wallet,
  Wand2,
};

export function Icon({ name, className, fallback = "Sparkles" }) {
  const Component = REGISTRY[name] ?? REGISTRY[fallback] ?? LayoutGrid;
  return <Component className={className} />;
}

/** أيقونات المنصات الاجتماعية — لم تعد ضمن حزمة lucide */
export function LinkedinIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.94 5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0ZM3.2 8.45h3.5V21H3.2V8.45Zm5.7 0h3.35v1.71h.05c.47-.85 1.6-1.75 3.3-1.75 3.53 0 4.18 2.2 4.18 5.06V21h-3.5v-6.05c0-1.44-.03-3.3-2.05-3.3-2.06 0-2.37 1.57-2.37 3.2V21H8.9V8.45Z" />
    </svg>
  );
}

export function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M14 9V7.2c0-.8.2-1.2 1.4-1.2H17V3h-2.6C11.2 3 10.2 4.6 10.2 7v2H8v3h2.2v9h3.8v-9h2.6l.4-3H14Z" />
    </svg>
  );
}

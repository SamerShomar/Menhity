import {
  BarChart3,
  Bell,
  Bookmark,
  CircleHelp,
  ClipboardList,
  FileText,
  FileUser,
  GraduationCap,
  LayoutDashboard,
  LayoutGrid,
  PenLine,
  Settings,
  Sparkles,
  Star,
  UserRound,
  Users,
  Wand2,
  type LucideIcon,
} from "lucide-react";

/** خريطة الأيقونات المستخدمة في ملفات الإعداد (الثوابت تخزّن الاسم كنص) */
const ICONS: Record<string, LucideIcon> = {
  BarChart3,
  Bell,
  Bookmark,
  CircleHelp,
  ClipboardList,
  FileText,
  FileUser,
  GraduationCap,
  LayoutDashboard,
  LayoutGrid,
  PenLine,
  Settings,
  Sparkles,
  Star,
  UserRound,
  Users,
  Wand2,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name] ?? LayoutGrid;
  return <Cmp className={className} />;
}

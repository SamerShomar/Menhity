import type { Metadata } from "next";
import {
  AlertTriangle,
  Globe,
  Laptop,
  Lock,
  Mail,
  MonitorSmartphone,
  ShieldCheck,
  Smartphone,
  Tablet,
} from "lucide-react";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  deactivateAccountAction,
  deleteAccountAction,
  revokeAllSessionsAction,
  revokeSessionAction,
} from "@/app/actions/settings";
import { timeAgoAr } from "@/lib/utils";

import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  ChangePasswordForm,
  DeleteAccountConfirm,
  LocaleForm,
  NotificationsForm,
  PrivacyForm,
} from "@/components/dashboard/settings-forms";

export const metadata: Metadata = { title: "الإعدادات" };

function DeviceIcon({ type }: { type: string | null }) {
  if (type === "mobile") return <Smartphone className="size-4" />;
  if (type === "tablet") return <Tablet className="size-4" />;
  return <Laptop className="size-4" />;
}

export default async function SettingsPage() {
  const current = await requireUser();

  const [user, sessions] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: current.id },
      select: {
        profileVisible: true,
        shareDataWithUniversities: true,
        notifyNewMatches: true,
        notifyApplicationStatus: true,
        notifyNews: true,
        locale: true,
        timezone: true,
      },
    }),
    prisma.session.findMany({
      where: { userId: current.id, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { lastActiveAt: "desc" },
    }),
  ]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink-900">الإعدادات</h1>
        <p className="mt-2 text-[13.5px] text-ink-500">
          إدارة تفضيلات الحساب والأمان الخاص بك.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        {/* ======================= العمود الرئيسي ======================= */}
        <div className="space-y-5">
          <Card>
            <CardHeader title="إعدادات الحساب" subtitle="تغيير كلمة المرور" icon={<Lock className="size-4" />} />
            <CardBody className="pt-4">
              <ChangePasswordForm />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="الخصوصية والأمان"
              icon={<ShieldCheck className="size-4" />}
            />
            <CardBody className="pt-2">
              <PrivacyForm
                profileVisible={user.profileVisible}
                shareDataWithUniversities={user.shareDataWithUniversities}
              />
            </CardBody>
          </Card>

          {/* --- الجلسات والأجهزة --- */}
          <Card>
            <CardHeader
              title="الجلسات والأجهزة النشطة"
              subtitle="الأجهزة التي سجّلت الدخول منها حالياً"
              icon={<MonitorSmartphone className="size-4" />}
            />
            <CardBody className="pt-4">
              <ul className="divide-y divide-ink-100">
                {sessions.map((session) => {
                  const isCurrent = session.id === current.sessionId;

                  return (
                    <li key={session.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-600">
                          <DeviceIcon type={session.deviceType} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-ink-800">
                            {session.browser ?? "متصفح غير معروف"}
                            {session.os ? ` (${session.os})` : ""}
                          </p>
                          <p className="truncate text-[11.5px] text-ink-400">
                            {session.ipAddress ?? "عنوان غير معروف"} · {timeAgoAr(session.lastActiveAt)}
                            {isCurrent && (
                              <span className="ms-1.5 font-bold text-[color:var(--color-success)]">
                                · نشط الآن
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <form action={revokeSessionAction} className="shrink-0">
                        <input type="hidden" name="id" value={session.id} />
                        <SubmitButton variant="ghost" size="sm" className="text-danger">
                          إنهاء
                        </SubmitButton>
                      </form>
                    </li>
                  );
                })}
              </ul>

              <form action={revokeAllSessionsAction} className="mt-4">
                <SubmitButton variant="outline" size="sm" pendingText="جارٍ الخروج…">
                  تسجيل الخروج من كافة الأجهزة
                </SubmitButton>
              </form>
            </CardBody>
          </Card>
        </div>

        {/* ======================= العمود الجانبي ======================= */}
        <div className="space-y-5">
          <Card>
            <CardHeader title="تنبيهات البريد" icon={<Mail className="size-4" />} />
            <CardBody className="pt-2">
              <NotificationsForm
                notifyNewMatches={user.notifyNewMatches}
                notifyApplicationStatus={user.notifyApplicationStatus}
                notifyNews={user.notifyNews}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="اللغة والمنطقة" icon={<Globe className="size-4" />} />
            <CardBody className="pt-4">
              <LocaleForm locale={user.locale} timezone={user.timezone} />
            </CardBody>
          </Card>

          {/* --- منطقة الخطر --- */}
          <div className="rounded-2xl border border-red-200 bg-white p-5">
            <h2 className="flex items-center gap-2 text-[14px] font-bold text-danger">
              <AlertTriangle className="size-4" />
              منطقة الخطر
            </h2>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-[12.5px] font-semibold text-ink-800">تعطيل الحساب مؤقتاً</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-500">
                  تعطيل مؤقت للحساب، يمكنك استعادته لاحقاً بتسجيل الدخول مجدداً.
                </p>
                <form action={deactivateAccountAction} className="mt-2">
                  <SubmitButton variant="outline" size="sm" fullWidth className="border-red-200 text-danger">
                    تعطيل الحساب مؤقتاً
                  </SubmitButton>
                </form>
              </div>

              <div className="border-t border-red-100 pt-4">
                <p className="text-[12.5px] font-semibold text-ink-800">حذف الحساب نهائياً</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-500">
                  حذف نهائي لا يمكن التراجع عنه لجميع بياناتك. اكتب كلمة «حذف» للتأكيد.
                </p>
                <form action={deleteAccountAction} className="mt-2">
                  <DeleteAccountConfirm />
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

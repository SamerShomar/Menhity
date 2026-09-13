import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

import { SITE } from "@/lib/constants";
import { Card, CardBody } from "@/components/ui/card";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description: "تواصل مع فريق منحتي للاستفسارات والاقتراحات والشراكات.",
};

export default function ContactPage() {
  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 text-center">
          <h1 className="font-display text-3xl font-extrabold text-navy-800">تواصل معنا</h1>
          <p className="mx-auto mt-3 max-w-xl text-[14px] leading-relaxed text-ink-500">
            لديك سؤال عن منحة، أو اقتراح لتحسين المنصة، أو ترغب بشراكة؟ اكتب لنا وسنرد عليك.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <Card>
            <CardBody>
              <ContactForm />
            </CardBody>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardBody className="space-y-4">
                <InfoRow icon={<Mail className="size-4" />} label="البريد الإلكتروني">
                  <a href={`mailto:${SITE.email}`} dir="ltr" className="hover:underline">
                    {SITE.email}
                  </a>
                </InfoRow>
                <InfoRow icon={<Phone className="size-4" />} label="الهاتف">
                  <span className="num">{SITE.phone}</span>
                </InfoRow>
                <InfoRow icon={<MapPin className="size-4" />} label="الموقع">
                  {SITE.address}
                </InfoRow>
              </CardBody>
            </Card>

            <div className="rounded-2xl border border-navy-100 bg-navy-50 p-5">
              <p className="text-[12.5px] leading-relaxed text-navy-800">
                نرد على الرسائل خلال يومي عمل. للاستفسارات العاجلة المتعلقة بمواعيد التقديم، يُفضّل
                مراجعة صفحة المنحة مباشرةً — فمواعيدها تُحدَّث أولاً بأول.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-navy-600">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] text-ink-400">{label}</p>
        <p className="mt-0.5 truncate text-[13px] font-semibold text-ink-800">{children}</p>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { FacebookIcon, InstagramIcon, LinkedinIcon } from "@/components/ui/social-icons";

import { FOOTER_LINKS, SITE } from "@/lib/constants";
import { LogoMark } from "@/components/ui/logo";

/**
 * فوتر موحّد لكل صفحات المنصة.
 * (ملف الواجهات كان يحوي نسختين مختلفتين — اعتُمدت النسخة الكاملة.)
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-800 text-white">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* --- الهوية --- */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <LogoMark tone="white" className="size-8" />
              <span className="font-display text-xl font-extrabold text-gold-400">{SITE.name}</span>
            </div>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-navy-200">
              {SITE.description}
            </p>
            <div className="mt-5 flex items-center gap-2">
              <SocialLink href={SITE.social.linkedin} label="لينكد إن">
                <LinkedinIcon className="size-4" />
              </SocialLink>
              <SocialLink href={SITE.social.instagram} label="إنستغرام">
                <InstagramIcon className="size-4" />
              </SocialLink>
              <SocialLink href={SITE.social.facebook} label="فيسبوك">
                <FacebookIcon className="size-4" />
              </SocialLink>
            </div>
          </div>

          {/* --- روابط سريعة --- */}
          <FooterColumn title="روابط سريعة" links={FOOTER_LINKS.quick} />

          {/* --- الدعم --- */}
          <FooterColumn title="الدعم" links={FOOTER_LINKS.support} />

          {/* --- معلومات التواصل --- */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-white">معلومات التواصل</h3>
            <ul className="space-y-3 text-[13px] text-navy-200">
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-gold-400" />
                <span className="num">{SITE.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-gold-400" />
                <a href={`mailto:${SITE.email}`} className="hover:text-white" dir="ltr">
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="size-4 shrink-0 text-gold-400" />
                <span>{SITE.address}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-5">
          <p className="text-center text-[12px] text-navy-300">
            © <span className="num">{year}</span> {SITE.name} — منصة المنح الدراسية. جميع الحقوق
            محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-bold text-white">{title}</h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link href={link.href} className="text-[13px] text-navy-200 transition-colors hover:text-gold-400">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-gold-400 hover:text-navy-900"
    >
      {children}
    </a>
  );
}

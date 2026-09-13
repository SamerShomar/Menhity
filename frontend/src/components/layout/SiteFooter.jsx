import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";

import { LogoMark, } from "@/components/ui/Logo";
import { FacebookIcon, InstagramIcon, LinkedinIcon } from "@/components/ui/Icon";
import { useMeta } from "@/context/MetaContext";
import { FOOTER_LINKS } from "@/lib/constants";

/**
 * فوتر موحّد لكل صفحات المنصة.
 * (ملف الواجهات كان يحوي نسختين مختلفتين — اعتُمدت النسخة الكاملة.)
 */
export function SiteFooter() {
  const { site } = useMeta();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-800 text-white">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <LogoMark tone="white" className="size-8" />
              <span className="font-display text-xl font-extrabold text-gold-400">{site.name}</span>
            </div>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-navy-200">{site.description}</p>

            <div className="mt-5 flex items-center gap-2">
              <SocialLink label="لينكد إن">
                <LinkedinIcon className="size-4" />
              </SocialLink>
              <SocialLink label="إنستغرام">
                <InstagramIcon className="size-4" />
              </SocialLink>
              <SocialLink label="فيسبوك">
                <FacebookIcon className="size-4" />
              </SocialLink>
            </div>
          </div>

          <FooterColumn title="روابط سريعة" links={FOOTER_LINKS.quick} />
          <FooterColumn title="الدعم" links={FOOTER_LINKS.support} />

          <div>
            <h3 className="mb-4 text-sm font-bold text-white">معلومات التواصل</h3>
            <ul className="space-y-3 text-[13px] text-navy-200">
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-gold-400" />
                <span className="num">{site.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-gold-400" />
                <a href={`mailto:${site.email}`} className="hover:text-white" dir="ltr">
                  {site.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="size-4 shrink-0 text-gold-400" />
                <span>{site.address}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-5">
          <p className="text-center text-[12px] text-navy-300">
            © <span className="num">{year}</span> {site.name} — منصة المنح الدراسية. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-bold text-white">{title}</h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.to + link.label}>
            <Link to={link.to} className="text-[13px] text-navy-200 transition-colors hover:text-gold-400">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({ label, children }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-gold-400 hover:text-navy-900"
    >
      {children}
    </a>
  );
}

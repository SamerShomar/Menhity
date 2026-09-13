import type { ReactNode } from "react";

/** قالب موحّد لصفحات النصوص القانونية والمساعدة */
export function LegalPage({
  title,
  updatedAt,
  intro,
  sections,
  children,
}: {
  title: string;
  updatedAt: string;
  intro?: string;
  sections?: { heading: string; body: ReactNode }[];
  children?: ReactNode;
}) {
  return (
    <div className="container-page py-14">
      <article className="mx-auto max-w-3xl">
        <header className="mb-8 border-b border-ink-200 pb-6">
          <h1 className="font-display text-3xl font-extrabold text-navy-800">{title}</h1>
          <p className="num mt-2 text-[12.5px] text-ink-400">آخر تحديث: {updatedAt}</p>
          {intro && <p className="mt-5 text-[14px] leading-loose text-ink-600">{intro}</p>}
        </header>

        {sections && (
          <div className="space-y-8">
            {sections.map((section, i) => (
              <section key={section.heading}>
                <h2 className="mb-3 text-[16px] font-bold text-ink-900">
                  <span className="num text-navy-500">{i + 1}. </span>
                  {section.heading}
                </h2>
                <div className="text-[13.5px] leading-loose text-ink-600">{section.body}</div>
              </section>
            ))}
          </div>
        )}

        {children}
      </article>
    </div>
  );
}

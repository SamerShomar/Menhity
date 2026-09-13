import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/ui/section";
import { Hero } from "@/components/home/hero";
import {
  AboutSection,
  AiToolsSection,
  Features,
  FinalCta,
  HowItWorks,
  StatsBand,
} from "@/components/home/sections";
import { FeaturedScholarshipCard } from "@/components/scholarships/scholarship-card";

export const revalidate = 300;

async function getHomeData() {
  const [scholarships, countries, majors, students, featured] = await Promise.all([
    prisma.scholarship.count({ where: { status: "PUBLISHED" } }),
    prisma.scholarship
      .findMany({
        where: { status: "PUBLISHED" },
        select: { countryCode: true },
        distinct: ["countryCode"],
      })
      .then((rows) => rows.length),
    prisma.scholarshipMajor
      .findMany({ select: { name: true }, distinct: ["name"] })
      .then((rows) => rows.length),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.scholarship.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ isFeatured: "desc" }, { deadline: "asc" }],
      take: 8,
      include: { levels: true },
    }),
  ]);

  return {
    stats: { scholarships, countries, majors, students },
    featured,
  };
}

export default async function HomePage() {
  const { stats, featured } = await getHomeData();

  return (
    <>
      <Hero />
      <StatsBand stats={stats} />
      <Features />
      <AiToolsSection />

      {/* --- اكتشف فرصتك القادمة --- */}
      {featured.length > 0 && (
        <section className="py-20">
          <div className="container-page">
            <SectionHeading
              title="اكتشف فرصتك القادمة"
              description="استكشف مجموعة من المنح الدراسية المميزة، واكتشف الفرص التي قد تكون مناسبة لطموحك الأكاديمي."
            />

            <div className="mt-12 -mx-4 overflow-x-auto px-4 pb-4 scrollbar-slim">
              <div className="flex gap-4">
                {featured.map((s) => (
                  <FeaturedScholarshipCard key={s.id} scholarship={s} />
                ))}
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/scholarships"
                className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-navy-700 underline-offset-4 hover:underline"
              >
                عرض جميع المنح
                <ArrowLeft className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <AboutSection />
      <HowItWorks />
      <FinalCta />
    </>
  );
}

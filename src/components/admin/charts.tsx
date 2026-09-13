import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";

/* ============================================================
   ألوان الرسوم
   سلسلة واحدة  → لون واحد (navy)، فلا حاجة إلى مفتاح ألوان.
   حالات المنح  → أربعة ألوان اجتازت فحص عمى الألوان والتباين،
                  مع تسمية مباشرة لكل شريحة كترميز ثانوي.
   ============================================================ */

export const STATUS_COLORS = {
  published: "#15803d",
  pending: "#b45309",
  draft: "#2b52ab",
  expired: "#b91c1c",
} as const;

const SERIES = "#1e3f8c";
const GRID = "#e2e7ee";

/* ============================================================
   قائمة أشرطة أفقية — تنمو من اليمين لليسار بحكم اتجاه الصفحة
   ============================================================ */

export function BarList({
  items,
  valueLabel,
  emptyText = "لا توجد بيانات.",
}: {
  items: { label: string; value: number; prefix?: string }[];
  valueLabel: string;
  emptyText?: string;
}) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-[13px] text-ink-400">{emptyText}</p>;
  }

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.label} className="group grid grid-cols-[9rem_1fr_3rem] items-center gap-3">
            <span className="truncate text-[12px] text-ink-600" title={item.label}>
              {item.prefix && <span className="me-1">{item.prefix}</span>}
              {item.label}
            </span>

            <span
              className="h-5 rounded-sm bg-ink-100"
              role="img"
              aria-label={`${item.label}: ${item.value} ${valueLabel}`}
            >
              <span
                className="block h-full rounded-s-[4px] transition-[filter] group-hover:brightness-110"
                style={{
                  width: `${Math.max(2, (item.value / max) * 100)}%`,
                  backgroundColor: SERIES,
                }}
                title={`${item.label}: ${item.value} ${valueLabel}`}
              />
            </span>

            <span className="num text-end text-[12px] font-bold text-ink-800">
              {formatNumber(item.value)}
            </span>
          </li>
        ))}
      </ul>

      <TableView
        caption={`جدول البيانات — ${valueLabel}`}
        head={["العنصر", valueLabel]}
        rows={items.map((i) => [i.label, formatNumber(i.value)])}
      />
    </>
  );
}

/* ============================================================
   شريط مكدّس لتوزيع الحالات — كل شريحة مسمّاة مباشرةً
   ============================================================ */

export function StatusBar({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) {
    return <p className="py-8 text-center text-[13px] text-ink-400">لا توجد بيانات.</p>;
  }

  return (
    <>
      {/* فجوة 2 بكسل بين الشرائح تفصلها بصرياً */}
      <div className="flex h-7 w-full gap-0.5 overflow-hidden rounded-lg">
        {segments
          .filter((s) => s.value > 0)
          .map((s) => (
            <span
              key={s.label}
              className="h-full transition-[filter] hover:brightness-110"
              style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }}
              title={`${s.label}: ${s.value} (${Math.round((s.value / total) * 100)}%)`}
            />
          ))}
      </div>

      {/* تسمية مباشرة لكل حالة — الهوية لا تعتمد على اللون وحده */}
      <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-[12px] text-ink-600">
              <span
                className="size-2.5 shrink-0 rounded-[3px]"
                style={{ backgroundColor: s.color }}
                aria-hidden="true"
              />
              {s.label}
            </span>
            <span className="num text-[12px] font-bold text-ink-800">
              {formatNumber(s.value)}
              <span className="ms-1 font-normal text-ink-400">
                ({Math.round((s.value / total) * 100)}%)
              </span>
            </span>
          </li>
        ))}
      </ul>

      <TableView
        caption="جدول البيانات — توزيع حالات المنح"
        head={["الحالة", "العدد", "النسبة"]}
        rows={segments.map((s) => [
          s.label,
          formatNumber(s.value),
          `${Math.round((s.value / total) * 100)}%`,
        ])}
      />
    </>
  );
}

/* ============================================================
   منحنى اتجاه زمني — سلسلة واحدة، الزمن يسير من اليمين لليسار
   ============================================================ */

export function TrendChart({
  points,
  valueLabel,
}: {
  points: { label: string; value: number }[];
  valueLabel: string;
}) {
  if (points.length < 2) {
    return <p className="py-8 text-center text-[13px] text-ink-400">لا توجد بيانات كافية.</p>;
  }

  const W = 680;
  const H = 180;
  const PAD = { top: 12, right: 8, bottom: 26, left: 34 };

  const max = Math.max(...points.map((p) => p.value), 1);
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  // الأقدم على اليمين والأحدث على اليسار، تماشياً مع اتجاه القراءة العربي
  const x = (i: number) => PAD.right + (innerW * (points.length - 1 - i)) / (points.length - 1);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.value)}`).join(" ");
  const area = `${line} L ${x(points.length - 1)} ${PAD.top + innerH} L ${x(0)} ${PAD.top + innerH} Z`;

  const ticks = [0, 0.5, 1].map((t) => Math.round(max * t));

  return (
    <>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`منحنى ${valueLabel} خلال ${points.length} يوماً`}
      >
        {/* شبكة خافتة */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.right}
              x2={W - PAD.left}
              y1={y(t)}
              y2={y(t)}
              stroke={GRID}
              strokeWidth="1"
            />
            <text
              x={W - PAD.left + 6}
              y={y(t) + 4}
              fontSize="10"
              fill="#94a2b8"
              textAnchor="start"
              className="num"
            >
              {t}
            </text>
          </g>
        ))}

        <path d={area} fill={SERIES} fillOpacity="0.08" />
        <path d={line} fill="none" stroke={SERIES} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {points.map((p, i) => (
          <g key={p.label}>
            <circle cx={x(i)} cy={y(p.value)} r="4" fill="#fff" stroke={SERIES} strokeWidth="2" />
            {/* هدف تمرير أوسع من النقطة نفسها */}
            <circle cx={x(i)} cy={y(p.value)} r="12" fill="transparent">
              <title>{`${p.label}: ${p.value} ${valueLabel}`}</title>
            </circle>
          </g>
        ))}

        {/* تسمية أول وآخر نقطة فقط بدل كل النقاط */}
        <text x={x(0)} y={H - 8} fontSize="10" fill="#94a2b8" textAnchor="middle">
          {points[0]!.label}
        </text>
        <text x={x(points.length - 1)} y={H - 8} fontSize="10" fill="#94a2b8" textAnchor="middle">
          {points[points.length - 1]!.label}
        </text>
      </svg>

      <TableView
        caption={`جدول البيانات — ${valueLabel}`}
        head={["اليوم", valueLabel]}
        rows={points.map((p) => [p.label, formatNumber(p.value)])}
      />
    </>
  );
}

/* ============================================================
   عرض جدولي بديل لكل رسم — لقارئات الشاشة ومن يفضّل الأرقام
   ============================================================ */

function TableView({
  caption,
  head,
  rows,
  className,
}: {
  caption: string;
  head: string[];
  rows: (string | number)[][];
  className?: string;
}) {
  return (
    <details className={cn("mt-4 border-t border-ink-100 pt-3", className)}>
      <summary className="cursor-pointer text-[11.5px] font-semibold text-ink-500 hover:text-navy-700">
        عرض البيانات كجدول
      </summary>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-start text-[11.5px]">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-ink-200">
              {head.map((h) => (
                <th key={h} scope="col" className="py-1.5 text-start font-bold text-ink-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className={cn("py-1.5 text-ink-700", j > 0 && "num")}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

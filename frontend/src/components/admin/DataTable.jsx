import { cn } from "@/lib/utils";
import { LoadingBlock } from "@/components/ui/Spinner";

/**
 * جدول بيانات إداري.
 * الأعمدة: { key, header, className, cell(row) }
 */
export function DataTable({ columns, rows, loading, empty = "لا توجد بيانات.", rowKey = (row) => row.id }) {
  if (loading) return <LoadingBlock />;

  if (!rows?.length) {
    return <p className="px-5 py-10 text-center text-[13px] text-ink-500">{empty}</p>;
  }

  return (
    <div className="overflow-x-auto scrollbar-slim">
      <table className="w-full min-w-[720px] border-collapse text-start">
        <thead>
          <tr className="border-b border-ink-900/10 bg-white/45">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "px-4 py-3 text-start text-[12px] font-bold whitespace-nowrap text-ink-500",
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-ink-900/10">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="transition hover:bg-white/50">
              {columns.map((column) => (
                <td key={column.key} className={cn("px-4 py-3.5 align-middle text-[13px]", column.className)}>
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

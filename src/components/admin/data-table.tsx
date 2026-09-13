import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DataTable({
  columns,
  children,
  empty,
  footer,
}: {
  columns: string[];
  children: ReactNode;
  empty?: boolean;
  footer?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-start">
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50">
              {columns.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className="px-4 py-3 text-start text-[11.5px] font-bold text-ink-500"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {empty ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-[13px] text-ink-400">
                  لا توجد بيانات لعرضها.
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>

      {footer && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 bg-ink-50 px-4 py-3">
          {footer}
        </div>
      )}
    </div>
  );
}

export function Td({
  children,
  className,
  colSpan,
}: {
  children: ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td colSpan={colSpan} className={cn("px-4 py-3 align-middle text-[12.5px] text-ink-700", className)}>
      {children}
    </td>
  );
}

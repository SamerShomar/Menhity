import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

export function LogoMark({ className }) {
  return (
    <img src="/logo.png" alt="" className={cn("size-9 object-contain", className)} />
  );
}

export function Logo({ tone = "navy", className, markClassName, to = "/" }) {
  return (
    <Link to={to} className={cn("inline-flex items-center gap-2", className)} aria-label="بَوْصلة">
      <LogoMark
        className={cn(
          "size-14",
          tone === "white" && "rounded-xl bg-white p-1",
          markClassName,
        )}
      />
    </Link>
  );
}

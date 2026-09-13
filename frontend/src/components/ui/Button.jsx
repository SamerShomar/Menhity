import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const VARIANTS = {
  primary: "bg-navy-700 text-white hover:bg-navy-800 active:bg-navy-900 shadow-sm disabled:bg-navy-300",
  gold: "bg-gold-400 text-navy-900 hover:bg-gold-300 active:bg-gold-500 shadow-sm font-bold",
  outline: "border border-ink-300 bg-white text-ink-800 hover:border-navy-400 hover:text-navy-700",
  ghost: "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
  danger: "bg-[color:var(--color-danger)] text-white hover:brightness-110 active:brightness-95",
  soft: "bg-navy-50 text-navy-700 hover:bg-navy-100",
};

const SIZES = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5 rounded-lg",
  md: "h-11 px-5 text-sm gap-2 rounded-[10px]",
  lg: "h-12 px-6 text-base gap-2.5 rounded-xl",
};

const BASE =
  "inline-flex items-center justify-center font-semibold transition-all duration-150 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500 " +
  "disabled:cursor-not-allowed disabled:opacity-60 select-none";

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  loading,
  loadingText,
  className,
  children,
  disabled,
  ...props
}) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {loading ? (loadingText ?? "جارٍ المعالجة…") : children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  external,
  to,
  ...props
}) {
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className);

  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={classes} {...props}>
      {children}
    </Link>
  );
}

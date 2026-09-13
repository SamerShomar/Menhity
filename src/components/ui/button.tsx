import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "gold" | "outline" | "ghost" | "danger" | "soft";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-navy-700 text-white hover:bg-navy-800 active:bg-navy-900 shadow-sm disabled:bg-navy-300",
  gold: "bg-gold-400 text-navy-900 hover:bg-gold-300 active:bg-gold-500 shadow-sm font-bold",
  outline:
    "border border-ink-300 bg-white text-ink-800 hover:border-navy-400 hover:text-navy-700",
  ghost: "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
  danger: "bg-danger text-white hover:brightness-110 active:brightness-95",
  soft: "bg-navy-50 text-navy-700 hover:bg-navy-100",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5 rounded-lg",
  md: "h-11 px-5 text-sm gap-2 rounded-[10px]",
  lg: "h-12 px-6 text-base gap-2.5 rounded-xl",
};

const BASE =
  "inline-flex items-center justify-center font-semibold transition-all duration-150 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500 " +
  "disabled:cursor-not-allowed disabled:opacity-60 select-none";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  ...props
}: CommonProps & ComponentProps<"button">) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
      {...props}
    >
      {children}
    </Link>
  );
}

import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
};

export function Button({ href, children, variant = "primary", className }: ButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue",
        variant === "primary"
          ? "bg-ink text-white hover:bg-blue"
          : "border border-border bg-surface text-ink hover:border-ink",
        className,
      )}
    >
      {children}
    </Link>
  );
}

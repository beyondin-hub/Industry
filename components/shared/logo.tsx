import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
  variant = "dark",
}: {
  className?: string;
  href?: string;
  variant?: "dark" | "light";
}) {
  const textColor = variant === "light" ? "text-white" : "text-ink-900";
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2", className)}>
      <span className="relative flex size-8 items-center justify-center rounded-lg gradient-accent shadow-sm">
        <span className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/20" />
        <span className="font-display text-base font-extrabold leading-none text-white">N</span>
      </span>
      <span className={cn("font-display text-lg font-extrabold tracking-tight", textColor)}>
        Novak<span className="text-safety">.</span>
      </span>
    </Link>
  );
}

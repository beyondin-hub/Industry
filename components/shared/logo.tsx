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
  const textColor = variant === "light" ? "text-white" : "text-steel-900";
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2", className)}>
      <span className="relative flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-steel-700 to-steel-900 shadow-sm">
        <span className="absolute inset-0 rounded-md ring-1 ring-inset ring-white/10" />
        <svg viewBox="0 0 24 24" className="size-5 text-safety" fill="none">
          <path
            d="M12 2.5 4 7v10l8 4.5 8-4.5V7l-8-4.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="2.4" fill="currentColor" />
        </svg>
      </span>
      <span className={cn("text-lg font-extrabold tracking-tight", textColor)}>
        MRO<span className="text-safety">Link</span>
      </span>
    </Link>
  );
}

import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type AlertTone = "error" | "warning" | "success" | "info";

const tones: Record<AlertTone, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
};

export function Alert({
  children,
  tone = "info",
  className,
}: {
  children: ReactNode;
  tone?: AlertTone;
  className?: string;
}) {
  return <div className={cn("rounded-lg border px-3 py-2 text-sm", tones[tone], className)}>{children}</div>;
}

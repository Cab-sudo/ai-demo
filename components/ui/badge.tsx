import { cn } from "@/lib/utils";
export function Badge({ className, variant = "default", ...p }: any) {
  const variants: Record<string, string> = {
    default: "bg-primary/10 text-primary",
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", variants[variant], className)} {...p} />;
}

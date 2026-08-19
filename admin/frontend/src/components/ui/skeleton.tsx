import { cn } from "@/lib/utils";

/** Placeholder mientras carga, para que el layout no salte al llegar los datos. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-lg bg-white/[0.06]", className)} {...props} />;
}

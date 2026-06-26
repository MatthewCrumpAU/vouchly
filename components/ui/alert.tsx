import { cn } from "@/lib/utils";

export function Alert({ kind = "error", children }: { kind?: "error" | "success"; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className={cn(
      "rounded-lg border px-3 py-2 text-sm",
      kind === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-green-200 bg-green-50 text-green-700"
    )}>
      {children}
    </div>
  );
}

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "success" | "error";
type Toast = { id: number; title: string; description?: string; variant: Variant };

const ToastContext = React.createContext<{
  toast: (t: Omit<Toast, "id">) => void;
} | null>(null);

/** Envuelve la app para poder llamar a useToast() desde cualquier pantalla. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((t: Omit<Toast, "id">) => {
    setToasts((prev) => [...prev, { ...t, id: Date.now() + Math.random() }]);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right" duration={4000}>
        {children}
        {toasts.map(({ id, title, description, variant }) => (
          <ToastPrimitive.Root
            key={id}
            onOpenChange={(open) => !open && dismiss(id)}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-sm",
              "data-[state=open]:animate-in data-[state=open]:slide-in-from-right-full",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out",
              variant === "success"
                ? "border-emerald-500/20 bg-emerald-500/10"
                : "border-red-500/20 bg-red-500/10"
            )}
          >
            {variant === "success" ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-400" />
            ) : (
              <XCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
            )}
            <div className="min-w-0">
              <ToastPrimitive.Title className="text-sm font-medium text-white">
                {title}
              </ToastPrimitive.Title>
              {description && (
                <ToastPrimitive.Description className="mt-0.5 text-xs text-gray-400">
                  {description}
                </ToastPrimitive.Description>
              )}
            </div>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-50 flex w-full max-w-sm flex-col gap-2 p-6 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast necesita estar dentro de <ToastProvider>");
  return ctx;
}

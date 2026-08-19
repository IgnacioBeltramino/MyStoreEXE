import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Select nativo estilizado: Radix Select no esta entre las dependencias y
 *  para un desplegable simple el nativo ya trae accesibilidad y teclado. */
const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "flex h-9 w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-1 pr-9 text-sm text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
          // Las <option> las pinta el sistema operativo: sin esto quedan
          // blancas sobre blanco en Windows.
          "[&>option]:bg-[#12121e] [&>option]:text-white",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
      />
    </div>
  )
);
Select.displayName = "Select";

export { Select };

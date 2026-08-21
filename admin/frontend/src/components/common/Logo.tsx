import { cn } from "@/lib/utils";

/**
 * Marca de MyStoreEXE. Unico lugar donde vive el logo.
 *
 * Cuando este listo el definitivo, se reemplaza el <svg> de abajo (o se cambia
 * por un <img src={...} />) y queda actualizado en el login, el sidebar y donde
 * se use. No copiar la marca a mano en otras pantallas.
 */
export function Logo({
  className,
  size = 22,
  conTexto = true,
}: {
  className?: string;
  size?: number;
  conTexto?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-white", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        {/* Frente del local */}
        <rect x="3" y="9.5" width="18" height="11.5" rx="2.5" className="fill-blue-500" />
        {/* Toldo */}
        <path
          d="M2.5 9.5 4.9 4.6A2 2 0 0 1 6.7 3.5h10.6a2 2 0 0 1 1.8 1.1l2.4 4.9"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Puerta */}
        <path d="M9.6 21v-4.4a2.4 2.4 0 0 1 4.8 0V21" className="stroke-white/70" strokeWidth="1.6" />
      </svg>
      {conTexto && (
        <span className="text-[17px] font-bold tracking-tight">
          MyStore<span className="text-blue-400">EXE</span>
        </span>
      )}
    </span>
  );
}

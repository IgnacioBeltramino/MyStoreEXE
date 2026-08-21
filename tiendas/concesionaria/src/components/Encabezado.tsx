import type { Perfil } from "@/lib/api";

export function Encabezado({ perfil }: { perfil: Perfil | null }) {
  const nombre = perfil?.business_name ?? "Concesionaria";

  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-navy-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5 lg:px-8">
        <a href="#" className="flex min-w-0 items-center gap-2.5">
          {perfil?.logo_url ? (
            <img src={perfil.logo_url} alt={nombre} className="h-7 w-auto shrink-0" />
          ) : (
            <MarcaGenerica />
          )}
          <span className="truncate text-[15px] font-semibold tracking-tight text-white">
            {nombre}
          </span>
        </a>

        <nav className="flex items-center gap-1 text-sm">
          <a
            href="#catalogo"
            className="rounded-lg px-3 py-2 text-gray-300 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            Autos
          </a>
          <a
            href="#contacto"
            className="rounded-lg px-3 py-2 text-gray-300 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            Contacto
          </a>
        </nav>
      </div>
    </header>
  );
}

/** Marca por defecto para cuando la tienda todavia no cargo su logo. */
function MarcaGenerica() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <rect x="3" y="9.5" width="18" height="11.5" rx="2.5" className="fill-blue-500" />
      <path
        d="M2.5 9.5 4.9 4.6A2 2 0 0 1 6.7 3.5h10.6a2 2 0 0 1 1.8 1.1l2.4 4.9"
        stroke="#ffffff"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

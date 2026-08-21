import { useState } from "react";
import type { Categoria, Producto } from "@/lib/api";
import { formatearPrecio, linkWhatsapp } from "@/lib/format";

/**
 * La ficha tecnica es libre, asi que la tarjeta no puede asumir que existe
 * "Año" o "Kilometros": muestra las primeras filas que haya, sean las que sean.
 * Si la tienda vende ropa y carga "Talle" y "Color", se ve igual de bien.
 */
const FILAS_VISIBLES = 4;

export function AutoCard({
  producto,
  categoria,
  whatsapp,
  indice,
}: {
  producto: Producto;
  categoria: Categoria | undefined;
  whatsapp: string | null;
  indice: number;
}) {
  const [fotoRota, setFotoRota] = useState(false);
  const portada = producto.images[0];
  const ficha = producto.attributes.slice(0, FILAS_VISIBLES);

  return (
    <article
      className="surgir group flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-navy-850 transition-colors duration-200 hover:border-white/[0.14]"
      style={{ animationDelay: `${Math.min(indice, 5) * 60}ms` }}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-navy-800">
        {portada && !fotoRota ? (
          <img
            src={portada.url}
            alt={portada.alt ?? producto.name}
            loading="lazy"
            onError={() => setFotoRota(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            Sin foto
          </div>
        )}

        {categoria && (
          <span className="absolute left-3 top-3 rounded-full bg-navy-950/80 px-2.5 py-1 text-xs font-medium text-blue-200 backdrop-blur-sm">
            {categoria.name}
          </span>
        )}

        {producto.images.length > 1 && (
          <span className="absolute right-3 top-3 rounded-full bg-navy-950/80 px-2.5 py-1 text-xs font-medium text-gray-300 backdrop-blur-sm">
            {producto.images.length} fotos
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold leading-snug text-white">{producto.name}</h3>

        <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-white">
          {formatearPrecio(producto.price)}
        </p>

        {ficha.length > 0 && (
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-white/[0.06] pt-4">
            {ficha.map((fila) => (
              <div key={fila.label} className="min-w-0">
                <dt className="truncate text-[11px] uppercase tracking-wide text-gray-500">
                  {fila.label}
                </dt>
                <dd className="truncate text-sm text-gray-200">{fila.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {producto.description && (
          <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-gray-400">
            {producto.description}
          </p>
        )}

        {/* mt-auto en el contenedor para que el boton quede pegado abajo en
            todas las tarjetas de la fila, aunque una tenga descripcion mas
            larga que la otra. El pt-5 garantiza el aire minimo. */}
        {whatsapp && (
          <div className="mt-auto pt-5">
            <a
              href={linkWhatsapp(whatsapp, `Hola! Me interesa el ${producto.name}. Sigue disponible?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-600 px-4 py-2.5 text-sm font-medium text-white transition-[background-color,transform] duration-150 hover:bg-[#33457a] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-850"
            >
              <IconoWhatsapp />
              Consultar
            </a>
          </div>
        )}
      </div>
    </article>
  );
}

function IconoWhatsapp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23Z" />
    </svg>
  );
}

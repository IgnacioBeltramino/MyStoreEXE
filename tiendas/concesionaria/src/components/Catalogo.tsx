import { useMemo, useState } from "react";
import type { Categoria, Perfil, Producto } from "@/lib/api";
import { AutoCard } from "./AutoCard";

const TODOS = "todos";

export function Catalogo({
  productos,
  categorias,
  perfil,
}: {
  productos: Producto[];
  categorias: Categoria[];
  perfil: Perfil | null;
}) {
  const [filtro, setFiltro] = useState<number | typeof TODOS>(TODOS);

  const porId = useMemo(
    () => new Map(categorias.map((c) => [c.id, c])),
    [categorias]
  );

  // Solo se ofrecen filtros que tengan al menos un auto: una categoria vacia
  // en la barra es una promesa que termina en una pantalla sin resultados.
  const conAutos = useMemo(
    () => categorias.filter((c) => productos.some((p) => p.category_id === c.id)),
    [categorias, productos]
  );

  const visibles = useMemo(
    () => (filtro === TODOS ? productos : productos.filter((p) => p.category_id === filtro)),
    [productos, filtro]
  );

  return (
    <section id="catalogo" className="mx-auto max-w-6xl scroll-mt-16 px-6 py-16 lg:px-8 lg:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Nuestros autos
          </h2>
          <p className="mt-1.5 text-sm text-gray-400">
            {visibles.length} {visibles.length === 1 ? "unidad" : "unidades"}
            {filtro !== TODOS && porId.get(filtro) ? ` en ${porId.get(filtro)!.name}` : ""}
          </p>
        </div>

        {conAutos.length > 0 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoria">
            <Chip activo={filtro === TODOS} onClick={() => setFiltro(TODOS)}>
              Todos
            </Chip>
            {conAutos.map((categoria) => (
              <Chip
                key={categoria.id}
                activo={filtro === categoria.id}
                onClick={() => setFiltro(categoria.id)}
              >
                {categoria.name}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {visibles.length === 0 ? (
        <p className="mt-12 rounded-2xl border border-white/[0.07] bg-navy-850 p-12 text-center text-sm text-gray-400">
          No hay unidades publicadas en este momento.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((producto, i) => (
            <AutoCard
              key={producto.id}
              producto={producto}
              categoria={producto.category_id ? porId.get(producto.category_id) : undefined}
              whatsapp={perfil?.whatsapp ?? null}
              indice={i}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function Chip({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 " +
        (activo
          ? "border-transparent bg-white text-navy-950"
          : "border-white/[0.12] text-gray-300 hover:border-white/25 hover:text-white")
      }
    >
      {children}
    </button>
  );
}

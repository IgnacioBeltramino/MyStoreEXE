import { Link } from "react-router-dom";
import { AlertCircle, ArrowUpRight, Check, ChevronRight, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useStats } from "@/hooks/useStats";

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useStats();

  // Solo tres metricas, y las tres son numeros. El estado del perfil no es una
  // metrica: es texto, y ponerlo en la misma fila obligaba a que "Completo"
  // compitiera en tamano con un "4". Se muestra arriba, al lado del nombre.
  const metricas = [
    { label: "Productos activos", value: data?.active_products ?? 0, to: "/products" },
    { label: "Categorias", value: data?.active_categories ?? 0, to: "/categories" },
    {
      label: "Sin categoria",
      value: data?.uncategorized_products ?? 0,
      to: "/products",
      // El ambar solo aparece si hay algo que corregir. Un cero no es un problema.
      alerta: (data?.uncategorized_products ?? 0) > 0,
    },
  ];

  const pendientes = [
    {
      mostrar: data ? !data.profile_complete : false,
      to: "/profile",
      icon: Store,
      texto: "Completa el perfil de tu tienda",
    },
    {
      mostrar: data ? data.uncategorized_products > 0 : false,
      to: "/products",
      icon: AlertCircle,
      texto: data
        ? `Tenes ${data.uncategorized_products} ${
            data.uncategorized_products === 1 ? "producto sin categoria" : "productos sin categoria"
          }`
        : "",
    },
  ].filter((p) => p.mostrar);

  if (isError) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <p className="text-sm text-gray-400">No pudimos cargar los datos de tu tienda.</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* El nombre del negocio es el titulo. "Dashboard" no le dice nada a nadie:
          el comerciante quiere ver su tienda, no la palabra dashboard. */}
      <header className="surgir">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">Tu tienda</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-2">
          {isLoading ? (
            <Skeleton className="h-9 w-56" />
          ) : (
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              {data?.store_name || "Tu tienda"}
            </h1>
          )}
          {!isLoading && data && <ChipPerfil completo={data.profile_complete} />}
        </div>
      </header>

      {/* Una sola superficie dividida por hairlines, no cuatro tarjetas sueltas:
          se lee como un tablero y no como cajas apiladas. */}
      <section
        className="surgir grid grid-cols-1 divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/[0.06] bg-[#0f0f1a] sm:grid-cols-3 sm:divide-x sm:divide-y-0"
        style={{ animationDelay: "60ms" }}
      >
        {metricas.map(({ label, value, to, alerta }) => (
          <Link
            key={label}
            to={to}
            className="group relative px-5 py-6 transition-colors duration-150 hover:bg-white/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
          >
            <p className="text-[13px] font-medium text-gray-400">{label}</p>
            {isLoading ? (
              <Skeleton className="mt-2.5 h-9 w-16" />
            ) : (
              <p
                className={cn(
                  "mt-2 text-4xl font-semibold tabular-nums tracking-tight",
                  alerta ? "text-amber-400" : "text-white"
                )}
              >
                {value}
              </p>
            )}
            <ArrowUpRight
              size={15}
              aria-hidden
              className="absolute right-4 top-5 text-gray-500 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            />
          </Link>
        ))}
      </section>

      {/* Solo aparece cuando hay algo que hacer, para no ocupar espacio al pedo. */}
      {!isLoading && pendientes.length > 0 && (
        <section className="surgir" style={{ animationDelay: "120ms" }}>
          <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">
            Para terminar de configurar
          </h2>
          <div className="mt-3 divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/[0.06] bg-[#0f0f1a]">
            {pendientes.map(({ to, icon: Icon, texto }) => (
              <Link
                key={texto}
                to={to}
                className="group flex items-center gap-3 px-5 py-3.5 transition-colors duration-150 hover:bg-white/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
              >
                <Icon size={16} aria-hidden className="shrink-0 text-amber-400" />
                <span className="flex-1 text-sm text-gray-300 group-hover:text-white">{texto}</span>
                <ChevronRight
                  size={16}
                  aria-hidden
                  className="shrink-0 text-gray-600 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-gray-400"
                />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ChipPerfil({ completo }: { completo: boolean }) {
  if (completo) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-gray-300">
        <Check size={12} aria-hidden className="text-emerald-400" />
        Perfil completo
      </span>
    );
  }
  return (
    <Link
      to="/profile"
      className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <AlertCircle size={12} aria-hidden />
      Perfil incompleto
    </Link>
  );
}

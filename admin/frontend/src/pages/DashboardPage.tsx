import { Link } from "react-router-dom";
import { AlertCircle, ShoppingBag, Store, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStats } from "@/hooks/useStats";

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useStats();

  const tarjetas = [
    {
      label: "Productos activos",
      value: data?.active_products ?? 0,
      icon: ShoppingBag,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border border-blue-500/20",
      to: "/products",
    },
    {
      label: "Categorias",
      value: data?.active_categories ?? 0,
      icon: Tag,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border border-emerald-500/20",
      to: "/categories",
    },
    {
      label: "Sin categoria",
      value: data?.uncategorized_products ?? 0,
      icon: AlertCircle,
      color: "text-orange-400",
      bg: "bg-orange-500/10 border border-orange-500/20",
      to: "/products",
    },
    {
      label: "Perfil",
      value: data?.profile_complete ? "Completo" : "Incompleto",
      icon: Store,
      color: "text-violet-400",
      bg: "bg-violet-500/10 border border-violet-500/20",
      to: "/profile",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {data?.store_name ? `Resumen de ${data.store_name}` : "Resumen de tu tienda"}
        </p>
      </div>

      {isError ? (
        <Card>
          <CardContent className="p-10 text-center">
            <p className="text-sm text-gray-400">No pudimos cargar los datos de tu tienda.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tarjetas.map(({ label, value, icon: Icon, color, bg, to }) => (
            <Link key={label} to={to} className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <Card className="h-full hover:border-white/[0.12] transition-all duration-200 hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`${bg} ${color} p-3 rounded-xl`}>
                    <Icon size={22} />
                  </div>
                  <div className="min-w-0">
                    {isLoading ? (
                      <Skeleton className="h-8 w-14" />
                    ) : (
                      <p className="text-2xl font-bold text-white truncate">{value}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Solo aparece cuando hay algo que hacer, para no ocupar espacio al pedo. */}
      {!isLoading && !isError && data && (data.uncategorized_products > 0 || !data.profile_complete) && (
        <Card>
          <CardHeader>
            <CardTitle>Para terminar de configurar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!data.profile_complete && (
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Store size={15} />
                Completa el perfil de tu tienda
              </Link>
            )}
            {data.uncategorized_products > 0 && (
              <Link
                to="/products"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors"
              >
                <AlertCircle size={15} />
                Tenes {data.uncategorized_products}{" "}
                {data.uncategorized_products === 1 ? "producto sin categoria" : "productos sin categoria"}
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

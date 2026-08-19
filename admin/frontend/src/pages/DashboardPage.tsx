import { ShoppingBag, Tag, Store, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "Productos activos", value: "—", icon: ShoppingBag, color: "text-blue-400", bg: "bg-blue-500/10 border border-blue-500/20" },
  { label: "Categorias", value: "—", icon: Tag, color: "text-emerald-400", bg: "bg-emerald-500/10 border border-emerald-500/20" },
  { label: "Tienda", value: "Online", icon: Store, color: "text-violet-400", bg: "bg-violet-500/10 border border-violet-500/20" },
  { label: "Visitas hoy", value: "—", icon: TrendingUp, color: "text-orange-400", bg: "bg-orange-500/10 border border-orange-500/20" },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen de tu tienda</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="hover:border-white/[0.12] transition-all duration-200 hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`${bg} ${color} p-3 rounded-xl`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bienvenido a tu panel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">
            Desde aca podes gestionar el perfil de tu tienda, tus categorias y productos. Los cambios se reflejan en tiempo real en tu landing page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
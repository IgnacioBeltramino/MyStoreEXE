import { NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, Tag, Store, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/profile", icon: Store, label: "Mi Tienda" },
  { to: "/categories", icon: Tag, label: "Categorias" },
  { to: "/products", icon: ShoppingBag, label: "Productos" },
];

export function Sidebar() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-60 flex flex-col bg-[#060609] border-r border-white/[0.05] z-10">
      <div className="px-6 py-6 border-b border-white/[0.05]">
        <span className="text-lg font-bold tracking-tight text-white">
          MyStore<span className="text-blue-400">EXE</span>
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-gray-500 hover:bg-white/[0.04] hover:text-gray-200"
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/[0.05]">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-white/[0.04] hover:text-red-400 transition-all duration-150"
        >
          <LogOut size={18} />
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}
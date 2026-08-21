import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#08080f] flex">
      <Sidebar />
      {/* El contenido va limitado a max-w-6xl: sin tope, en un monitor ancho
          los inputs y las filas de la tabla se estiran a mas de 1100px y
          cuesta leerlas de una punta a la otra. */}
      <main className="flex-1 ml-60 relative z-[1]">
        <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
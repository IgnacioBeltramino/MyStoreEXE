import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#08080f] flex">
      <Sidebar />
      <main className="flex-1 ml-60 p-8 relative z-[1]">
        <Outlet />
      </main>
    </div>
  );
}
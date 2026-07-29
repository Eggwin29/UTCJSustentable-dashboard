import { useState } from "react";
import { Outlet } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/sidebar/Sidebar";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* TopBar en la parte superior */}
      <TopBar onToggleSidebar={handleToggleSidebar} />

      {/* Contenedor Flex: el Sidebar y el Main comparten el espacio de forma natural */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

        {/* El Main crece de forma fluida (flex-1) conforme el Sidebar entra o sale */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full transition-all duration-300 ease-in-out">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
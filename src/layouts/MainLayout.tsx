import { useState } from "react";
import { Outlet } from "react-router-dom";

import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/sidebar/Sidebar";

import { useScrollToHash } from "@/hooks/useScrollToHash";

export default function MainLayout() {
  useScrollToHash();

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const handleToggleSidebar = () => {
    setSidebarOpen(
      (previous) => !previous
    );
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100">
      <TopBar
        onToggleSidebar={
          handleToggleSidebar
        }
      />

      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={handleCloseSidebar}
        />

        <main
          data-main-scroll-container
          className="w-full flex-1 overflow-y-auto p-6 transition-all duration-300 ease-in-out md:p-8"
        >
          <div className="mx-auto max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
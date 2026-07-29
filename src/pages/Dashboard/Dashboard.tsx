// src/pages/Dashboard/Dashboard.tsx

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Encabezado de la página */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Bienvenido al panel principal.
        </p>
      </div>

      {/* Tarjeta de prueba para visualizar tu paleta y esquinas redondeadas */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h2 className="text-base font-semibold text-slate-800 mb-2">
          ¡El Layout está funcionando! 🎉
        </h2>
        <p className="text-sm text-slate-600">
          La <strong>TopBar</strong> está arriba, el <strong>Sidebar</strong> a la izquierda (resaltando "Dashboard" en verde <code>emerald-600</code>), y este contenido vive dentro del <code>&lt;Outlet /&gt;</code> sobre el fondo <code>slate-100</code>.
        </p>
      </div>
    </div>
  );
}
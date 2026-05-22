import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Box,
  FileInput,
  Users,
  BarChart3,
  LogOut,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/inventario', label: 'Inventario', icon: Box },
  { to: '/recepciones', label: 'Recepciones', icon: FileInput },
  { to: '/proveedores', label: 'Proveedores', icon: Users },
  { to: '/reportes', label: 'Reportes', icon: BarChart3 },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-60 flex-col bg-[#115e59]">
      <div className="flex flex-col items-center gap-1 border-b border-teal-600/30 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-400/20">
          <span className="text-lg font-bold text-teal-300">CS</span>
        </div>
        <span className="mt-2 text-base font-semibold tracking-wide text-white">
          Clinical Sanctuary
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-teal-300/70">
          Pharmacy Management
        </span>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-l-[3px] border-teal-300 bg-teal-700/50 text-white'
                  : 'text-teal-100/70 hover:bg-teal-700/30 hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-teal-600/30 p-3">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-teal-100/60 transition-colors hover:bg-teal-700/30 hover:text-white">
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

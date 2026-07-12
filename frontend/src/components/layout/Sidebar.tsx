import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Box,
  Inbox,
  Users,
  BarChart2,
  Wrench,
  LogOut,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/inventario', label: 'Inventario', icon: Box },
  { to: '/recepciones', label: 'Recepciones', icon: Inbox },
  { to: '/pacientes', label: 'Pacientes', icon: Users },
  { to: '/compras', label: 'Compras', icon: BarChart2 },
  { to: '/gestion', label: 'Gestion', icon: Wrench },
];

function getStoredUser() {
  try {
    const perfilRaw = localStorage.getItem('healthgrid_perfil');
    const userRaw = localStorage.getItem('healthgrid_user');
    const perfil = perfilRaw ? JSON.parse(perfilRaw) : null;
    const user = userRaw ? JSON.parse(userRaw) : null;
    const nombre = perfil?.nombreCompleto ?? user?.nombre ?? 'Usuario';
    const cargo = perfil?.cargo ?? user?.rol ?? '';
    const initials = nombre.split(' ').slice(0, 2).map((w: string) => w[0] ?? '').join('').toUpperCase() || 'U';
    return { nombre, cargo, initials };
  } catch {
    return { nombre: 'Usuario', cargo: '', initials: 'U' };
  }
}

export default function Sidebar() {
  const navigate = useNavigate();
  const { nombre, cargo, initials } = getStoredUser();

  const handleLogout = () => {
    localStorage.removeItem('healthgrid_token');
    localStorage.removeItem('healthgrid_user');
    localStorage.removeItem('healthgrid_perfil');
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-52 flex-col bg-brand">
      {/* Logo */}
      <div className="flex flex-col items-start gap-0.5 border-b border-white/10 px-5 py-5">
        <span className="font-serif text-2xl font-bold leading-tight text-white">
          Health Grid
        </span>
        <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-green-300/60">
          Portal Farmacéutico
        </span>
      </div>

      {/* Nav */}
      <nav className="mt-3 flex flex-1 flex-col gap-0.5 px-2.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-light text-white'
                  : 'text-white/60 hover:bg-brand-light/60 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${isActive ? 'text-green-300' : 'text-white/50'}`} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card at bottom */}
      <div className="border-t border-white/10 p-3">
        <NavLink
          to="/perfil"
          className="mb-2 flex w-full items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-brand-light/60"
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{nombre}</p>
            <p className="truncate text-[11px] text-white/50">{cargo}</p>
          </div>
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/50 transition-colors hover:bg-brand-light/60 hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Box,
  Inbox,
  Users,
  BarChart2,
  Wrench,
  LogOut,
  ExternalLink,
  Loader2,
  ChevronDown,
  Grid2x2,
} from 'lucide-react';
import { hasPermiso } from '../../utils/permisos';
import { getSsoTicket } from '../../api/auth';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, permiso: 'farmacia:dashboard:read' },
  { to: '/inventario', label: 'Inventario', icon: Box, permiso: 'farmacia:inventario:read' },
  { to: '/recepciones', label: 'Recepciones', icon: Inbox, permiso: 'farmacia:recepciones:read' },
  { to: '/pacientes', label: 'Pacientes', icon: Users, permiso: 'farmacia:pacientes:read' },
  { to: '/compras', label: 'Compras', icon: BarChart2, permiso: 'farmacia:compras:read' },
  { to: '/gestion', label: 'Gestion', icon: Wrench, permiso: 'farmacia:gestion:read' },
];

// Base de la ruta de callback SSO de cada módulo (sin el ticket, se arma al vuelo).
// La de Monitoreo redirige a /login en vez de / porque así lo pide ese módulo.
const otrosModulos = [
  { label: 'HCE', url: 'https://healthgrid-hce-frontend-olive.vercel.app/auth/sso' },
  { label: 'Turnos', url: 'https://turnos.solefrancisco.com/auth/sso' },
  { label: 'Laboratorio', url: 'https://modulo-laboratorio.up.railway.app/auth/sso' },
  { label: 'Imágenes', url: 'https://uade-da-2-frontend.vercel.app/auth/sso' },
  { label: 'Internaciones', url: 'https://internaciones-y-camas.vercel.app/auth/sso' },
  { label: 'Facturación', url: 'https://modulo7-frontend.onrender.com/auth/sso' },
  { label: 'Portal Paciente', url: 'https://da2frontend.onrender.com/auth/sso' },
  { label: 'Monitoreo', url: 'https://dzp5goz8czibt.cloudfront.net/auth/sso', redirect: '/login' },
  { label: 'Core', url: 'https://healthgrid.cantero.ar/auth/sso' },
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
  const [navegandoA, setNavegandoA] = useState<string | null>(null);
  const [otrosModulosAbierto, setOtrosModulosAbierto] = useState(false);

  // Si el navegador restaura esta página desde el bfcache (ej. al volver con "atrás"
  // luego de la redirección SSO), React recupera el estado tal como quedó antes de
  // salir — con el spinner de "navegando" trabado. pageshow con persisted=true detecta
  // justo ese caso y lo resetea.
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setNavegandoA(null);
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('healthgrid_token');
    localStorage.removeItem('healthgrid_user');
    localStorage.removeItem('healthgrid_perfil');
    navigate('/login');
  };

  const handleIrAModulo = async (mod: typeof otrosModulos[number]) => {
    if (navegandoA) return; // evita doble click mientras pide el ticket
    try {
      setNavegandoA(mod.label);
      const { ticket } = await getSsoTicket();
      const redirect = mod.redirect ?? '/';
      window.location.href = `${mod.url}?ticket=${encodeURIComponent(ticket)}&redirect=${encodeURIComponent(redirect)}`;
    } catch {
      setNavegandoA(null);
      // El ticket falló (sesión vencida, Core caído, etc.) — nos quedamos donde estamos.
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-52 flex-col bg-brand">
      {/* Logo */}
      <div className="flex flex-col items-start gap-0.5 border-b border-white/10 px-5 py-5">
        <span className="font-serif text-2xl font-bold leading-tight text-white">
          Health Grid
        </span>
        <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-green-300/60">
          Sistema Hospitalario
        </span>
        <span className="font-serif text-xs italic tracking-wide text-gray-300/70">
          Farmacia
        </span>
      </div>

      {/* Nav */}
      <nav
        className="mt-3 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {navItems.filter(({ permiso }) => hasPermiso(permiso)).map(({ to, label, icon: Icon }) => (
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

        {/* Otros módulos de Health Grid (SSO saliente) — desplegable */}
        <div className="mt-4">
          <button
            onClick={() => setOtrosModulosAbierto((v) => !v)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/60 transition-colors hover:bg-brand-light/60 hover:text-white"
          >
            <Grid2x2 className="h-[18px] w-[18px] flex-shrink-0 text-white/50" />
            <span className="flex-1">Módulos</span>
            <ChevronDown
              className={`h-4 w-4 flex-shrink-0 text-white/40 transition-transform ${otrosModulosAbierto ? 'rotate-180' : ''}`}
            />
          </button>

          {otrosModulosAbierto && (
            <div className="mt-0.5 flex flex-col gap-0.5 pl-3">
              {otrosModulos.map((mod) => (
                <button
                  key={mod.label}
                  onClick={() => handleIrAModulo(mod)}
                  disabled={navegandoA !== null}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-white/60 transition-colors hover:bg-brand-light/60 hover:text-white disabled:opacity-50"
                >
                  {navegandoA === mod.label
                    ? <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-white/50" />
                    : <ExternalLink className="h-4 w-4 flex-shrink-0 text-white/50" />
                  }
                  {mod.label}
                </button>
              ))}
            </div>
          )}
        </div>
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

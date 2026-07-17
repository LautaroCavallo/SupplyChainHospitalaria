import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import SsoCallback from './pages/SsoCallback';
import Dashboard from './pages/Dashboard';
import Inventario from './pages/Inventario';
import InventarioDetalle from './pages/InventarioDetalle';
import HistorialLote from './pages/HistorialLote';
import Recepciones from './pages/Recepciones';
import NuevaRecepcion from './pages/NuevaRecepcion';
import EditarRecepcion from './pages/EditarRecepcion';
import Pacientes from './pages/Pacientes';
import Compras from './pages/Compras';
import Gestion from './pages/Gestion';
import Perfil from './pages/Perfil';
import ActividadReciente from './pages/ActividadReciente';
import { hasPermiso } from './utils/permisos';

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!localStorage.getItem('healthgrid_token')) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function RequirePermiso({ permiso, children }: { permiso: string; children: React.ReactNode }) {
  if (!hasPermiso(permiso)) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold text-gray-700">Acceso restringido</p>
        <p className="text-sm text-gray-500">No tenés permiso para ver esta sección.</p>
      </div>
    );
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/sso" element={<SsoCallback />} />
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="/" element={<RequirePermiso permiso="farmacia:dashboard:read"><Dashboard /></RequirePermiso>} />
        <Route path="/inventario" element={<RequirePermiso permiso="farmacia:inventario:read"><Inventario /></RequirePermiso>} />
        <Route path="/inventario/:id" element={<RequirePermiso permiso="farmacia:inventario:read"><InventarioDetalle /></RequirePermiso>} />
        <Route path="/inventario/:medicamentoId/lotes/:loteId/historial" element={<RequirePermiso permiso="farmacia:inventario:read"><HistorialLote /></RequirePermiso>} />
        <Route path="/recepciones" element={<RequirePermiso permiso="farmacia:recepciones:read"><Recepciones /></RequirePermiso>} />
        <Route path="/recepciones/nueva" element={<RequirePermiso permiso="farmacia:recepciones:write"><NuevaRecepcion /></RequirePermiso>} />
        <Route path="/recepciones/:id/editar" element={<RequirePermiso permiso="farmacia:recepciones:write"><EditarRecepcion /></RequirePermiso>} />
        <Route path="/pacientes" element={<RequirePermiso permiso="farmacia:pacientes:read"><Pacientes /></RequirePermiso>} />
        <Route path="/compras" element={<RequirePermiso permiso="farmacia:compras:read"><Compras /></RequirePermiso>} />
        <Route path="/gestion" element={<RequirePermiso permiso="farmacia:gestion:read"><Gestion /></RequirePermiso>} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/actividad" element={<RequirePermiso permiso="farmacia:dashboard:read"><ActividadReciente /></RequirePermiso>} />
      </Route>
    </Routes>
  );
}

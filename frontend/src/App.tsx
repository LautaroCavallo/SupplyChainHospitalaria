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

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!localStorage.getItem('healthgrid_token')) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/sso" element={<SsoCallback />} />
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/inventario/:id" element={<InventarioDetalle />} />
        <Route path="/inventario/:medicamentoId/lotes/:loteId/historial" element={<HistorialLote />} />
        <Route path="/recepciones" element={<Recepciones />} />
        <Route path="/recepciones/nueva" element={<NuevaRecepcion />} />
        <Route path="/recepciones/:id/editar" element={<EditarRecepcion />} />
        <Route path="/pacientes" element={<Pacientes />} />
        <Route path="/compras" element={<Compras />} />
        <Route path="/gestion" element={<Gestion />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/actividad" element={<ActividadReciente />} />
      </Route>
    </Routes>
  );
}

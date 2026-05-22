import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Inventario from './pages/Inventario';
import InventarioDetalle from './pages/InventarioDetalle';
import Recepciones from './pages/Recepciones';
import NuevaRecepcion from './pages/NuevaRecepcion';
import Proveedores from './pages/Proveedores';
import Reportes from './pages/Reportes';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/inventario/:id" element={<InventarioDetalle />} />
        <Route path="/recepciones" element={<Recepciones />} />
        <Route path="/recepciones/nueva" element={<NuevaRecepcion />} />
        <Route path="/proveedores" element={<Proveedores />} />
        <Route path="/reportes" element={<Reportes />} />
      </Route>
    </Routes>
  );
}

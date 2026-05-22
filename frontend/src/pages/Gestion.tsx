import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit, Trash2, Eye, TrendingUp, CheckCircle, XCircle, Loader2, Pill, Beaker, Syringe, Package } from 'lucide-react';
import { getMedicamentos, getMedicamentosSummary, eliminarMedicamento } from '../api/medicamentos';
import { getProveedores, eliminarProveedor } from '../api/proveedores';
import type { MedicamentoListItem, Proveedor, PaginatedResponse } from '../types';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';
import MedicamentoModal from '../components/gestion/MedicamentoModal';
import ProveedorDetalleModal from '../components/gestion/ProveedorDetalleModal';
import ProveedorFormModal from '../components/gestion/ProveedorFormModal';

const categorias = ['Analgésicos', 'Antibióticos', 'Cardiología', 'Endocrinología', 'Anestesia', 'Otro'];

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function getMedIcon(categoria: string) {
  if (categoria?.toLowerCase().includes('antibiótico')) return Beaker;
  if (categoria?.toLowerCase().includes('analgésico')) return Pill;
  if (categoria?.toLowerCase().includes('inyectable') || categoria?.toLowerCase().includes('jeringa')) return Syringe;
  return Package;
}

export default function Gestion() {
  const [medData, setMedData] = useState<PaginatedResponse<MedicamentoListItem> | null>(null);
  const [provData, setProvData] = useState<PaginatedResponse<Proveedor> | null>(null);
  const [summary, setSummary] = useState({ total: 0, activos: 0, inactivos: 0 });
  const [medPage, setMedPage] = useState(1);
  const [provPage, setProvPage] = useState(1);
  const [medBusqueda, setMedBusqueda] = useState('');
  const [medCategoria, setMedCategoria] = useState('');
  const [medEstado, setMedEstado] = useState('');
  const [provBusqueda, setProvBusqueda] = useState('');
  const [provEstado, setProvEstado] = useState('');
  const [loading, setLoading] = useState(true);
  const [medModal, setMedModal] = useState(false);
  const [editMed, setEditMed] = useState<MedicamentoListItem | null>(null);
  const [provModal, setProvModal] = useState(false);
  const [selectedProv, setSelectedProv] = useState<Proveedor | null>(null);
  const [nuevoProvModal, setNuevoProvModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [meds, provs, sum] = await Promise.all([
        getMedicamentos({ page: medPage, limit: 5, busqueda: medBusqueda || undefined, categoria: medCategoria || undefined, estado: medEstado || undefined }),
        getProveedores({ page: provPage, limit: 5, busqueda: provBusqueda || undefined }),
        getMedicamentosSummary(),
      ]);
      setMedData(meds);
      setProvData(provs);
      setSummary(sum);
    } catch {
      // graceful
    } finally {
      setLoading(false);
    }
  }, [medPage, provPage, medBusqueda, medCategoria, medEstado, provBusqueda]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeleteMed = async (id: string) => {
    if (!confirm('¿Eliminar este medicamento?')) return;
    try { await eliminarMedicamento(id); fetchData(); } catch { /* ignore */ }
  };

  const handleDeleteProv = async (id: string) => {
    if (!confirm('¿Eliminar este proveedor?')) return;
    try { await eliminarProveedor(id); fetchData(); } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-5xl font-bold text-gray-900">Gestion Medicamentos y Proveedores</h1>
        <p className="mt-2 text-sm text-gray-500">Gestion del catalogo farmaceutico y de proveedores</p>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-3 gap-5">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">+12% este mes</span>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Total Medicamentos</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{summary.total.toLocaleString('es-AR')}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">96.5 del catálogo</span>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Activos</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{summary.activos.toLocaleString('es-AR')}</p>
        </div>
        <div className="rounded-2xl border border-red-50 bg-red-50/50 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">Requieren revisión</span>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Inactivos</p>
          <p className="mt-1 text-3xl font-bold text-red-600">{summary.inactivos}</p>
        </div>
      </div>

      {/* Medicamentos section */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Detalle de medicamentos</h2>
          <button onClick={() => { setEditMed(null); setMedModal(true); }}
            className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-light">
            <Plus className="h-4 w-4" />
            Nuevo medicamento
          </button>
        </div>

        {/* Filters */}
        <div className="mb-3 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Buscar por nombre o código EAN..." value={medBusqueda} onChange={(e) => setMedBusqueda(e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-brand focus:outline-none" />
          </div>
          <select value={medCategoria} onChange={(e) => setMedCategoria(e.target.value)}
            className="h-10 rounded-xl border border-gray-200 bg-white px-3 pr-8 text-sm text-gray-600 focus:border-brand focus:outline-none">
            <option value="">Categoría</option>
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={medEstado} onChange={(e) => setMedEstado(e.target.value)}
            className="h-10 rounded-xl border border-gray-200 bg-white px-3 pr-8 text-sm text-gray-600 focus:border-brand focus:outline-none">
            <option value="">Estado</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
            <option value="SUSPENDIDO">Suspendido</option>
          </select>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand" /></div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Medicamento</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Presentación</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">EAN</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Laboratorio</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Estado</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-widest text-gray-400">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {medData?.data.map((m) => {
                    const IconComp = getMedIcon(m.categoria);
                    return (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                              <IconComp className="h-4 w-4 text-gray-500" />
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{m.nombre}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600">{m.categoria}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{m.presentacion ?? '—'}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{m.ean ?? '—'}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{m.laboratorio ?? '—'}</td>
                        <td className="px-6 py-3">
                          <Badge
                            label={m.estado}
                            variant={m.estado === 'ACTIVO' ? 'success' : m.estado === 'INACTIVO' ? 'default' : 'warning'}
                          />
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setEditMed(m); setMedModal(true); }}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-brand">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDeleteMed(m.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {medData?.data.length === 0 && (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-400">No se encontraron medicamentos</td></tr>
                  )}
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
                <p className="text-sm text-gray-500">Mostrando {medData?.data.length ?? 0} de {medData?.total ?? 0} productos</p>
                <Pagination page={medPage} totalPages={medData?.totalPages ?? 1} onPageChange={setMedPage} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Proveedores section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Detalle de proveedores</h2>
          <button
            onClick={() => setNuevoProvModal(true)}
            className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-light"
          >
            <Plus className="h-4 w-4" />
            Nuevo proveedor
          </button>
        </div>

        <div className="mb-3 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Buscar por nombre" value={provBusqueda} onChange={(e) => setProvBusqueda(e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-brand focus:outline-none" />
          </div>
          <select value={provEstado} onChange={(e) => setProvEstado(e.target.value)}
            className="h-10 rounded-xl border border-gray-200 bg-white px-3 pr-8 text-sm text-gray-600 focus:border-brand focus:outline-none">
            <option value="">Estado</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand" /></div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Proveedor</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Contacto</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Teléfono</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">E-Mail</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Estado</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-widest text-gray-400">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {provData?.data.map((p) => {
                    const initials = getInitials(p.razonSocial);
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-700 text-xs font-bold text-white">
                              {initials}
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{p.razonSocial}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600">{p.contacto ?? '—'}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{p.telefono ?? '—'}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{p.email ?? '—'}</td>
                        <td className="px-6 py-3">
                          <Badge label={p.activo ? 'ACTIVO' : 'INACTIVO'} variant={p.activo ? 'success' : 'default'} />
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setSelectedProv(p); setProvModal(true); }}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-brand">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-brand">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDeleteProv(p.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {provData?.data.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">No se encontraron proveedores</td></tr>
                  )}
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
                <p className="text-sm text-gray-500">Mostrando {provData?.data.length ?? 0} de {provData?.total ?? 0} proveedores</p>
                <Pagination page={provPage} totalPages={provData?.totalPages ?? 1} onPageChange={setProvPage} />
              </div>
            </>
          )}
        </div>
      </div>

      <MedicamentoModal isOpen={medModal} onClose={() => { setMedModal(false); setEditMed(null); fetchData(); }} medicamento={editMed} />
      <ProveedorDetalleModal isOpen={provModal} onClose={() => { setProvModal(false); setSelectedProv(null); }} proveedor={selectedProv} />
      <ProveedorFormModal isOpen={nuevoProvModal} onClose={() => { setNuevoProvModal(false); fetchData(); }} />
    </div>
  );
}

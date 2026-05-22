import { useState, useEffect, useCallback } from 'react';
import { Plus, Eye, Filter, Download, ShoppingCart, AlertTriangle, Loader2 } from 'lucide-react';
import { getCompras, getAlertasCompras } from '../api/compras';
import type { SolicitudCompra, AlertaStockCritico, PaginatedResponse } from '../types';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';
import NuevaSolicitudModal from '../components/compras/NuevaSolicitudModal';
import VerSolicitudModal from '../components/compras/VerSolicitudModal';

const estadoBadge: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'default' }> = {
  APROBADA:  { label: 'Aprobada',  variant: 'success' },
  PENDIENTE: { label: 'Pendiente', variant: 'warning' },
  RECHAZADA: { label: 'Rechazada', variant: 'default' },
  ENVIADA:   { label: 'Enviada',   variant: 'info' },
};

const tabs = [
  { label: 'TODOS', value: '' },
  { label: 'PENDIENTES', value: 'PENDIENTE' },
  { label: 'APROBADAS', value: 'APROBADA' },
  { label: 'ENVIADAS', value: 'ENVIADA' },
];

export default function Compras() {
  const [data, setData] = useState<PaginatedResponse<SolicitudCompra> | null>(null);
  const [alertas, setAlertas] = useState<AlertaStockCritico[]>([]);
  const [page, setPage] = useState(1);
  const [estadoFilter, setEstadoFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [nuevaModal, setNuevaModal] = useState(false);
  const [verModal, setVerModal] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudCompra | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [res, alertasRes] = await Promise.all([
        getCompras({ page, limit: 10, estado: estadoFilter || undefined }),
        getAlertasCompras(),
      ]);
      setData(res);
      setAlertas(alertasRes);
    } catch {
      // graceful
    } finally {
      setLoading(false);
    }
  }, [page, estadoFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [estadoFilter]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-5xl font-bold text-gray-900">Solicitud de Compras</h1>
        <p className="mt-2 text-sm text-gray-500">Gestion de pedidos de medicamentos</p>
      </div>

      {/* Alertas banner */}
      {alertas.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span className="font-semibold text-gray-900">Medicamentos proximos a Stock Crítico</span>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                {alertas.length} ALERTAS
              </span>
            </div>
            <button className="text-sm font-medium text-brand hover:underline">
              Ver catálogo completo →
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {alertas.slice(0, 3).map((a) => (
              <div key={a.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{a.nombre}</p>
                    <p className="text-xs uppercase tracking-wider text-gray-400">{a.proveedorNombre}</p>
                  </div>
                  <button
                    onClick={() => setNuevaModal(true)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-light"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-400 uppercase tracking-wider">Stock</p>
                    <p className="font-bold text-amber-600">{a.stockActual}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 uppercase tracking-wider">Mínimo</p>
                    <p className="font-bold text-gray-700">{a.stockMinimo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historial de Solicitudes */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Historial de Solicitudes</h2>
            <p className="mt-0.5 text-xs text-gray-400">Gestion detallada de pedidos pasados y pendientes.</p>
          </div>
          <div className="flex items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setEstadoFilter(tab.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  estadoFilter === tab.value
                    ? 'bg-brand text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
              <Filter className="h-3.5 w-3.5" />
              Filtrar
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
              <Download className="h-3.5 w-3.5" />
              Exportar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">ID Solicitud</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Proveedor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-widest text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.data.map((s) => {
                  const badge = estadoBadge[s.estado] ?? { label: s.estado, variant: 'default' as const };
                  return (
                    <tr key={s.id} className="cursor-pointer hover:bg-gray-50" onClick={() => { setSelectedSolicitud(s); setVerModal(true); }}>
                      <td className="px-6 py-4 text-sm font-semibold text-brand">{s.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.fechaSolicitud ?? s.createdAt?.slice(0, 10)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{s.proveedorNombre ?? '—'}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        {String(s.detalles.length).padStart(2, '0')}
                      </td>
                      <td className="px-6 py-4">
                        <Badge label={badge.label} variant={badge.variant} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => { setSelectedSolicitud(s); setVerModal(true); }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-brand"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {data?.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                      No se encontraron solicitudes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <p className="text-sm text-gray-500">
                Mostrando {data?.data.length ?? 0} de {data?.total ?? 0} solicitudes
              </p>
              <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setNuevaModal(true)}
        className="fixed bottom-8 right-8 flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-brand-light"
      >
        <Plus className="h-5 w-5" />
        + Nueva Solicitud de compra
      </button>

      <NuevaSolicitudModal isOpen={nuevaModal} onClose={() => { setNuevaModal(false); fetchData(); }} />
      <VerSolicitudModal isOpen={verModal} onClose={() => { setVerModal(false); setSelectedSolicitud(null); }} solicitud={selectedSolicitud} />
    </div>
  );
}

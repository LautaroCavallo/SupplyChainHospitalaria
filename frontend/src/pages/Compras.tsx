import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Eye, Filter, Download, Loader2, Send, Check, Pencil, X } from 'lucide-react';
import { getCompras, getAlertasCompras, enviarOrdenCompra, confirmarBorrador, eliminarCompra } from '../api/compras';
import ConfirmModal from '../components/common/ConfirmModal';
import type { SolicitudCompra, AlertaStockCritico, PaginatedResponse } from '../types';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';
import NuevaSolicitudModal from '../components/compras/NuevaSolicitudModal';
import VerSolicitudModal from '../components/compras/VerSolicitudModal';
import AlertasCarousel from '../components/compras/AlertasCarousel';
import SortableTh, { type SortDirection } from '../components/common/SortableTh';
import FilterTabs from '../components/common/FilterTabs';
import { applySortDirection, compareDate, compareNumber, compareText, nextSortDirection } from '../utils/sort';

const estadoBadge: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'default' | 'danger' }> = {
  BORRADOR:  { label: 'Borrador',  variant: 'default' },
  APROBADA:  { label: 'Aprobada',  variant: 'success' },
  PENDIENTE: { label: 'Pendiente', variant: 'warning' },
  RECHAZADA: { label: 'Rechazada', variant: 'danger' },
  ENVIADA:   { label: 'Enviada',   variant: 'info' },
};

const tabs = [
  { label: 'TODOS', value: '' },
  { label: 'BORRADORES', value: 'BORRADOR' },
  { label: 'PENDIENTES', value: 'PENDIENTE' },
  { label: 'APROBADAS', value: 'APROBADA' },
  { label: 'ENVIADAS', value: 'ENVIADA' },
];

type SortKey = 'id' | 'fecha' | 'proveedor' | 'items' | 'estado';

const estadoSortOrder: Record<string, number> = {
  BORRADOR: 0,
  PENDIENTE: 1,
  APROBADA: 2,
  ENVIADA: 3,
  RECHAZADA: 4,
};

export default function Compras() {
  const [data, setData] = useState<PaginatedResponse<SolicitudCompra> | null>(null);
  const [alertas, setAlertas] = useState<AlertaStockCritico[]>([]);
  const [page, setPage] = useState(1);
  const [estadoFilter, setEstadoFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [nuevaModal, setNuevaModal] = useState(false);
  const [prefillAlerta, setPrefillAlerta] = useState<AlertaStockCritico | null>(null);
  const [editandoBorrador, setEditandoBorrador] = useState<SolicitudCompra | null>(null);
  const [verModal, setVerModal] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudCompra | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'fecha',
    direction: 'desc',
  });
  const [enviando, setEnviando] = useState<string | null>(null);
  const [borradorAEliminar, setBorradorAEliminar] = useState<SolicitudCompra | null>(null);
  const [eliminando, setEliminando] = useState(false);

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

  const sortedSolicitudes = useMemo(() => {
    return [...(data?.data ?? [])].sort((a, b) => {
      let result = 0;

      if (sort.key === 'id') result = compareText(a.id, b.id);
      if (sort.key === 'fecha') result = compareDate(a.fechaSolicitud ?? a.createdAt, b.fechaSolicitud ?? b.createdAt);
      if (sort.key === 'proveedor') result = compareText(a.proveedorNombre, b.proveedorNombre);
      if (sort.key === 'items') result = compareNumber(a.detalles.length, b.detalles.length);
      if (sort.key === 'estado') result = (estadoSortOrder[a.estado] ?? 99) - (estadoSortOrder[b.estado] ?? 99);

      return applySortDirection(result, sort.direction);
    });
  }, [data?.data, sort]);

  const handleSort = (key: SortKey) => {
    setSort((current) => ({ key, direction: nextSortDirection(current, key) }));
  };

  const handleEnviarACompras = useCallback(async (id: string) => {
    try {
      setEnviando(id);
      await enviarOrdenCompra(id);
      await fetchData();
    } catch {
      // graceful — el error se puede manejar con un toast en el futuro
    } finally {
      setEnviando(null);
    }
  }, [fetchData]);

  const handleConfirmarBorrador = useCallback(async (id: string) => {
    try {
      setEnviando(id);
      await confirmarBorrador(id);
      await fetchData();
    } catch {
      // graceful
    } finally {
      setEnviando(null);
    }
  }, [fetchData]);

  const handleEliminarBorrador = async () => {
    if (!borradorAEliminar) return;
    try {
      setEliminando(true);
      await eliminarCompra(borradorAEliminar.id);
      setBorradorAEliminar(null);
      await fetchData();
    } catch {
      // graceful
    } finally {
      setEliminando(false);
    }
  };

  const handleRowClick = (s: SolicitudCompra) => {
    if (s.estado === 'BORRADOR') {
      setPrefillAlerta(null);
      setEditandoBorrador(s);
      setNuevaModal(true);
    } else {
      setSelectedSolicitud(s);
      setVerModal(true);
    }
  };

  return (
    <div className="pb-20">
      <div className="mb-8">
        <h1 className="font-serif text-5xl font-bold text-gray-900">Solicitud de Compras</h1>
        <p className="mt-2 text-sm text-gray-500">Gestion de pedidos de medicamentos</p>
      </div>

      {/* Alertas Carousel */}
      {alertas.length > 0 && (
        <AlertasCarousel
          alertas={alertas}
          onCrearSolicitud={(alerta) => { setPrefillAlerta(alerta); setNuevaModal(true); }}
        />
      )}

      {/* Historial de Solicitudes */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Historial de Solicitudes</h2>
            <p className="mt-0.5 text-xs text-gray-400">Gestion detallada de pedidos pasados y pendientes.</p>
          </div>
          <div className="flex items-center gap-2">
            <FilterTabs tabs={tabs} active={estadoFilter} onChange={setEstadoFilter} size="sm" />
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
                  <SortableTh label="ID Solicitud" sortKey="id" activeKey={sort.key} direction={sort.direction} onSort={handleSort} />
                  <SortableTh label="Fecha" sortKey="fecha" activeKey={sort.key} direction={sort.direction} onSort={handleSort} />
                  <SortableTh label="Proveedor" sortKey="proveedor" activeKey={sort.key} direction={sort.direction} onSort={handleSort} />
                  <SortableTh label="Items" sortKey="items" activeKey={sort.key} direction={sort.direction} onSort={handleSort} />
                  <SortableTh label="Estado" sortKey="estado" activeKey={sort.key} direction={sort.direction} onSort={handleSort} />
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-widest text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedSolicitudes.map((s) => {
                  const badge = estadoBadge[s.estado] ?? { label: s.estado, variant: 'default' as const };
                  return (
                    <tr key={s.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleRowClick(s)}>
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
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {s.estado === 'BORRADOR' && (
                            <>
                              <button
                                disabled={enviando === s.id}
                                onClick={() => handleConfirmarBorrador(s.id)}
                                title="Confirmar borrador"
                                className="flex h-8 items-center gap-1.5 rounded-lg bg-brand px-2.5 text-xs font-semibold text-white hover:bg-brand-light disabled:opacity-50"
                              >
                                {enviando === s.id
                                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  : <Check className="h-3.5 w-3.5" />
                                }
                                Confirmar
                              </button>
                              <button
                                onClick={() => setBorradorAEliminar(s)}
                                title="Eliminar borrador"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {s.estado === 'PENDIENTE' && (
                            <button
                              disabled={enviando === s.id}
                              onClick={() => handleEnviarACompras(s.id)}
                              title="Enviar a Compras"
                              className="flex h-8 items-center gap-1.5 rounded-lg bg-brand px-2.5 text-xs font-semibold text-white hover:bg-brand-light disabled:opacity-50"
                            >
                              {enviando === s.id
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <Send className="h-3.5 w-3.5" />
                              }
                              Enviar
                            </button>
                          )}
                          <button
                            onClick={() => handleRowClick(s)}
                            title={s.estado === 'BORRADOR' ? 'Editar borrador' : 'Ver detalle'}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-brand"
                          >
                            {s.estado === 'BORRADOR' ? <Pencil className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {sortedSolicitudes.length === 0 && (
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
        onClick={() => { setPrefillAlerta(null); setEditandoBorrador(null); setNuevaModal(true); }}
        className="fixed bottom-8 right-8 flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-brand-light"
      >
        <Plus className="h-5 w-5" />
        Nueva Solicitud de compra
      </button>

      <NuevaSolicitudModal
        isOpen={nuevaModal}
        prefill={prefillAlerta}
        solicitud={editandoBorrador}
        onClose={() => { setNuevaModal(false); setPrefillAlerta(null); setEditandoBorrador(null); fetchData(); }}
      />
      <VerSolicitudModal isOpen={verModal} onClose={() => { setVerModal(false); setSelectedSolicitud(null); }} solicitud={selectedSolicitud} onRefresh={fetchData} />

      <ConfirmModal
        isOpen={!!borradorAEliminar}
        title="¿Eliminar borrador?"
        description="Esta acción no se puede deshacer. El borrador se eliminará permanentemente."
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        loading={eliminando}
        onConfirm={handleEliminarBorrador}
        onCancel={() => setBorradorAEliminar(null)}
      />
    </div>
  );
}

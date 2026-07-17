import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Loader2, Send, Check, Pencil, X, PackagePlus } from 'lucide-react';
import { getCompras, getAlertasCompras, enviarOrdenCompra, confirmarBorrador, eliminarCompra } from '../api/compras';
import { crearRecepcionDesdeOrdenCompra } from '../api/recepciones';
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
import { hasPermiso } from '../utils/permisos';

const estadoBadge: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'default' | 'danger' }> = {
  BORRADOR:  { label: 'Borrador',  variant: 'default' },
  APROBADA:  { label: 'Aprobada',  variant: 'success' },
  EN_RECEPCION: { label: 'En recepción', variant: 'info' },
  PENDIENTE: { label: 'Pendiente', variant: 'warning' },
  RECHAZADA: { label: 'Rechazada', variant: 'danger' },
  ENVIADA:   { label: 'Enviada',   variant: 'info' },
};

const tabs = [
  { label: 'TODOS', value: '' },
  { label: 'BORRADORES', value: 'BORRADOR' },
  { label: 'PENDIENTES', value: 'PENDIENTE' },
  { label: 'APROBADAS', value: 'APROBADA' },
  { label: 'EN RECEPCIÓN', value: 'EN_RECEPCION' },
  { label: 'ENVIADAS', value: 'ENVIADA' },
];

type SortKey = 'id' | 'fecha' | 'proveedor' | 'items' | 'estado';

const estadoSortOrder: Record<string, number> = {
  BORRADOR: 0,
  PENDIENTE: 1,
  APROBADA: 2,
  EN_RECEPCION: 3,
  ENVIADA: 4,
  RECHAZADA: 5,
};

function getProveedorSolicitud(s: SolicitudCompra): string {
  return s.proveedorAdjudicadoRazonSocial
    ?? s.proveedorNombre
    ?? s.proveedorSugerido?.razonSocial
    ?? '—';
}

function getEstadoSolicitud(s: SolicitudCompra): string {
  if (s.estado === 'APROBADA' && s.recepcion) return 'EN_RECEPCION';
  return s.estado;
}

export default function Compras() {
  const navigate = useNavigate();
  const puedeEscribirCompras = hasPermiso('farmacia:compras:write');
  const puedeEscribirRecepciones = hasPermiso('farmacia:recepciones:write');
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
  const [generandoRecepcion, setGenerandoRecepcion] = useState<string | null>(null);
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
      if (sort.key === 'proveedor') result = compareText(getProveedorSolicitud(a), getProveedorSolicitud(b));
      if (sort.key === 'items') result = compareNumber(a.detalles.length, b.detalles.length);
      if (sort.key === 'estado') result = (estadoSortOrder[getEstadoSolicitud(a)] ?? 99) - (estadoSortOrder[getEstadoSolicitud(b)] ?? 99);

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

  const handleGenerarRecepcion = useCallback(async (id: string) => {
    try {
      setGenerandoRecepcion(id);
      const recepcion = await crearRecepcionDesdeOrdenCompra(id);
      navigate(`/recepciones/${recepcion.id}/editar`);
    } catch {
      // graceful
    } finally {
      setGenerandoRecepcion(null);
    }
  }, [navigate]);

  const handleRowClick = (s: SolicitudCompra) => {
    if (s.estado === 'BORRADOR' && puedeEscribirCompras) {
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
          onCrearSolicitud={puedeEscribirCompras ? (alerta) => { setPrefillAlerta(alerta); setNuevaModal(true); } : undefined}
        />
      )}

      {/* Historial de Solicitudes */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Historial de Solicitudes</h2>
            <p className="mt-0.5 text-xs text-gray-400">Gestion detallada de pedidos pasados y pendientes.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterTabs tabs={tabs} active={estadoFilter} onChange={setEstadoFilter} size="sm" />
          </div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
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
                  const estadoActual = getEstadoSolicitud(s);
                  const badge = estadoBadge[estadoActual] ?? { label: estadoActual, variant: 'default' as const };
                  return (
                    <tr key={s.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleRowClick(s)}>
                      <td className="px-6 py-4 text-sm font-semibold text-brand">{s.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.fechaSolicitud ?? s.createdAt?.slice(0, 10)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{getProveedorSolicitud(s)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        {String(s.detalles.length).padStart(2, '0')}
                      </td>
                      <td className="px-6 py-4">
                        <Badge label={badge.label} variant={badge.variant} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {s.estado === 'BORRADOR' && puedeEscribirCompras && (
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
                          {s.estado === 'PENDIENTE' && puedeEscribirCompras && (
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
                          {estadoActual === 'APROBADA' && puedeEscribirRecepciones && (
                            <button
                              disabled={generandoRecepcion === s.id}
                              onClick={() => handleGenerarRecepcion(s.id)}
                              title="Generar recepción"
                              className="flex h-8 items-center gap-1.5 rounded-lg bg-brand px-2.5 text-xs font-semibold text-white hover:bg-brand-light disabled:opacity-50"
                            >
                              {generandoRecepcion === s.id
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <PackagePlus className="h-3.5 w-3.5" />
                              }
                              Recepción
                            </button>
                          )}
                          {estadoActual === 'EN_RECEPCION' && s.recepcion && (
                            <button
                              onClick={() => navigate(`/recepciones/${s.recepcion?.id}/editar`)}
                              title="Ver recepción generada"
                              className="flex h-8 items-center gap-1.5 rounded-lg border border-brand px-2.5 text-xs font-semibold text-brand hover:bg-green-50"
                            >
                              <PackagePlus className="h-3.5 w-3.5" />
                              Ver recepción
                            </button>
                          )}
                          <button
                            onClick={() => handleRowClick(s)}
                            title={s.estado === 'BORRADOR' && puedeEscribirCompras ? 'Editar borrador' : 'Ver detalle'}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-brand"
                          >
                            {s.estado === 'BORRADOR' && puedeEscribirCompras ? <Pencil className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
            </div>

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
      {puedeEscribirCompras && (
      <button
        onClick={() => { setPrefillAlerta(null); setEditandoBorrador(null); setNuevaModal(true); }}
        className="fixed bottom-8 right-8 flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-brand-light"
      >
        <Plus className="h-5 w-5" />
        Nueva Solicitud de compra
      </button>
      )}

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

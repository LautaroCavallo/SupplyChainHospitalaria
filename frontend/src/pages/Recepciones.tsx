import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, Eye, Edit } from 'lucide-react';
import { getRecepciones, getRecepcion } from '../api/recepciones';
import type { Recepcion, PaginatedResponse, EstadoRecepcion } from '../types';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';
import RecepcionDetalleModal from '../components/recepciones/RecepcionDetalleModal';

const estadoBadge: Record<EstadoRecepcion, { label: string; variant: 'success' | 'warning' | 'info' }> = {
  BORRADOR:   { label: 'Borrador',   variant: 'warning' },
  CONFIRMADA: { label: 'Confirmada', variant: 'info' },
  PROCESADA:  { label: 'Procesada',  variant: 'success' },
};

const tabs: { label: string; value: string }[] = [
  { label: 'TODOS',     value: '' },
  { label: 'BORRADOR',  value: 'BORRADOR' },
  { label: 'CONFIRMADA', value: 'CONFIRMADA' },
  { label: 'PROCESADA',  value: 'PROCESADA' },
];

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function Recepciones() {
  const navigate = useNavigate();
  const [data, setData] = useState<PaginatedResponse<Recepcion> | null>(null);
  const [page, setPage] = useState(1);
  const [estadoFilter, setEstadoFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedRecepcion, setSelectedRecepcion] = useState<Recepcion | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getRecepciones({ page, limit: 10, estado: estadoFilter || undefined });
      setData(res);
    } catch {
      setError('Error al cargar las recepciones');
    } finally {
      setLoading(false);
    }
  }, [page, estadoFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [estadoFilter]);

  const handleRowClick = async (r: Recepcion) => {
    if (r.estado === 'BORRADOR') {
      navigate(`/recepciones/${r.id}/editar`);
      return;
    }
    try {
      setLoadingDetail(true);
      const detail = await getRecepcion(r.id);
      setSelectedRecepcion(detail);
      setDetailModal(true);
    } catch {
      setSelectedRecepcion(r);
      setDetailModal(true);
    } finally {
      setLoadingDetail(false);
    }
  };

  const startIndex = (page - 1) * 10 + 1;
  const endIndex = Math.min(page * 10, data?.total ?? 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-5xl font-bold text-gray-900">Recepciones</h1>
        <p className="mt-2 text-sm text-gray-500">
          Carga y validación de ingresos de stock desde proveedores
        </p>
      </div>

      {/* Tabs + counter */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setEstadoFilter(tab.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                estadoFilter === tab.value
                  ? 'bg-brand text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {data && (
          <p className="text-sm text-gray-500">
            Mostrando {startIndex}–{endIndex} de {data.total} recepciones
          </p>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={fetchData} className="rounded-lg bg-brand px-4 py-2 text-sm text-white hover:bg-brand-light">
              Reintentar
            </button>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">ID Recepción</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Proveedor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Cantidad Items</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-widest text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.data.map((r) => {
                  const badge = estadoBadge[r.estado];
                  const nombreProveedor = r.proveedor?.razonSocial ?? '—';
                  const initials = nombreProveedor !== '—' ? getInitials(nombreProveedor) : '??';
                  return (
                    <tr
                      key={r.id}
                      className="cursor-pointer transition-colors hover:bg-gray-50"
                      onClick={() => handleRowClick(r)}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-brand">
                        {r.id.startsWith('REC') ? r.id : `REC-${r.id.slice(-4).toUpperCase()}`}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700">
                            {initials.slice(0, 2)}
                          </div>
                          <span className="text-sm text-gray-900">{nombreProveedor}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{r.totalItems} items</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(r.fechaRecepcion)}</td>
                      <td className="px-6 py-4">
                        <Badge label={badge.label} variant={badge.variant} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                          {r.estado === 'BORRADOR' ? (
                            <button
                              onClick={() => navigate(`/recepciones/${r.id}/editar`)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-brand"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRowClick(r)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-brand"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {data?.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                      No se encontraron recepciones
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-center border-t border-gray-100 px-6 py-4">
              <Pagination
                page={page}
                totalPages={data?.totalPages ?? 1}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/recepciones/nueva')}
        className="fixed bottom-8 right-8 flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-brand-light"
      >
        <Plus className="h-5 w-5" />
        Nueva Recepción
      </button>

      {loadingDetail && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        </div>
      )}

      <RecepcionDetalleModal
        isOpen={detailModal}
        onClose={() => { setDetailModal(false); setSelectedRecepcion(null); }}
        recepcion={selectedRecepcion}
      />
    </div>
  );
}

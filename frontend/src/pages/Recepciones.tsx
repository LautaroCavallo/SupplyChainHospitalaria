import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, Inbox, CalendarDays } from 'lucide-react';
import { getRecepciones } from '../api/recepciones';
import type { Recepcion, PaginatedResponse, EstadoRecepcion } from '../types';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';

const estadoBadge: Record<EstadoRecepcion, { label: string; variant: 'success' | 'warning' | 'info' }> = {
  BORRADOR: { label: 'Borrador', variant: 'warning' },
  CONFIRMADA: { label: 'Confirmada', variant: 'info' },
  PROCESADA: { label: 'Procesada', variant: 'success' },
};

const tabs: { label: string; value: string }[] = [
  { label: 'Todos', value: '' },
  { label: 'Borrador', value: 'BORRADOR' },
  { label: 'Confirmada', value: 'CONFIRMADA' },
  { label: 'Procesada', value: 'PROCESADA' },
];

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function Recepciones() {
  const navigate = useNavigate();
  const [data, setData] = useState<PaginatedResponse<Recepcion> | null>(null);
  const [page, setPage] = useState(1);
  const [estadoFilter, setEstadoFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendientesCount, setPendientesCount] = useState(0);
  const [hoyCount, setHoyCount] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [res, pendRes] = await Promise.all([
        getRecepciones({ page, limit: 10, estado: estadoFilter || undefined }),
        getRecepciones({ page: 1, limit: 1, estado: 'BORRADOR' }),
      ]);
      setData(res);
      setPendientesCount(pendRes.total);
      const today = new Date().toDateString();
      setHoyCount(res.data.filter((r) => new Date(r.createdAt).toDateString() === today).length);
    } catch {
      setError('Error al cargar las recepciones');
    } finally {
      setLoading(false);
    }
  }, [page, estadoFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [estadoFilter]);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recepciones</h1>
          <p className="mt-1 text-sm text-gray-500">
            Carga y validación de ingresos de stock desde proveedores
          </p>
        </div>
        <div className="flex gap-4">
          <div className="rounded-xl border border-gray-100 bg-white px-5 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              <Inbox className="h-4 w-4" />
              Pendientes
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900">{pendientesCount}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white px-5 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              <CalendarDays className="h-4 w-4" />
              Hoy
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900">{hoyCount}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center gap-1 border-b border-gray-100 px-6 py-3">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setEstadoFilter(tab.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                estadoFilter === tab.value
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-teal-700" />
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={fetchData} className="rounded-lg bg-teal-700 px-4 py-2 text-sm text-white hover:bg-teal-800">
              Reintentar
            </button>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    ID Recepción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Cantidad Ítems
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.data.map((r) => {
                  const badge = estadoBadge[r.estado];
                  return (
                    <tr
                      key={r.id}
                      className="cursor-pointer transition-colors hover:bg-gray-50"
                      onClick={() => navigate(`/recepciones`)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-teal-700">
                        {r.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {r.proveedor?.razonSocial ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                          {r.totalItems}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(r.fechaRecepcion)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge label={badge.label} variant={badge.variant} />
                      </td>
                    </tr>
                  );
                })}
                {data?.data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                      No se encontraron recepciones
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <p className="text-sm text-gray-500">
                Mostrando {data?.data.length ?? 0} de {data?.total ?? 0} recepciones
              </p>
              <Pagination
                page={page}
                totalPages={data?.totalPages ?? 1}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      <button
        onClick={() => navigate('/recepciones/nueva')}
        className="fixed bottom-8 right-8 flex items-center gap-2 rounded-full bg-teal-700 px-5 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105 hover:bg-teal-800"
      >
        <Plus className="h-5 w-5" />
        Nueva recepción
      </button>
    </div>
  );
}

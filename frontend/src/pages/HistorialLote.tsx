import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { getHistorialLote, getProducto, getLotes } from '../api/inventario';
import type { MovimientoLote, PaginatedResponse, TipoMovimiento } from '../types';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';
import SortableTh, { type SortDirection } from '../components/common/SortableTh';
import { applySortDirection, compareDate, compareNumber, compareText, nextSortDirection } from '../utils/sort';

const tipoBadge: Record<TipoMovimiento, { label: string; variant: 'success' | 'danger' | 'warning' | 'info' | 'default' }> = {
  INGRESO:         { label: 'Entrada',  variant: 'success' },
  EGRESO:          { label: 'Salida',   variant: 'danger' },
  AJUSTE_POSITIVO: { label: 'Ajuste',   variant: 'warning' },
  AJUSTE_NEGATIVO: { label: 'Ajuste',   variant: 'warning' },
  CONSUMO_RECETA:  { label: 'Salida por receta',  variant: 'info' },
};

const tabs = [
  { label: 'TODOS', value: '' },
  { label: 'ENTRADAS', value: 'INGRESO' },
  { label: 'SALIDAS', value: 'SALIDAS' },
  { label: 'AJUSTES', value: 'AJUSTE_POSITIVO' },
];

type SortKey = 'createdAt' | 'tipo' | 'cantidad' | 'origenDestino' | 'responsable';

const tipoSortOrder: Record<TipoMovimiento, number> = {
  INGRESO: 0,
  EGRESO: 1,
  AJUSTE_POSITIVO: 2,
  AJUSTE_NEGATIVO: 3,
  CONSUMO_RECETA: 4,
};

function getAvatarColor(name?: string): string {
  if (!name) return 'bg-gray-500';
  const colors = ['bg-gray-600', 'bg-brand', 'bg-teal-600', 'bg-indigo-600'];
  return colors[name.charCodeAt(0) % colors.length];
}

function getInitials(name?: string): string {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function HistorialLote() {
  const { medicamentoId, loteId } = useParams<{ medicamentoId: string; loteId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<PaginatedResponse<MovimientoLote> | null>(null);
  const [page, setPage] = useState(1);
  const [tipoFilter, setTipoFilter] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [loading, setLoading] = useState(true);
  const [nombreMedicamento, setNombreMedicamento] = useState('');
  const [numeroLote, setNumeroLote] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'createdAt',
    direction: 'desc',
  });

  const fetchData = useCallback(async () => {
    if (!medicamentoId || !loteId) return;
    try {
      setLoading(true);
      const [histRes, prod, lotes] = await Promise.all([
        getHistorialLote(medicamentoId, loteId, {
          page,
          limit: 10,
          tipo: tipoFilter || undefined,
          fechaDesde: fechaDesde || undefined,
          fechaHasta: fechaHasta || undefined,
        }),
        getProducto(medicamentoId).catch(() => null),
        getLotes(medicamentoId).catch(() => []),
      ]);
      setData(histRes);
      if (prod) setNombreMedicamento(prod.nombre);
      const lote = lotes.find((l) => l.id === loteId);
      if (lote) setNumeroLote(lote.numeroLote);
    } catch { /* graceful */ } finally { setLoading(false); }
  }, [medicamentoId, loteId, page, tipoFilter, fechaDesde, fechaHasta]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const sortedMovimientos = useMemo(() => {
    return [...(data?.data ?? [])].sort((a, b) => {
      let result = 0;

      if (sort.key === 'createdAt') result = compareDate(a.createdAt, b.createdAt);
      if (sort.key === 'tipo') result = tipoSortOrder[a.tipo] - tipoSortOrder[b.tipo];
      if (sort.key === 'cantidad') result = compareNumber(a.cantidad, b.cantidad);
      if (sort.key === 'origenDestino') result = compareText(a.origen ?? a.destino ?? a.motivo, b.origen ?? b.destino ?? b.motivo);
      if (sort.key === 'responsable') result = compareText(a.responsable, b.responsable);

      return applySortDirection(result, sort.direction);
    });
  }, [data?.data, sort]);

  const handleSort = (key: SortKey) => {
    setSort((current) => ({ key, direction: nextSortDirection(current, key) }));
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
        <button onClick={() => navigate('/inventario')} className="hover:text-brand">Inventario</button>
        <ChevronRight className="h-3.5 w-3.5" />
        {nombreMedicamento && (
          <>
            <button onClick={() => navigate(`/inventario/${medicamentoId}`)} className="hover:text-brand">
              {nombreMedicamento.toUpperCase()}
            </button>
            <ChevronRight className="h-3.5 w-3.5" />
          </>
        )}
        <span className="text-brand">HISTORIAL LOTE {numeroLote.toUpperCase()}</span>
      </div>

      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-gray-900">
          Lote {numeroLote}: {nombreMedicamento}
        </h1>
        <p className="mt-1 text-sm text-gray-500">Historial de movimientos del lote</p>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setTipoFilter(tab.value); setPage(1); }}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              tipoFilter === tab.value
                ? 'bg-brand text-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4 text-gray-400" />
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => { setFechaDesde(e.target.value); setPage(1); }}
            className="h-7 bg-transparent text-sm text-gray-600 focus:outline-none"
            aria-label="Fecha desde"
          />
          <span className="text-gray-300">-</span>
          <input
            type="date"
            value={fechaHasta}
            min={fechaDesde || undefined}
            onChange={(e) => { setFechaHasta(e.target.value); setPage(1); }}
            className="h-7 bg-transparent text-sm text-gray-600 focus:outline-none"
            aria-label="Fecha hasta"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <SortableTh label="Fecha y Hora" sortKey="createdAt" activeKey={sort.key} direction={sort.direction} onSort={handleSort} />
                  <SortableTh label="Tipo" sortKey="tipo" activeKey={sort.key} direction={sort.direction} onSort={handleSort} />
                  <SortableTh label="Cantidad" sortKey="cantidad" activeKey={sort.key} direction={sort.direction} onSort={handleSort} />
                  <SortableTh label="Origen / Destino" sortKey="origenDestino" activeKey={sort.key} direction={sort.direction} onSort={handleSort} />
                  <SortableTh label="Responsable" sortKey="responsable" activeKey={sort.key} direction={sort.direction} onSort={handleSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedMovimientos.map((m) => {
                  const badge = tipoBadge[m.tipo] ?? { label: m.tipo, variant: 'default' as const };
                  const colorClass = getAvatarColor(m.responsable);
                  const initials = getInitials(m.responsable);
                  const dt = new Date(m.createdAt);
                  const dateLabel = dt.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' }) + ', ' + dt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">{dateLabel}</td>
                      <td className="px-6 py-4">
                        <Badge label={badge.label} variant={badge.variant} />
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{m.cantidad}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {m.origen ?? m.destino ?? m.motivo ?? '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${colorClass}`}>
                            {initials}
                          </div>
                          <span className="text-sm text-gray-700">{m.responsable ?? '—'}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {sortedMovimientos.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">Sin movimientos registrados</td></tr>
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <p className="text-sm text-gray-500">
                Mostrando {data?.data.length ?? 0} de {data?.total ?? 0} movimientos
              </p>
              <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

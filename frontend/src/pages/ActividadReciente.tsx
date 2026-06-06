import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, Search, Loader2 } from 'lucide-react';
import { getActividadReciente } from '../api/dashboard';
import type { ActividadReciente as ActividadItem, PaginatedResponse } from '../types';
import Pagination from '../components/common/Pagination';
import SortableTh, { type SortDirection } from '../components/common/SortableTh';
import { applySortDirection, compareDate, compareText, nextSortDirection } from '../utils/sort';

const eventoBadgeStyle: Record<string, string> = {
  receta_validada:    'bg-green-100 text-green-700',
  validacion_rechazada: 'bg-red-100 text-red-700',
  stock_ajustado:     'bg-amber-100 text-amber-700',
  nueva_recepcion:    'bg-gray-100 text-gray-700',
  otro:               'bg-gray-100 text-gray-600',
};

const eventoLabel: Record<string, string> = {
  receta_validada:    'Receta validada',
  validacion_rechazada: 'Validacion rechazada',
  stock_ajustado:     'Stock ajustado',
  nueva_recepcion:    'Nueva recepción',
  otro:               'Otro',
};

type SortKey = 'createdAt' | 'evento' | 'referencia' | 'responsable';

function getAvatarColor(name: string): string {
  const colors = ['bg-gray-600', 'bg-brand', 'bg-teal-600', 'bg-purple-600', 'bg-indigo-600'];
  return colors[name.charCodeAt(0) % colors.length];
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function getUniqueResponsables(items: ActividadItem[]): string[] {
  return Array.from(new Set(items.map((item) => item.responsable).filter(Boolean))).sort();
}

export default function ActividadReciente() {
  const navigate = useNavigate();
  const [data, setData] = useState<PaginatedResponse<ActividadItem> | null>(null);
  const [page, setPage] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [usuario, setUsuario] = useState('');
  const [evento, setEvento] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'createdAt',
    direction: 'desc',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getActividadReciente({
        page,
        limit: 10,
        busqueda: busqueda || undefined,
        usuario: usuario || undefined,
        evento: evento || undefined,
        desde: desde || undefined,
        hasta: hasta || undefined,
      });
      setData(res);
    } catch { /* graceful */ } finally { setLoading(false); }
  }, [page, busqueda, usuario, evento, desde, hasta]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [busqueda, usuario, evento, desde, hasta]);
  const responsables = useMemo(() => getUniqueResponsables(data?.data ?? []), [data?.data]);

  const sortedActividad = useMemo(() => {
    return [...(data?.data ?? [])].sort((a, b) => {
      let result = 0;

      if (sort.key === 'createdAt') result = compareDate(a.createdAt, b.createdAt);
      if (sort.key === 'evento') result = compareText(eventoLabel[a.tipoEvento] ?? a.evento, eventoLabel[b.tipoEvento] ?? b.evento);
      if (sort.key === 'referencia') result = compareText(a.referencia ?? a.producto, b.referencia ?? b.producto);
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
        <button onClick={() => navigate('/')} className="hover:text-brand">Dashboard</button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-brand">Registro de Actividad</span>
      </div>

      <div className="mb-8">
        <h1 className="font-serif text-5xl font-bold text-gray-900">Registro de Actividad</h1>
        <p className="mt-2 text-sm text-gray-500">Historial de actividad en el sistema</p>
      </div>

      {/* Filters */}
      <div className="mb-5 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar por referencia o producto..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-brand focus:outline-none" />
        </div>
        <select
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="h-10 rounded-xl border border-gray-200 bg-white px-3 pr-8 text-sm text-gray-600 focus:border-brand focus:outline-none"
        >
          <option value="">Usuario</option>
          {responsables.map((responsable) => (
            <option key={responsable} value={responsable}>{responsable}</option>
          ))}
        </select>
        <select
          value={evento}
          onChange={(e) => setEvento(e.target.value)}
          className="h-10 rounded-xl border border-gray-200 bg-white px-3 pr-8 text-sm text-gray-600 focus:border-brand focus:outline-none"
        >
          <option value="">Evento</option>
          <option value="receta_validada">Receta validada</option>
          <option value="stock_ajustado">Stock ajustado</option>
          <option value="nueva_recepcion">Nueva recepción</option>
        </select>
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4 text-gray-400" />
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="h-7 bg-transparent text-sm text-gray-600 focus:outline-none"
            aria-label="Fecha desde"
          />
          <span className="text-gray-300">-</span>
          <input
            type="date"
            value={hasta}
            min={desde || undefined}
            onChange={(e) => setHasta(e.target.value)}
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
                  <SortableTh label="Evento" sortKey="evento" activeKey={sort.key} direction={sort.direction} onSort={handleSort} />
                  <SortableTh label="Referencia / Producto" sortKey="referencia" activeKey={sort.key} direction={sort.direction} onSort={handleSort} />
                  <SortableTh label="Responsable" sortKey="responsable" activeKey={sort.key} direction={sort.direction} onSort={handleSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedActividad.map((a) => {
                  const badgeStyle = eventoBadgeStyle[a.tipoEvento] ?? 'bg-gray-100 text-gray-600';
                  const label = eventoLabel[a.tipoEvento] ?? a.evento;
                  const colorClass = getAvatarColor(a.responsable);
                  const initials = getInitials(a.responsable);
                  const dt = new Date(a.createdAt);
                  const isToday = dt.toDateString() === new Date().toDateString();
                  const isYesterday = dt.toDateString() === new Date(Date.now() - 86400000).toDateString();
                  let dateLabel: string;
                  if (isToday) dateLabel = `Hoy, ${a.hora ?? dt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;
                  else if (isYesterday) dateLabel = `Ayer, ${a.hora ?? ''}`;
                  else dateLabel = dt.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' }) + `, ${a.hora ?? ''}`;

                  return (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">{dateLabel}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badgeStyle}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                          {label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">{a.referencia ?? a.producto ?? '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${colorClass}`}>
                            {initials}
                          </div>
                          <span className="text-sm text-gray-700">{a.responsable}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {sortedActividad.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400">Sin actividad registrada</td></tr>
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

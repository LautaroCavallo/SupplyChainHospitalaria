import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, History, AlertTriangle, Loader2, SlidersHorizontal } from 'lucide-react';
import { ajustarStock, getProducto, getLotes } from '../api/inventario';
import type { ProductoInventario, Lote, NivelStock, EstadoLote } from '../types';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';
import SortableTh, { type SortDirection } from '../components/common/SortableTh';
import AjusteStockModal from '../components/inventario/AjusteStockModal';
import { applySortDirection, compareDate, compareNumber, compareText, nextSortDirection } from '../utils/sort';

function formatDate(d: string): string {
  const dt = new Date(d);
  const month = (dt.getMonth() + 1).toString().padStart(2, '0');
  const year = dt.getFullYear();
  return `${month}/${year}`;
}

function getNivelStock(p: ProductoInventario): NivelStock {
  if (p.nivelStock) return p.nivelStock;
  if (p.stockActual <= 0) return 'SIN_STOCK';
  if (p.stockActual <= p.stockCritico) return 'CRITICO';
  if (p.stockActual <= p.stockMinimo) return 'BAJO';
  return 'NORMAL';
}

const nivelBadge: Record<NivelStock, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  NORMAL:    { label: 'NORMAL',          variant: 'success' },
  BAJO:      { label: 'BAJO',            variant: 'warning' },
  CRITICO:   { label: 'CRÍTICO',         variant: 'danger' },
  SIN_STOCK: { label: 'SIN STOCK',       variant: 'danger' },
};

const estadoLoteBadge: Record<EstadoLote, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
  VIGENTE:          { label: 'VIGENTE',           variant: 'success' },
  PROXIMO_A_VENCER: { label: 'PRÓXIMO A VENCER',  variant: 'warning' },
  VENCIDO:          { label: 'VENCIDO',            variant: 'danger' },
  AGOTADO:          { label: 'AGOTADO',            variant: 'default' },
};

const estadoFilterOptions: { label: string; value: string }[] = [
  { label: 'Todos', value: '' },
  { label: 'Vigente', value: 'VIGENTE' },
  { label: 'Próximo a vencer', value: 'PROXIMO_A_VENCER' },
  { label: 'Vencido', value: 'VENCIDO' },
  { label: 'Agotado', value: 'AGOTADO' },
];

const LIMIT = 10;
type SortKey = 'numeroLote' | 'fechaVencimiento' | 'stockDisponible' | 'estado';

const estadoLoteSortOrder: Record<EstadoLote, number> = {
  VIGENTE: 0,
  PROXIMO_A_VENCER: 1,
  VENCIDO: 2,
  AGOTADO: 3,
};

export default function InventarioDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [producto, setProducto] = useState<ProductoInventario | null>(null);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [estadoFilter, setEstadoFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ajusteModal, setAjusteModal] = useState(false);
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'fechaVencimiento',
    direction: 'asc',
  });

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [prod, lotesRes] = await Promise.all([getProducto(id), getLotes(id)]);
      setProducto(prod);
      setLotes(lotesRes);
    } catch {
      setError('Error al cargar los datos del producto');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredLotes = useMemo(() => {
    return estadoFilter
      ? lotes.filter((l) => l.estado === estadoFilter)
      : lotes;
  }, [estadoFilter, lotes]);

  const sortedLotes = useMemo(() => {
    return [...filteredLotes].sort((a, b) => {
      let result = 0;

      if (sort.key === 'numeroLote') result = compareText(a.numeroLote, b.numeroLote);
      if (sort.key === 'fechaVencimiento') result = compareDate(a.fechaVencimiento, b.fechaVencimiento);
      if (sort.key === 'stockDisponible') result = compareNumber(a.stockDisponible, b.stockDisponible);
      if (sort.key === 'estado') result = estadoLoteSortOrder[a.estado] - estadoLoteSortOrder[b.estado];

      return applySortDirection(result, sort.direction);
    });
  }, [filteredLotes, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedLotes.length / LIMIT));
  const pagedLotes = sortedLotes.slice((page - 1) * LIMIT, page * LIMIT);

  const handleSort = (key: SortKey) => {
    setSort((current) => ({ key, direction: nextSortDirection(current, key) }));
  };

  const handleAjusteLote = async (ajusteData: { tipo: string; cantidad: number; motivo: string; loteId?: string }) => {
    if (!id || !selectedLote) return;
    await ajustarStock(id, { ...ajusteData, loteId: selectedLote.id });
    await fetchData();
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <p className="text-sm text-red-600">{error ?? 'Producto no encontrado'}</p>
        <button onClick={() => navigate('/inventario')} className="rounded-lg bg-brand px-4 py-2 text-sm text-white hover:bg-brand-light">
          Volver al inventario
        </button>
      </div>
    );
  }

  const nivel = getNivelStock(producto);
  const hasProximoAVencer = lotes.some((l) => l.estado === 'PROXIMO_A_VENCER');

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
        <button onClick={() => navigate('/inventario')} className="hover:text-brand">
          Inventario
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-brand">{producto.nombre.toUpperCase()}</span>
      </div>

      {/* Alert */}
      {hasProximoAVencer && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">
            Atención: Hay lotes próximos a vencer. Se recomienda priorizar su salida.
          </p>
        </div>
      )}

      {/* Title */}
      <div className="mb-6">
        <h1 className="font-serif text-4xl font-bold text-gray-900">{producto.nombre}</h1>
        <p className="mt-1 text-sm text-gray-500">Gestión detallada de lotes y existencias farmacéuticas</p>
      </div>

      {/* Info cards */}
      <div className="mb-8 grid grid-cols-3 gap-5">
        {/* Card 1: Medicamento */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Medicamento</p>
          <div className="mb-2">
            <Badge label={nivelBadge[nivel].label} variant={nivelBadge[nivel].variant} />
          </div>
          <p className="mt-2 text-lg font-semibold text-gray-900">{producto.nombre}</p>
          {producto.principioActivo && (
            <p className="text-sm text-gray-500">
              {producto.principioActivo} {producto.presentacion ? `• ${producto.presentacion}` : ''}
            </p>
          )}
        </div>

        {/* Card 2: Stock Total */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Stock Total</p>
          <p className="text-5xl font-bold text-gray-900">
            {producto.stockActual.toLocaleString('es-AR')}
          </p>
          <p className="mt-2 text-sm text-gray-500">unidades disponibles</p>
        </div>

        {/* Card 3: Detalles */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Detalles</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Categoría:</span>
              <span className="font-semibold text-gray-900">{producto.categoria}</span>
            </div>
            {producto.proveedor && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Proveedor:</span>
                <span className="font-semibold text-gray-900">{producto.proveedor.razonSocial}</span>
              </div>
            )}
            {producto.precio !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Precio:</span>
                <span className="font-semibold text-gray-900">${producto.precio} c/und.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lotes */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Lotes Registrados</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            Estado:
            <select
              value={estadoFilter}
              onChange={(e) => { setEstadoFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-200 px-2 py-1 text-sm focus:border-brand focus:outline-none"
            >
              {estadoFilterOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <SortableTh label="Número de Lote" sortKey="numeroLote" activeKey={sort.key} direction={sort.direction} onSort={handleSort} />
              <SortableTh label="Fecha de Vencimiento" sortKey="fechaVencimiento" activeKey={sort.key} direction={sort.direction} onSort={handleSort} />
              <SortableTh label="Stock Disponible" sortKey="stockDisponible" activeKey={sort.key} direction={sort.direction} onSort={handleSort} />
              <SortableTh label="Estado" sortKey="estado" activeKey={sort.key} direction={sort.direction} onSort={handleSort} />
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-widest text-gray-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pagedLotes.map((lote) => {
              const badge = estadoLoteBadge[lote.estado] ?? { label: lote.estado, variant: 'info' as const };
              return (
                <tr key={lote.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{lote.numeroLote}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(lote.fechaVencimiento)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    {lote.stockDisponible.toLocaleString('es-AR')} ud
                  </td>
                  <td className="px-6 py-4">
                    <Badge label={badge.label} variant={badge.variant} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setSelectedLote(lote); setAjusteModal(true); }}
                        title="Ajustar lote"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-brand"
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/inventario/${id}/lotes/${lote.id}/historial`)}
                        title="Ver historial"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-brand"
                      >
                        <History className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {pagedLotes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                  No hay lotes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <p className="text-sm text-gray-500">
            Mostrando {pagedLotes.length} de {sortedLotes.length}
          </p>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
      <AjusteStockModal
        isOpen={ajusteModal}
        onClose={() => { setAjusteModal(false); setSelectedLote(null); }}
        producto={producto}
        lote={selectedLote}
        onConfirm={handleAjusteLote}
      />
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Pill,
  Package,
  Info,
  Edit,
  History,
  Plus,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { getProducto, getLotes } from '../api/inventario';
import type { ProductoInventario, Lote, NivelStock } from '../types';
import Badge from '../components/common/Badge';

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getNivelStock(p: ProductoInventario): NivelStock {
  if (p.nivelStock) return p.nivelStock;
  if (p.stockActual <= 0) return 'SIN_STOCK';
  if (p.stockActual <= p.stockCritico) return 'CRITICO';
  if (p.stockActual <= p.stockMinimo) return 'BAJO';
  return 'NORMAL';
}

const nivelBadge: Record<NivelStock, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  NORMAL: { label: 'Normal', variant: 'success' },
  BAJO: { label: 'Bajo', variant: 'warning' },
  CRITICO: { label: 'Crítico', variant: 'danger' },
  SIN_STOCK: { label: 'Sin stock', variant: 'danger' },
};

const estadoLoteBadge: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  VIGENTE: { label: 'Vigente', variant: 'success' },
  PROXIMO_A_VENCER: { label: 'Próximo a vencer', variant: 'warning' },
  VENCIDO: { label: 'Vencido', variant: 'danger' },
};

export default function InventarioDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [producto, setProducto] = useState<ProductoInventario | null>(null);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <p className="text-sm text-red-600">{error ?? 'Producto no encontrado'}</p>
        <button onClick={() => navigate('/inventario')} className="rounded-lg bg-teal-700 px-4 py-2 text-sm text-white hover:bg-teal-800">
          Volver al inventario
        </button>
      </div>
    );
  }

  const nivel = getNivelStock(producto);
  const hasProximoAVencer = lotes.some((l) => l.estado === 'PROXIMO_A_VENCER');

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => navigate('/inventario')} className="hover:text-teal-700">
          Inventario
        </button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900">{producto.nombre}</span>
      </div>

      {hasProximoAVencer && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">
            Atención: Hay lotes próximos a vencer. Se recomienda priorizar su salida.
          </p>
        </div>
      )}

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{producto.nombre}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestión detallada de lotes y existencias farmacéuticas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/inventario/${id}`)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <History className="h-4 w-4" />
            Ver todos los movimientos
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
            <Plus className="h-4 w-4" />
            Agregar lote
          </button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-5">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500">
            <Pill className="h-4 w-4" />
            Medicamento
          </div>
          <p className="text-lg font-semibold text-gray-900">{producto.nombre}</p>
          <p className="text-sm text-gray-500">{producto.categoria}</p>
          <div className="mt-3">
            <Badge label={nivelBadge[nivel].label} variant={nivelBadge[nivel].variant} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500">
            <Package className="h-4 w-4" />
            Stock Total
          </div>
          <p className="text-4xl font-bold text-gray-900">
            {producto.stockActual.toLocaleString('es-AR')}
          </p>
          <p className="text-sm text-gray-500">unidades disponibles</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500">
            <Info className="h-4 w-4" />
            Detalles
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Categoría</span>
              <span className="font-medium text-gray-900">{producto.categoria}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Unidad</span>
              <span className="font-medium text-gray-900">{producto.unidad}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Stock mínimo</span>
              <span className="font-medium text-gray-900">{producto.stockMinimo}</span>
            </div>
            {producto.ean && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">EAN</span>
                <span className="font-medium text-gray-900">{producto.ean}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Lotes</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Número de lote
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Fecha de vencimiento
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Stock disponible
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {lotes.map((lote) => {
              const badge = estadoLoteBadge[lote.estado] ?? { label: lote.estado, variant: 'info' as const };
              return (
                <tr key={lote.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-teal-700">{lote.numeroLote}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(lote.fechaVencimiento)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {lote.stockDisponible.toLocaleString('es-AR')}
                  </td>
                  <td className="px-6 py-4">
                    <Badge label={badge.label} variant={badge.variant} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <History className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {lotes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                  No hay lotes registrados para este producto
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

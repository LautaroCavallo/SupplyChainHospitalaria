import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Edit, Eye, Plus, Loader2, TrendingUp, AlertTriangle, Ban,
} from 'lucide-react';
import { getInventario, getInventarioSummary, ajustarStock } from '../api/inventario';
import type { ProductoInventario, NivelStock, PaginatedResponse } from '../types';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';
import AjusteStockModal from '../components/inventario/AjusteStockModal';

function getNivelStock(p: ProductoInventario): NivelStock {
  if (p.nivelStock) return p.nivelStock;
  if (p.stockActual <= 0) return 'SIN_STOCK';
  if (p.stockActual <= p.stockCritico) return 'CRITICO';
  if (p.stockActual <= p.stockMinimo) return 'BAJO';
  return 'NORMAL';
}

const nivelConfig: Record<NivelStock, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  NORMAL:    { label: 'En stock',   variant: 'success' },
  BAJO:      { label: 'Bajo stock', variant: 'warning' },
  CRITICO:   { label: 'Crítico',    variant: 'danger' },
  SIN_STOCK: { label: 'Sin stock',  variant: 'danger' },
};

const categorias = ['Antibióticos', 'Analgésicos', 'Endocrinología', 'Anestesia', 'Cardiología', 'Otro'];

export default function Inventario() {
  const navigate = useNavigate();
  const [data, setData] = useState<PaginatedResponse<ProductoInventario> | null>(null);
  const [page, setPage] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');
  const [estado, setEstado] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({ totalProductos: 0, alertaBajoStock: 0, sinStock: 0 });
  const [ajusteModal, setAjusteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductoInventario | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [res, sum] = await Promise.all([
        getInventario({ page, limit: 10, busqueda: busqueda || undefined, categoria: categoria || undefined, estado: estado || undefined }),
        getInventarioSummary(),
      ]);
      setData(res);
      setSummary(sum);
    } catch {
      setError('Error al cargar el inventario');
    } finally {
      setLoading(false);
    }
  }, [page, busqueda, categoria, estado]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [busqueda, categoria, estado]);

  const handleAjuste = async (ajusteData: { tipo: string; cantidad: number; motivo: string }) => {
    if (!selectedProduct) return;
    await ajustarStock(selectedProduct.id, ajusteData);
    await fetchData();
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-serif text-5xl font-bold text-gray-900">Inventario</h1>
        <p className="mt-2 text-sm text-gray-500">
          Supervisión del stock de medicamentos y suministros médicos
        </p>
      </div>

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-3 gap-5">
        {/* Total */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
              +12% últ. mes
            </span>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Productos Totales
          </p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {(summary.totalProductos || data?.total || 0).toLocaleString('es-AR')}
          </p>
        </div>

        {/* Bajo stock */}
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <button
              onClick={() => setEstado('BAJO')}
              className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 hover:bg-amber-200"
            >
              Revisar
            </button>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Alerta Bajo Stock
          </p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {summary.alertaBajoStock.toLocaleString('es-AR')}
          </p>
        </div>

        {/* Sin stock */}
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
              <Ban className="h-5 w-5 text-red-600" />
            </div>
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
              Crítico
            </span>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Sin Stock
          </p>
          <p className="mt-1 text-3xl font-bold text-red-600">
            {summary.sinStock.toLocaleString('es-AR')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o código EAN..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="h-10 rounded-xl border border-gray-200 bg-white px-3 pr-8 text-sm text-gray-600 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="">Categoría</option>
          {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="h-10 rounded-xl border border-gray-200 bg-white px-3 pr-8 text-sm text-gray-600 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="">Estado</option>
          <option value="NORMAL">En stock</option>
          <option value="BAJO">Bajo stock</option>
          <option value="CRITICO">Crítico</option>
          <option value="SIN_STOCK">Sin stock</option>
        </select>
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
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Medicamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Troquel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                    EAN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Stock Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.data.map((p) => {
                  const nivel = getNivelStock(p);
                  const config = nivelConfig[nivel];
                  const isSinStock = nivel === 'SIN_STOCK';
                  return (
                    <tr
                      key={p.id}
                      className={`cursor-pointer transition-colors hover:bg-gray-50 ${isSinStock ? 'border-l-4 border-l-red-500' : ''}`}
                      onClick={() => navigate(`/inventario/${p.id}`)}
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">{p.nombre}</p>
                        <p className="text-xs text-gray-400">
                          {p.principioActivo ?? p.categoria} {p.presentacion ? `• ${p.presentacion}` : ''}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.troquel ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.ean ?? '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${isSinStock ? 'text-red-600' : 'text-gray-900'}`}>
                          {isSinStock ? '0' : p.stockActual.toLocaleString('es-AR')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge label={config.label} variant={config.variant} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => { setSelectedProduct(p); setAjusteModal(true); }}
                            title="Editar"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/inventario/${p.id}`)}
                            title="Ver detalle"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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
                      No se encontraron productos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <p className="text-sm text-gray-500">
                Mostrando {data?.data.length ?? 0} de {data?.total ?? 0} productos
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
        onClick={() => { setSelectedProduct(null); setAjusteModal(true); }}
        className="fixed bottom-8 right-8 flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105 hover:bg-brand-light"
        title="Ajuste de stock"
      >
        <Plus className="h-5 w-5" />
        Nuevo ajuste
      </button>

      <AjusteStockModal
        isOpen={ajusteModal}
        onClose={() => { setAjusteModal(false); setSelectedProduct(null); }}
        producto={selectedProduct}
        onConfirm={handleAjuste}
      />
    </div>
  );
}

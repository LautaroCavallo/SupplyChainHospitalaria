import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Eye,
  Copy,
  Edit,
  SlidersHorizontal,
  Download,
  Plus,
  Loader2,
  TrendingUp,
  AlertTriangle,
  CircleSlash,
} from 'lucide-react';
import { getInventario, getAlertasStockCritico, ajustarStock } from '../api/inventario';
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
  NORMAL: { label: 'En stock', variant: 'success' },
  BAJO: { label: 'Stock bajo', variant: 'warning' },
  CRITICO: { label: 'Crítico', variant: 'danger' },
  SIN_STOCK: { label: 'Sin stock', variant: 'danger' },
};

export default function Inventario() {
  const navigate = useNavigate();
  const [data, setData] = useState<PaginatedResponse<ProductoInventario> | null>(null);
  const [page, setPage] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');
  const [eanSearch, setEanSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertCount, setAlertCount] = useState({ bajo: 0, sinStock: 0 });
  const [ajusteModal, setAjusteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductoInventario | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const search = eanSearch || busqueda;
      const [res, alertas] = await Promise.all([
        getInventario({ page, limit: 10, busqueda: search, estado }),
        getAlertasStockCritico(),
      ]);
      setData(res);
      setAlertCount({
        bajo: alertas.filter((a) => a.nivel === 'BAJO' || a.nivel === 'CRITICO').length,
        sinStock: alertas.filter((a) => a.nivel === 'SIN_STOCK').length,
      });
    } catch {
      setError('Error al cargar el inventario');
    } finally {
      setLoading(false);
    }
  }, [page, busqueda, estado, eanSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [busqueda, estado, eanSearch]);

  const handleAjuste = async (ajusteData: { tipo: string; cantidad: number; motivo: string }) => {
    if (!selectedProduct) return;
    await ajustarStock(selectedProduct.id, ajusteData);
    await fetchData();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const statCards = [
    {
      title: 'PRODUCTOS TOTALES',
      value: data?.total ?? 0,
      badge: <Badge label="+12%" variant="success" />,
      icon: TrendingUp,
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-50',
    },
    {
      title: 'ALERTA BAJO STOCK',
      value: alertCount.bajo,
      extra: (
        <button onClick={() => setEstado('BAJO')} className="text-xs font-medium text-amber-600 hover:underline">
          Revisar
        </button>
      ),
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
    },
    {
      title: 'SIN STOCK',
      value: alertCount.sinStock,
      badge: alertCount.sinStock > 0 ? <Badge label="Crítico" variant="danger" /> : null,
      icon: CircleSlash,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-50',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
        <p className="mt-1 text-sm text-gray-500">
          Supervisión del stock de medicamentos y suministros médicos
        </p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-5">
        {statCards.map((card) => (
          <div key={card.title} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  {card.title}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {card.value.toLocaleString('es-AR')}
                  </span>
                  {card.badge}
                </div>
                {card.extra && <div className="mt-1">{card.extra}</div>}
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg}`}>
                <card.icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre de producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="h-10 rounded-lg border border-gray-200 px-3 pr-8 text-sm text-gray-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="">Todos los estados</option>
            <option value="NORMAL">En stock</option>
            <option value="BAJO">Stock bajo</option>
            <option value="CRITICO">Crítico</option>
            <option value="SIN_STOCK">Sin stock</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="EAN / Troquel"
              value={eanSearch}
              onChange={(e) => setEanSearch(e.target.value)}
              className="h-10 w-40 rounded-lg border border-gray-200 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
            <Download className="h-4 w-4" />
          </button>
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
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    EAN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Troquel
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Cant.
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.data.map((p) => {
                  const nivel = getNivelStock(p);
                  const config = nivelConfig[nivel];
                  return (
                    <tr
                      key={p.id}
                      className="cursor-pointer transition-colors hover:bg-gray-50"
                      onClick={() => navigate(`/inventario/${p.id}`)}
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{p.nombre}</p>
                        <p className="text-xs text-gray-500">{p.categoria}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge label={config.label} variant={config.variant} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.ean ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.troquel ?? '—'}</td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        {p.stockActual.toLocaleString('es-AR')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleCopy(p.ean ?? p.nombre)}
                            title="Copiar"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProduct(p);
                              setAjusteModal(true);
                            }}
                            title="Ajustar stock"
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
        onClick={() => {
          setSelectedProduct(null);
          setAjusteModal(true);
        }}
        className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-teal-700 text-white shadow-lg transition-transform hover:scale-105 hover:bg-teal-800"
        title="Ajuste de stock"
      >
        <Plus className="h-6 w-6" />
      </button>

      <AjusteStockModal
        isOpen={ajusteModal}
        onClose={() => {
          setAjusteModal(false);
          setSelectedProduct(null);
        }}
        producto={selectedProduct}
        onConfirm={handleAjuste}
      />
    </div>
  );
}

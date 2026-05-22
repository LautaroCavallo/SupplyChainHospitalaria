import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, AlertTriangle, CircleSlash, Inbox, Loader2 } from 'lucide-react';
import { getInventario, getAlertasStockCritico } from '../api/inventario';
import { getRecepciones } from '../api/recepciones';
import type { AlertaStockCritico, Recepcion, NivelStock } from '../types';
import Badge from '../components/common/Badge';

const nivelBadge: Record<NivelStock, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' }> = {
  NORMAL: { label: 'Normal', variant: 'success' },
  BAJO: { label: 'Bajo', variant: 'warning' },
  CRITICO: { label: 'Crítico', variant: 'danger' },
  SIN_STOCK: { label: 'Sin stock', variant: 'danger' },
};

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [totalProductos, setTotalProductos] = useState(0);
  const [alertas, setAlertas] = useState<AlertaStockCritico[]>([]);
  const [recepcionesPendientes, setRecepcionesPendientes] = useState(0);
  const [recepcionesRecientes, setRecepcionesRecientes] = useState<Recepcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [invRes, alertasRes, recPendRes, recRecientesRes] = await Promise.all([
        getInventario({ page: 1, limit: 1 }),
        getAlertasStockCritico(),
        getRecepciones({ page: 1, limit: 1, estado: 'BORRADOR' }),
        getRecepciones({ page: 1, limit: 5 }),
      ]);
      setTotalProductos(invRes.total);
      setAlertas(alertasRes);
      setRecepcionesPendientes(recPendRes.total);
      setRecepcionesRecientes(recRecientesRes.data);
    } catch {
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sinStock = alertas.filter((a) => a.nivel === 'SIN_STOCK').length;
  const alertasBajoStock = alertas.filter((a) => a.nivel !== 'SIN_STOCK').length;

  const statCards = [
    { title: 'Total Productos', value: totalProductos, icon: ClipboardList, color: 'bg-teal-50 text-teal-700', iconBg: 'bg-teal-100' },
    { title: 'Alertas Bajo Stock', value: alertasBajoStock, icon: AlertTriangle, color: 'bg-amber-50 text-amber-700', iconBg: 'bg-amber-100' },
    { title: 'Sin Stock', value: sinStock, icon: CircleSlash, color: 'bg-red-50 text-red-700', iconBg: 'bg-red-100' },
    { title: 'Recepciones Pendientes', value: recepcionesPendientes, icon: Inbox, color: 'bg-blue-50 text-blue-700', iconBg: 'bg-blue-100' },
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <p className="text-sm text-red-600">{error}</p>
        <button onClick={fetchData} className="rounded-lg bg-teal-700 px-4 py-2 text-sm text-white hover:bg-teal-800">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Resumen general del sistema de farmacia</p>

      <div className="mt-6 grid grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div key={card.title} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{card.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {card.value.toLocaleString('es-AR')}
                </p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg}`}>
                <card.icon className={`h-6 w-6 ${card.color.split(' ')[1]}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Alertas de Stock</h2>
            <button
              onClick={() => navigate('/inventario')}
              className="text-sm font-medium text-teal-700 hover:text-teal-800"
            >
              Ver todo
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {alertas.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.nombre}</p>
                  <p className="text-xs text-gray-500">{a.categoria}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-700">
                    {a.stockActual} {a.unidad}
                  </span>
                  <Badge
                    label={nivelBadge[a.nivel].label}
                    variant={nivelBadge[a.nivel].variant}
                  />
                </div>
              </div>
            ))}
            {alertas.length === 0 && (
              <p className="px-6 py-8 text-center text-sm text-gray-400">Sin alertas activas</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Recepciones Recientes</h2>
            <button
              onClick={() => navigate('/recepciones')}
              className="text-sm font-medium text-teal-700 hover:text-teal-800"
            >
              Ver todo
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recepcionesRecientes.map((r) => {
              const estadoBadge: Record<string, { label: string; variant: 'success' | 'warning' | 'info' }> = {
                BORRADOR: { label: 'Borrador', variant: 'warning' },
                CONFIRMADA: { label: 'Confirmada', variant: 'info' },
                PROCESADA: { label: 'Procesada', variant: 'success' },
              };
              const badge = estadoBadge[r.estado] ?? { label: r.estado, variant: 'info' as const };
              return (
                <div key={r.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {r.proveedor?.razonSocial ?? 'Proveedor'}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(r.fechaRecepcion)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {r.totalItems} ítems
                    </span>
                    <Badge label={badge.label} variant={badge.variant} />
                  </div>
                </div>
              );
            })}
            {recepcionesRecientes.length === 0 && (
              <p className="px-6 py-8 text-center text-sm text-gray-400">Sin recepciones recientes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

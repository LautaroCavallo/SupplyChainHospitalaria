import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { getDashboard, getActividadReciente } from '../api/dashboard';
import type { DashboardSummary, ActividadReciente } from '../types';

const eventoColors: Record<string, string> = {
  receta_validada: 'bg-green-500',
  stock_ajustado: 'bg-amber-400',
  nueva_recepcion: 'bg-gray-400',
  validacion_rechazada: 'bg-red-500',
  otro: 'bg-gray-300',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary>({ recetasValidadas: 124, medicamentosCriticos: 8, actividadReciente: 45 });
  const [actividad, setActividad] = useState<ActividadReciente[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sumRes, actRes] = await Promise.all([
        getDashboard(),
        getActividadReciente({ limit: 5 }),
      ]);
      setSummary(sumRes);
      setActividad(actRes.data);
    } catch {
      // use defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-5xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-500">Resumen general de la operacion farmaceutica</p>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      ) : (
        <div className="mb-10 grid grid-cols-3 gap-5">
          {/* Card 1: Recetas validadas */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Estado: Óptimo
              </p>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-5xl font-bold text-gray-900">{summary.recetasValidadas}</p>
            <p className="mt-2 text-sm font-medium text-gray-700">Recetas validadas</p>
            <p className="mt-1 text-xs text-gray-400">Hoy</p>
          </div>

          {/* Card 2: Medicamentos críticos — rosado */}
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Urgente
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <p className="text-5xl font-bold text-red-600">
              {String(summary.medicamentosCriticos).padStart(2, '0')}
            </p>
            <p className="mt-2 text-sm font-medium text-gray-800">Medicamentos en estado crítico</p>
            <p className="mt-1 text-xs text-red-500">Requiere atención inmediata</p>
          </div>

          {/* Card 3: Actividad reciente */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                En Tiempo Real
              </p>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-5xl font-bold text-gray-900">{summary.actividadReciente}</p>
            <p className="mt-2 text-sm font-medium text-gray-700">Actividad reciente</p>
            <p className="mt-1 text-xs text-gray-400">Últimos movimientos</p>
          </div>
        </div>
      )}

      {/* Actividad Reciente table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-start justify-between border-b border-gray-50 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Actividad Reciente</h2>
            <p className="mt-0.5 text-sm text-gray-400">Monitoreo de flujo de trabajo en tiempo real</p>
          </div>
          <button
            onClick={() => navigate('/actividad')}
            className="flex items-center gap-1 text-sm font-medium text-brand hover:underline"
          >
            Ver registro completo <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                Evento
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                Referencia / Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                Responsable
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {actividad.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2 w-2 rounded-full ${eventoColors[a.tipoEvento] ?? 'bg-gray-300'}`} />
                    <span className="text-sm text-gray-700">{a.evento}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                  {a.referencia ?? a.producto ?? '—'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{a.hora}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{a.responsable}</td>
              </tr>
            ))}
            {actividad.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400">
                  Sin actividad reciente
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <footer className="mt-8 flex items-center justify-between text-[10px] font-medium uppercase tracking-widest text-gray-400">
        <span>© 2024 Clinical Sanctuary Ecosystem</span>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Estado del servidor: Conectado
          </span>
          <span>Última sincronización: Hace 2m</span>
        </div>
      </footer>
    </div>
  );
}

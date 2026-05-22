import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRightLeft, TrendingUp, Clock } from 'lucide-react';

const reports = [
  {
    title: 'Stock Crítico',
    description: 'Productos con niveles de stock por debajo del mínimo establecido. Incluye alertas activas y sugerencias de reposición.',
    icon: AlertTriangle,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    link: '/inventario',
  },
  {
    title: 'Movimientos del Mes',
    description: 'Resumen de ingresos, egresos y ajustes de stock realizados durante el mes en curso.',
    icon: ArrowRightLeft,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    link: null,
  },
  {
    title: 'Recepciones por Proveedor',
    description: 'Análisis de recepciones agrupadas por proveedor, con totales de ítems y frecuencia de entregas.',
    icon: TrendingUp,
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    link: null,
  },
  {
    title: 'Productos por Vencer',
    description: 'Listado de lotes con fecha de vencimiento próxima. Permite planificar la rotación de stock.',
    icon: Clock,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    link: null,
  },
];

export default function Reportes() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Informes y análisis del sistema de farmacia
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {reports.map((report) => (
          <div
            key={report.title}
            className="group rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${report.iconBg}`}>
                <report.icon className={`h-6 w-6 ${report.iconColor}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{report.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  {report.description}
                </p>
                {report.link ? (
                  <button
                    onClick={() => navigate(report.link!)}
                    className="mt-3 text-sm font-medium text-teal-700 hover:text-teal-800"
                  >
                    Ver reporte →
                  </button>
                ) : (
                  <span className="mt-3 inline-block text-xs font-medium text-gray-400">
                    Próximamente
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

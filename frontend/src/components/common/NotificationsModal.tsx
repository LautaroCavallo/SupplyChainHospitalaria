import { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Inbox, AlertTriangle } from 'lucide-react';
import { getNotificaciones, marcarLeidas } from '../../api/notificaciones';
import type { Notificacion, TipoNotificacion } from '../../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  return `Hace ${Math.floor(hrs / 24)}d`;
}

const iconConfig: Record<TipoNotificacion, { bg: string; icon: typeof AlertCircle; color: string }> = {
  stock_critico:   { bg: 'bg-red-100',    icon: AlertCircle,   color: 'text-red-600' },
  receta_validada: { bg: 'bg-green-100',  icon: CheckCircle,   color: 'text-green-600' },
  nueva_recepcion: { bg: 'bg-gray-100',   icon: Inbox,         color: 'text-gray-600' },
  lote_por_vencer: { bg: 'bg-amber-100',  icon: AlertTriangle, color: 'text-amber-600' },
};

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [notifs, setNotifs] = useState<Notificacion[]>([]);

  useEffect(() => {
    if (isOpen) {
      getNotificaciones().then(setNotifs).catch(() => {});
    }
  }, [isOpen]);

  const handleMarcarLeidas = async () => {
    await marcarLeidas();
    setNotifs((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-6">
      <div className="fixed inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-96 rounded-xl bg-white shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Notificaciones</h2>
            <p className="text-xs text-gray-500">Alertas y actualizaciones del sistema</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
          {notifs.map((n) => {
            const cfg = iconConfig[n.tipo] ?? iconConfig.stock_critico;
            const IconComp = cfg.icon;
            return (
              <div key={n.id} className={`flex gap-3 px-5 py-4 ${n.leida ? 'opacity-60' : ''}`}>
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${cfg.bg}`}>
                  <IconComp className={`h-4 w-4 ${cfg.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{n.titulo}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{n.descripcion}</p>
                  <p className="mt-1 text-[11px] text-gray-400">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.leida && (
                  <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand" />
                )}
              </div>
            );
          })}
          {notifs.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-gray-400">Sin notificaciones</p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
          <button
            onClick={handleMarcarLeidas}
            className="text-xs font-medium text-brand hover:underline"
          >
            Marcar todas como leídas
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-brand px-4 py-1.5 text-xs font-medium text-white hover:bg-brand-light"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Inbox, AlertTriangle } from 'lucide-react';
import { getNotificaciones, marcarLeidas } from '../../api/notificaciones';
import type { Notificacion, TipoNotificacion } from '../../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function timeLabel(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;

  const diffHrs = Math.floor(diffMins / 60);
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    return `Hoy, ${hh}:${mm}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer';

  if (diffHrs < 48) return `Hace ${diffHrs}h`;
  return `Hace ${Math.floor(diffHrs / 24)}d`;
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
      <div className="relative w-96 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5">
          <div>
            <h2 className="font-serif text-2xl font-bold text-brand">Notificaciones</h2>
            <p className="mt-0.5 text-sm text-gray-500">Actividad y alertas recientes del sistema</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* List */}
        <div className="max-h-[420px] divide-y divide-gray-50 overflow-y-auto">
          {notifs.map((n) => {
            const cfg = iconConfig[n.tipo] ?? iconConfig.stock_critico;
            const IconComp = cfg.icon;
            return (
              <div key={n.id} className={`flex gap-4 px-6 py-4 ${n.leida ? 'opacity-60' : ''}`}>
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${cfg.bg}`}>
                  <IconComp className={`h-4 w-4 ${cfg.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">{n.titulo}</p>
                    <div className="flex flex-shrink-0 items-center gap-1.5">
                      <span className="whitespace-nowrap text-xs text-gray-400">{timeLabel(n.createdAt)}</span>
                      {!n.leida && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />}
                    </div>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">{n.descripcion}</p>
                </div>
              </div>
            );
          })}
          {notifs.length === 0 && (
            <p className="px-6 py-10 text-center text-sm text-gray-400">Sin notificaciones</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-3.5">
          <button onClick={handleMarcarLeidas} className="text-sm font-medium text-gray-600 hover:text-brand">
            Marcar todas como leídas
          </button>
          <button onClick={onClose} className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

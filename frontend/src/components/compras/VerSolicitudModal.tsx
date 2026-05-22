import { X } from 'lucide-react';
import type { SolicitudCompra } from '../../types';
import Badge from '../common/Badge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  solicitud: SolicitudCompra | null;
}

const estadoBadge: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'default' }> = {
  APROBADA:  { label: 'Aprobada',  variant: 'success' },
  PENDIENTE: { label: 'Pendiente', variant: 'warning' },
  RECHAZADA: { label: 'Rechazada', variant: 'default' },
  ENVIADA:   { label: 'Enviada',   variant: 'info' },
};

export default function VerSolicitudModal({ isOpen, onClose, solicitud }: Props) {
  if (!isOpen || !solicitud) return null;

  const badge = estadoBadge[solicitud.estado] ?? { label: solicitud.estado, variant: 'default' as const };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Solicitud de compra</h2>
            <Badge label={badge.label} variant={badge.variant} />
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">ID</p>
              <p className="font-semibold text-brand">{solicitud.id}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Fecha</p>
              <p className="font-medium text-gray-900">{solicitud.fechaSolicitud ?? solicitud.createdAt?.slice(0, 10)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Proveedor</p>
              <p className="font-medium text-gray-900">{solicitud.proveedorNombre ?? '—'}</p>
            </div>
          </div>

          {solicitud.observaciones && (
            <div className="mb-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
              <span className="font-medium">Observaciones:</span> {solicitud.observaciones}
            </div>
          )}

          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Medicamento</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Proveedor</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Motivo</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">Cant.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {solicitud.detalles.map((d, i) => (
                <tr key={d.id ?? i}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{d.nombreProducto ?? `Producto ${i + 1}`}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{d.nombreProveedor ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{d.motivo ?? '—'}</td>
                  <td className="px-4 py-3 text-center text-sm font-bold text-gray-900">{d.cantidadSolicitada}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t border-gray-100 px-6 py-4">
          <button onClick={onClose} className="rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-light">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

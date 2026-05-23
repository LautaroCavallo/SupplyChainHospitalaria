import { X, Calendar, Pill, Beaker } from 'lucide-react';
import type { SolicitudCompra } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  solicitud: SolicitudCompra | null;
}

function MedIcon({ name }: { name: string }) {
  const lower = (name ?? '').toLowerCase();
  const isAnti = lower.includes('amox') || lower.includes('antibio') || lower.includes('cipro');
  return (
    <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${isAnti ? 'bg-green-100' : 'bg-gray-100'}`}>
      {isAnti
        ? <Beaker className="h-3.5 w-3.5 text-green-700" />
        : <Pill className="h-3.5 w-3.5 text-gray-500" />
      }
    </div>
  );
}

export default function VerSolicitudModal({ isOpen, onClose, solicitud }: Props) {
  if (!isOpen || !solicitud) return null;

  const fecha = solicitud.fechaSolicitud
    ? solicitud.fechaSolicitud
    : solicitud.createdAt
      ? new Date(solicitud.createdAt).toLocaleDateString('es-AR')
      : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-[#f5f7f5] shadow-2xl">

        {/* Title */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-3xl font-bold text-brand">Solicitud de compra</h2>
              <p className="mt-1 text-sm text-gray-500">Datos de medicamentos solicitados para reposición</p>
            </div>
            <button onClick={onClose} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Date + Observaciones */}
        <div className="grid grid-cols-[200px_1fr] gap-4 px-8 pb-6">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Fecha de Solicitud</p>
            <div className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700">
              <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
              {fecha}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Observaciones Generales</p>
            <div className="min-h-[44px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
              {solicitud.observaciones || 'Observaciones para el departamento de compras...'}
            </div>
          </div>
        </div>

        {/* Items section */}
        <div className="px-8 pb-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-serif text-xl font-bold text-brand">Medicamentos Solicitados</h3>
            <span className="text-xs italic text-gray-400">
              {solicitud.detalles.length} medicamento{solicitud.detalles.length !== 1 ? 's' : ''} en esta solicitud
            </span>
          </div>

          {/* Table header */}
          <div className="mb-1 grid grid-cols-[2fr_1.5fr_1.5fr_60px_60px_90px] gap-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            <span>Medicamento</span>
            <span>Proveedor</span>
            <span>Motivo</span>
            <span className="text-center">S. Actual</span>
            <span className="text-center">S. Mín</span>
            <span className="text-center">Cant. Solicitada</span>
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {solicitud.detalles.map((d, i) => {
              const isCritical = d.stockActual != null && d.stockMinimo != null && d.stockActual <= d.stockMinimo;
              return (
                <div key={d.id ?? i} className="grid grid-cols-[2fr_1.5fr_1.5fr_60px_60px_90px] items-center gap-2 rounded-xl bg-white px-3 py-2.5">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <MedIcon name={d.nombreProducto ?? ''} />
                    <span className="truncate text-sm font-semibold text-gray-900">{d.nombreProducto ?? `Producto ${i + 1}`}</span>
                  </div>
                  <span className="truncate text-sm text-gray-600">{d.nombreProveedor ?? '—'}</span>
                  <span className="truncate text-sm text-gray-600">{d.motivo ?? '—'}</span>
                  <span className="text-center text-sm text-gray-700">{d.stockActual ?? '—'}</span>
                  <span className={`text-center text-sm font-bold ${isCritical ? 'text-red-600' : 'text-gray-700'}`}>
                    {d.stockMinimo ?? '—'}
                  </span>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-sm font-bold text-gray-900">{d.cantidadSolicitada}</span>
                    <span className="text-[10px] text-gray-400">uds</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-8 py-4">
          <button onClick={onClose} className="text-sm font-medium text-gray-500 hover:text-gray-700">
            Cancelar
          </button>
          <div className="flex items-center gap-3">
            <button className="rounded-full border border-brand px-6 py-2.5 text-sm font-semibold text-brand hover:bg-green-50">
              Guardar borrador
            </button>
            <button className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-light">
              Confirmar solicitud
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

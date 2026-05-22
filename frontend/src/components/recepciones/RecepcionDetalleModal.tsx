import { X, Printer, ChevronRight } from 'lucide-react';
import type { Recepcion } from '../../types';
import Badge from '../common/Badge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  recepcion: Recepcion | null;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function RecepcionDetalleModal({ isOpen, onClose, recepcion }: Props) {
  if (!isOpen || !recepcion) return null;

  const nombreProveedor = recepcion.proveedor?.razonSocial ?? 'Proveedor';
  const initials = getInitials(nombreProveedor);
  const recId = recepcion.id.startsWith('REC') ? recepcion.id : `REC-${recepcion.id.slice(-4).toUpperCase()}`;

  const badgeVariant = recepcion.estado === 'PROCESADA' ? 'success' : recepcion.estado === 'CONFIRMADA' ? 'info' : 'warning';
  const badgeLabel = recepcion.estado === 'PROCESADA' ? 'Procesada' : recepcion.estado === 'CONFIRMADA' ? 'Confirmada' : 'Borrador';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-800 text-sm font-bold text-white">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900">{nombreProveedor}</h2>
                <Badge label={badgeLabel} variant={badgeVariant} />
              </div>
              <p className="text-xs text-gray-500">{recId} · {formatDate(recepcion.fechaRecepcion)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Info row */}
        <div className="grid grid-cols-3 gap-4 border-b border-gray-50 px-6 py-4 text-sm">
          {recepcion.transportista && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Transportista</p>
              <p className="font-medium text-gray-900">{recepcion.transportista}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Responsable</p>
            <p className="font-medium text-gray-900">Dr. Alejandro V.</p>
            <p className="text-xs text-green-600">Firma digital validada</p>
          </div>
          {recepcion.cantBultos && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Total Bultos</p>
              <p className="font-medium text-gray-900">{recepcion.cantBultos} Cajas · {recepcion.detalles.length} SKUs</p>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="max-h-72 overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Cant.</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Lote</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">Vencimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recepcion.detalles.slice(0, 3).map((d, i) => (
                <tr key={d.id ?? i} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <p className="text-sm font-medium text-gray-900">{d.producto?.nombre ?? `Producto ${i + 1}`}</p>
                    {d.laboratorio && <p className="text-xs text-gray-400">{d.laboratorio}</p>}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700">{d.cantidad}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{d.lote}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">
                    {d.precio != null ? `$${d.precio}` : '—'}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700">{d.fechaVencimiento}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
          <p className="text-xs text-gray-400">
            Mostrando 1–{Math.min(3, recepcion.detalles.length)} de {recepcion.totalItems} ítems
          </p>
          <button className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">
            Ver todos <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

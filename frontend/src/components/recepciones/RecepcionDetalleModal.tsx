import { useState } from 'react';
import { Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Recepcion } from '../../types';
import Badge from '../common/Badge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  recepcion: Recepcion | null;
}

const PAGE_SIZE = 3;

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function formatDateLong(d: string): string {
  return new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function RecepcionDetalleModal({ isOpen, onClose, recepcion }: Props) {
  const [page, setPage] = useState(1);

  if (!isOpen || !recepcion) return null;

  const nombreProveedor = recepcion.proveedor?.razonSocial ?? 'Proveedor';
  const initials = getInitials(nombreProveedor);
  const recId = recepcion.id.startsWith('REC') ? recepcion.id : `REC-${recepcion.id.slice(-4).toUpperCase()}`;

  const badgeVariant = recepcion.estado === 'PROCESADA' ? 'success' : recepcion.estado === 'CONFIRMADA' ? 'info' : 'warning';
  const badgeLabel = recepcion.estado === 'PROCESADA' ? 'Procesada' : recepcion.estado === 'CONFIRMADA' ? 'Confirmada' : 'Borrador';

  const totalItems = recepcion.totalItems ?? recepcion.detalles.length;
  const totalPages = Math.ceil(recepcion.detalles.length / PAGE_SIZE);
  const pageDetalles = recepcion.detalles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const startIdx = (page - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(page * PAGE_SIZE, recepcion.detalles.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-7 py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gray-200 text-sm font-bold text-gray-700">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-serif text-2xl font-bold text-brand leading-tight">{nombreProveedor}</h2>
                <Badge label={badgeLabel} variant={badgeVariant} />
              </div>
              <p className="mt-0.5 text-sm text-gray-500">Recepción ID: {recId}</p>
              <p className="text-sm text-gray-500">{formatDateLong(recepcion.fechaRecepcion)}</p>
            </div>
          </div>
          <button
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </button>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-3 gap-4 px-7 py-5">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Transportista</p>
            <p className="text-sm font-semibold text-gray-900">{recepcion.transportista ?? 'Logística Express S.A.'}</p>
            <p className="text-xs text-gray-500">Guía #{recepcion.numeroGuia ?? '7728190'}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Responsable</p>
            <p className="text-sm font-semibold text-gray-900">Dr. Alejandro V.</p>
            <p className="text-xs text-green-600">Firma digital validada</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Total Bultos</p>
            <p className="text-sm font-semibold text-gray-900">
              {recepcion.cantBultos ?? 12} Cajas
            </p>
            <p className="text-xs text-gray-500">{recepcion.detalles.length} SKUs diferentes</p>
          </div>
        </div>

        {/* Table */}
        <div className="px-7 pb-4">
          <h3 className="mb-3 font-serif text-lg font-bold text-brand">Detalle de Productos Ingresados</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Producto</th>
                <th className="py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Cant.</th>
                <th className="py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Lote</th>
                <th className="py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Precio</th>
                <th className="py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Vencimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageDetalles.map((d, i) => (
                <tr key={d.id ?? i}>
                  <td className="py-3">
                    <p className="text-sm font-semibold text-gray-900">{d.producto?.nombre ?? `Producto ${i + 1}`}</p>
                    {d.laboratorio && <p className="text-xs text-gray-400">Lab: {d.laboratorio}</p>}
                  </td>
                  <td className="py-3 text-sm font-bold text-gray-900">{d.cantidad}</td>
                  <td className="py-3 text-sm text-gray-600">{d.lote}</td>
                  <td className="py-3 text-sm text-gray-600">{d.precio != null ? `$${d.precio.toLocaleString('es-AR')}` : '—'}</td>
                  <td className="py-3 text-sm text-gray-600">{d.fechaVencimiento}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-7 py-4">
          <p className="text-xs text-gray-400">
            Mostrando {startIdx} - {endIdx} de {totalItems} items en esta recepción
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

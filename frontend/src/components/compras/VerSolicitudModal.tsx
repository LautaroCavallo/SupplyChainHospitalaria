import { useState, useEffect } from 'react';
import { X, Calendar, Pill, Beaker, Send, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { SolicitudCompra } from '../../types';
import { enviarOrdenCompra, getCompra } from '../../api/compras';
import Badge from '../common/Badge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  solicitud: SolicitudCompra | null;
  onRefresh?: () => void;
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

const estadoBadge: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'default' }> = {
  APROBADA:  { label: 'Aprobada',  variant: 'success' },
  PENDIENTE: { label: 'Pendiente', variant: 'warning' },
  RECHAZADA: { label: 'Rechazada', variant: 'default' },
  ENVIADA:   { label: 'Enviada',   variant: 'info' },
};

const prioridadLabel: Record<string, string> = {
  BAJA: 'Baja',
  NORMAL: 'Normal',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
};

export default function VerSolicitudModal({ isOpen, onClose, solicitud, onRefresh }: Props) {
  const [enviando, setEnviando] = useState(false);
  const [detalle, setDetalle] = useState<SolicitudCompra | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // Siempre fetchea el detalle completo al abrir (la lista no incluye precios ni adjudicación)
  useEffect(() => {
    if (!isOpen || !solicitud) { setDetalle(null); return; }
    setLoadingDetalle(true);
    getCompra(solicitud.id)
      .then(setDetalle)
      .catch(() => setDetalle(solicitud)) // fallback al objeto de lista si falla
      .finally(() => setLoadingDetalle(false));
  }, [isOpen, solicitud?.id]);

  if (!isOpen || !solicitud) return null;

  // Usar el detalle completo si está disponible, sino el objeto de lista
  const data = detalle ?? solicitud;

  const fecha = data.fechaSolicitud
    ? data.fechaSolicitud
    : data.createdAt
      ? new Date(data.createdAt).toLocaleDateString('es-AR')
      : '—';

  const badge = estadoBadge[data.estado] ?? { label: data.estado, variant: 'default' as const };

  const handleEnviar = async () => {
    try {
      setEnviando(true);
      await enviarOrdenCompra(data.id);
      onRefresh?.();
      onClose();
    } catch {
      // graceful
    } finally {
      setEnviando(false);
    }
  };

  const totalOC = data.estado === 'APROBADA'
    ? data.detalles.reduce((acc, d) => {
        const cant = d.cantidadAprobada ?? d.cantidadSolicitada;
        const precio = d.precioUnitario ?? 0;
        return acc + cant * precio;
      }, 0)
    : 0;

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#f5f7f5] shadow-2xl">

        {/* Header */}
        <div className="px-8 pt-8 pb-4 sticky top-0 bg-[#f5f7f5] z-10 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-3xl font-bold text-brand">Solicitud de Compra</h2>
              <p className="mt-1 text-sm text-gray-500">ID: {data.id}</p>
            </div>
            <button onClick={onClose} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">

          {/* Spinner mientras carga el detalle */}
          {loadingDetalle && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
            </div>
          )}

          {!loadingDetalle && (
            <>
              {/* ── Sección 1: OC de Farmacia ───────────────────────────────── */}
              <section>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-400">OC de Farmacia</h3>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-4">
                  <div>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Estado</p>
                    <Badge label={badge.label} variant={badge.variant} />
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Prioridad</p>
                    <p className="text-sm font-semibold text-gray-800">{prioridadLabel[data.prioridad] ?? data.prioridad}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Fecha Solicitud</p>
                    <div className="flex items-center gap-1.5 text-sm text-gray-700">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      {fecha}
                    </div>
                  </div>
                  {data.motivo && (
                    <div>
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Motivo</p>
                      <p className="text-sm text-gray-700">{data.motivo}</p>
                    </div>
                  )}
                </div>

                {data.ordenCompraExternaId && (
                  <div className="mb-4 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3">
                    <p className="text-xs font-semibold text-brand">Referencia enviada a Compras: {data.ordenCompraExternaId}</p>
                  </div>
                )}

                {/* Tabla items solicitados */}
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Medicamento</th>
                        <th className="px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-widest text-gray-400">Cant. Solicitada</th>
                        <th className="px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-widest text-gray-400">Unidad</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                      {data.detalles.map((d, i) => {
                        const nombre = (d as any).producto?.nombre ?? d.nombreProducto ?? `Producto ${i + 1}`;
                        return (
                          <tr key={d.id ?? i}>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <MedIcon name={nombre} />
                                <span className="text-sm font-semibold text-gray-900">{nombre}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-center text-sm font-bold text-gray-900">{d.cantidadSolicitada}</td>
                            <td className="px-4 py-2.5 text-center text-sm text-gray-500">{d.unidad ?? 'unidad'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* ── Banner RECHAZADA ────────────────────────────────────────── */}
              {data.estado === 'RECHAZADA' && (
                <section className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <h3 className="font-semibold text-red-700">Solicitud Rechazada por Compras</h3>
                  </div>
                  {data.referenciaExterna && (
                    <p className="text-sm text-red-600">Referencia: <span className="font-mono font-semibold">{data.referenciaExterna}</span></p>
                  )}
                  {data.observaciones && (
                    <p className="text-sm text-red-600 mt-1">Motivo: {data.observaciones}</p>
                  )}
                </section>
              )}

              {/* ── Sección 2: Adjudicación de Compras (solo APROBADA) ──────── */}
              {data.estado === 'APROBADA' && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Adjudicación de Compras</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mb-4">
                    {data.proveedorAdjudicadoRazonSocial && (
                      <div>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Proveedor Adjudicado</p>
                        <p className="text-sm font-semibold text-gray-800">{data.proveedorAdjudicadoRazonSocial}</p>
                      </div>
                    )}
                    {data.fechaAprobacion && (
                      <div>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Fecha Aprobación</p>
                        <p className="text-sm text-gray-700">{new Date(data.fechaAprobacion).toLocaleDateString('es-AR')}</p>
                      </div>
                    )}
                    {data.fechaEntregaEstimada && (
                      <div>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Entrega Estimada</p>
                        <p className="text-sm text-gray-700">{new Date(data.fechaEntregaEstimada).toLocaleDateString('es-AR')}</p>
                      </div>
                    )}
                    {data.observaciones && (
                      <div className="col-span-full">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Observaciones</p>
                        <p className="text-sm text-gray-700">{data.observaciones}</p>
                      </div>
                    )}
                  </div>

                  {/* Tabla items adjudicados */}
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Medicamento</th>
                          <th className="px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-widest text-gray-400">Cant. Aprobada</th>
                          <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest text-gray-400">Precio Unitario</th>
                          <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest text-gray-400">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 bg-white">
                        {data.detalles.map((d, i) => {
                          const nombre = (d as any).producto?.nombre ?? d.nombreProducto ?? `Producto ${i + 1}`;
                          const cant = d.cantidadAprobada ?? d.cantidadSolicitada;
                          const precio = d.precioUnitario ?? 0;
                          const subtotal = cant * precio;
                          return (
                            <tr key={d.id ?? i}>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  <MedIcon name={nombre} />
                                  <span className="text-sm font-semibold text-gray-900">{nombre}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2.5 text-center text-sm font-bold text-gray-900">{cant}</td>
                              <td className="px-4 py-2.5 text-right text-sm text-gray-700">
                                {precio > 0 ? formatCurrency(precio) : '—'}
                              </td>
                              <td className="px-4 py-2.5 text-right text-sm font-semibold text-gray-900">
                                {precio > 0 ? formatCurrency(subtotal) : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {totalOC > 0 && (
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={3} className="px-4 py-2.5 text-right text-sm font-semibold text-gray-700">Total OC</td>
                            <td className="px-4 py-2.5 text-right text-sm font-bold text-brand">{formatCurrency(totalOC)}</td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </section>
              )}

              {/* ── ENVIADA: en proceso ─────────────────────────────────────── */}
              {data.estado === 'ENVIADA' && (
                <div className="flex items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3">
                  <Clock className="h-4 w-4 text-brand" />
                  <p className="text-sm font-medium text-brand">En proceso de licitación...</p>
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-8 py-4 sticky bottom-0">
          {(data.estado === 'BORRADOR' || data.estado === 'PENDIENTE') ? (
            <button onClick={onClose} className="text-sm font-medium text-gray-500 hover:text-gray-700">
              Cancelar
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            {data.estado === 'PENDIENTE' && (
              <button
                onClick={handleEnviar}
                disabled={enviando}
                className="flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-light disabled:opacity-50"
              >
                {enviando
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Send className="h-4 w-4" />
                }
                Enviar a Compras
              </button>
            )}
            {data.estado !== 'BORRADOR' && data.estado !== 'PENDIENTE' && (
              <button
                onClick={onClose}
                className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-light"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

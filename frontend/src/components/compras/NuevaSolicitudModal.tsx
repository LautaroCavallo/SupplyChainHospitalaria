import { useState, useRef } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { crearCompra } from '../../api/compras';

interface SolicitudRow {
  key: number;
  medicamento: string;
  proveedor: string;
  motivo: string;
  stockActual: number;
  stockMin: number;
  cantSolicitada: number;
}

function emptyRow(key: number): SolicitudRow {
  return { key, medicamento: '', proveedor: '', motivo: '', stockActual: 0, stockMin: 0, cantSolicitada: 0 };
}

const motivos = ['Reposición rutinaria', 'Stock crítico', 'Demanda aumentada', 'Otro'];
const proveedoresMock = ['Laboratorio Central S.A.', 'Global Medical Supplies', 'PharmaDirect Logística'];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NuevaSolicitudModal({ isOpen, onClose }: Props) {
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [observaciones, setObservaciones] = useState('');
  const [rows, setRows] = useState<SolicitudRow[]>([emptyRow(1)]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextKey = useRef(2);

  const updateRow = (key: number, field: keyof SolicitudRow, value: string | number) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  };
  const addRow = () => { setRows((prev) => [...prev, emptyRow(nextKey.current++)]); };
  const removeRow = (key: number) => { setRows((prev) => prev.length > 1 ? prev.filter((r) => r.key !== key) : prev); };

  const handleConfirmar = async () => {
    try {
      setSaving(true);
      setError(null);
      await crearCompra({
        fechaSolicitud: fecha,
        observaciones,
        detalles: rows.filter((r) => r.medicamento).map((r) => ({
          productoId: r.medicamento,
          nombreProducto: r.medicamento,
          proveedorId: r.proveedor,
          nombreProveedor: r.proveedor,
          motivo: r.motivo,
          stockActual: r.stockActual,
          stockMinimo: r.stockMin,
          cantidadSolicitada: r.cantSolicitada,
        })),
      });
      onClose();
    } catch {
      setError('Error al crear la solicitud');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Nueva solicitud de compra</h2>
            <p className="text-xs text-gray-400">Complete los datos para generar la solicitud</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          {/* Date + observations */}
          <div className="mb-5 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Fecha de Solicitud</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Observaciones Generales</label>
              <input type="text" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Opcional..."
                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none" />
            </div>
          </div>

          {/* Items */}
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Medicamentos a solicitar</h3>
            <span className="text-xs text-gray-400">{rows.filter((r) => r.medicamento).length} medicamentos en esta solicitud</span>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Medicamento</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Proveedor</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Motivo</th>
                <th className="w-20 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">S. Actual</th>
                <th className="w-20 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">S. Mín</th>
                <th className="w-24 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">Cant. Solicitada</th>
                <th className="w-10 px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((row) => (
                <tr key={row.key}>
                  <td className="px-3 py-2">
                    <input type="text" value={row.medicamento} onChange={(e) => updateRow(row.key, 'medicamento', e.target.value)}
                      placeholder="Nombre medicamento..."
                      className="h-8 w-full rounded-lg border border-gray-200 px-2 text-sm focus:border-brand focus:outline-none" />
                  </td>
                  <td className="px-3 py-2">
                    <select value={row.proveedor} onChange={(e) => updateRow(row.key, 'proveedor', e.target.value)}
                      className="h-8 w-full rounded-lg border border-gray-200 px-2 text-sm focus:border-brand focus:outline-none">
                      <option value="">Seleccionar...</option>
                      {proveedoresMock.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select value={row.motivo} onChange={(e) => updateRow(row.key, 'motivo', e.target.value)}
                      className="h-8 w-full rounded-lg border border-gray-200 px-2 text-sm focus:border-brand focus:outline-none">
                      <option value="">Seleccionar...</option>
                      {motivos.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" min={0} value={row.stockActual || ''} onChange={(e) => updateRow(row.key, 'stockActual', Number(e.target.value))}
                      className="h-8 w-full rounded-lg border border-gray-200 px-2 text-center text-sm focus:border-brand focus:outline-none" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" min={0} value={row.stockMin || ''} onChange={(e) => updateRow(row.key, 'stockMin', Number(e.target.value))}
                      className={`h-8 w-full rounded-lg border px-2 text-center text-sm focus:outline-none ${row.stockActual > 0 && row.stockActual <= row.stockMin ? 'border-red-300 text-red-600 focus:border-red-500' : 'border-gray-200 focus:border-brand'}`} />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" min={1} value={row.cantSolicitada || ''} onChange={(e) => updateRow(row.key, 'cantSolicitada', Number(e.target.value))}
                      className="h-8 w-full rounded-lg border border-gray-200 px-2 text-center text-sm focus:border-brand focus:outline-none" />
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => removeRow(row.key)} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={addRow} className="mt-3 flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-light">
            <Plus className="h-4 w-4" />
            + Agregar medicamento
          </button>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancelar
          </button>
          <button className="rounded-xl border border-brand px-5 py-2.5 text-sm font-medium text-brand hover:bg-green-50">
            Guardar borrador
          </button>
          <button onClick={handleConfirmar} disabled={saving}
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-light disabled:opacity-50">
            {saving ? <Loader2 className="mr-1 inline h-4 w-4 animate-spin" /> : null}
            Confirmar solicitud
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef } from 'react';
import { X, Calendar, Trash2, Loader2, Pill, Beaker } from 'lucide-react';
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
  return { key, medicamento: '', proveedor: '', motivo: 'Stock Critico', stockActual: 0, stockMin: 0, cantSolicitada: 0 };
}

const motivos = ['Stock Critico', 'Reposición Mensual', 'Demanda aumentada', 'Reposición rutinaria', 'Otro'];
const proveedoresMock = ['Farmacéutica Global', 'Laboratorios del Sur', 'Droguería Sur', 'Global Medical Supplies', 'PharmaDirect Logística'];

function MedIcon({ name }: { name: string }) {
  const lower = name.toLowerCase();
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

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NuevaSolicitudModal({ isOpen, onClose }: Props) {
  const [fecha] = useState(() =>
    new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  );
  const [observaciones, setObservaciones] = useState('');
  const [rows, setRows] = useState<SolicitudRow[]>([emptyRow(1)]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextKey = useRef(2);

  const updateRow = (key: number, field: keyof SolicitudRow, value: string | number) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));

  const addRow = () => setRows((prev) => [...prev, emptyRow(nextKey.current++)]);
  const removeRow = (key: number) => setRows((prev) => prev.length > 1 ? prev.filter((r) => r.key !== key) : prev);

  const handleConfirmar = async () => {
    try {
      setSaving(true); setError(null);
      await crearCompra({
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
    } catch { setError('Error al crear la solicitud'); }
    finally { setSaving(false); }
  };

  if (!isOpen) return null;

  const filledCount = rows.filter((r) => r.medicamento).length;

  const selectCls = 'h-8 rounded-lg border border-gray-200 bg-white px-2 pr-6 text-xs text-gray-700 focus:border-brand focus:outline-none appearance-none';
  const numInputCls = 'h-9 w-16 rounded-xl border border-gray-200 bg-white px-2 text-center text-sm font-semibold text-gray-900 focus:border-brand focus:outline-none';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-[#f5f7f5] shadow-2xl">

        {/* Title */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-3xl font-bold text-brand">Nueva solicitud de compra</h2>
              <p className="mt-1 text-sm text-gray-500">Complete los datos para solicitar reposición de medicamentos</p>
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
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Añada notas adicionales para el departamento de compras..."
              rows={2}
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/20"
            />
          </div>
        </div>

        {/* Items section */}
        <div className="px-8 pb-4">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-serif text-xl font-bold text-brand">Medicamentos a solicitar</h3>
            <span className="text-xs italic text-gray-400">
              {filledCount} medicamento{filledCount !== 1 ? 's' : ''} en esta solicitud
            </span>
          </div>

          {/* Table header */}
          <div className="mb-1 grid grid-cols-[2fr_1.5fr_1.5fr_60px_60px_90px_32px] gap-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            <span>Medicamento</span>
            <span>Proveedor</span>
            <span>Motivo</span>
            <span className="text-center">S. Actual</span>
            <span className="text-center">S. Mín</span>
            <span className="text-center">Cant. Solicitada</span>
            <span />
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {rows.map((row) => {
              const isCritical = row.stockActual > 0 && row.stockActual <= row.stockMin;
              return (
                <div key={row.key} className="grid grid-cols-[2fr_1.5fr_1.5fr_60px_60px_90px_32px] items-center gap-2 rounded-xl bg-white px-3 py-2.5">
                  {/* Medicamento */}
                  <div className="flex items-center gap-2 overflow-hidden">
                    <MedIcon name={row.medicamento} />
                    <input
                      type="text"
                      value={row.medicamento}
                      onChange={(e) => updateRow(row.key, 'medicamento', e.target.value)}
                      placeholder="Nombre medicamento..."
                      className="min-w-0 flex-1 bg-transparent text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none"
                    />
                  </div>
                  {/* Proveedor */}
                  <div className="relative">
                    <select value={row.proveedor} onChange={(e) => updateRow(row.key, 'proveedor', e.target.value)} className={selectCls + ' w-full'}>
                      <option value="">Seleccionar...</option>
                      {proveedoresMock.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">▾</span>
                  </div>
                  {/* Motivo */}
                  <div className="relative">
                    <select value={row.motivo} onChange={(e) => updateRow(row.key, 'motivo', e.target.value)} className={selectCls + ' w-full'}>
                      {motivos.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">▾</span>
                  </div>
                  {/* S. Actual */}
                  <input type="number" min={0}
                    value={row.stockActual || ''}
                    onChange={(e) => updateRow(row.key, 'stockActual', Number(e.target.value))}
                    className="h-8 w-full rounded-lg border border-gray-200 bg-white px-1 text-center text-sm text-gray-700 focus:border-brand focus:outline-none"
                  />
                  {/* S. Mín */}
                  <input type="number" min={0}
                    value={row.stockMin || ''}
                    onChange={(e) => updateRow(row.key, 'stockMin', Number(e.target.value))}
                    className={`h-8 w-full rounded-lg border px-1 text-center text-sm font-bold focus:outline-none ${isCritical ? 'border-red-200 text-red-600' : 'border-gray-200 text-gray-700 focus:border-brand'}`}
                  />
                  {/* Cant. solicitada */}
                  <div className="flex items-center gap-1">
                    <input type="number" min={1}
                      value={row.cantSolicitada || ''}
                      onChange={(e) => updateRow(row.key, 'cantSolicitada', Number(e.target.value))}
                      className={numInputCls}
                    />
                    <span className="text-[10px] text-gray-400">uds</span>
                  </div>
                  {/* Delete */}
                  <button onClick={() => removeRow(row.key)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add row button */}
          <button
            onClick={addRow}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-brand hover:text-brand"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-current text-xs font-bold">+</span>
            Agregar medicamento
          </button>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
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
            <button onClick={handleConfirmar} disabled={saving}
              className="flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-light disabled:opacity-50">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar solicitud
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

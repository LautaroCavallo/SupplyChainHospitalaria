import { useState, useRef, useEffect } from 'react';
import { X, Calendar, Trash2, Loader2, Pill, Beaker, Search } from 'lucide-react';
import { crearCompra } from '../../api/compras';
import { getInventario } from '../../api/inventario';
import type { ProductoInventario } from '../../types';

interface SolicitudRow {
  key: number;
  productoId: string;
  nombreProducto: string;
  stockActual: number;
  stockMin: number;
  proveedor: string;
  motivo: string;
  cantSolicitada: number;
}

function emptyRow(key: number): SolicitudRow {
  return { key, productoId: '', nombreProducto: '', proveedor: '', motivo: 'Stock Critico', stockActual: 0, stockMin: 0, cantSolicitada: 1 };
}

const motivos = ['Stock Critico', 'Reposición Mensual', 'Demanda aumentada', 'Reposición rutinaria', 'Otro'];

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

// ── Autocomplete de producto ────────────────────────────────────────────────
interface ProductoAutocompleteProps {
  value: string;
  displayValue: string;
  onChange: (productoId: string, nombre: string, stockActual: number, stockMin: number, proveedor: string) => void;
}

function ProductoAutocomplete({ value, displayValue, onChange }: ProductoAutocompleteProps) {
  const [query, setQuery] = useState(displayValue);
  const [results, setResults] = useState<ProductoInventario[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // sincronizar si el padre resetea el display
  useEffect(() => { setQuery(displayValue); }, [displayValue]);

  // cerrar al hacer click afuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInput = (text: string) => {
    setQuery(text);
    if (!text) { setResults([]); setOpen(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await getInventario({ busqueda: text, limit: 8, page: 1 });
        setResults(res.data ?? []);
        setOpen(true);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300);
  };

  const handleSelect = (p: ProductoInventario) => {
    setQuery(p.nombre);
    setOpen(false);
    onChange(
      p.id,
      p.nombre,
      p.stockActual,
      p.stockMinimo,
      p.proveedor?.razonSocial ?? '',
    );
  };

  return (
    <div ref={wrapperRef} className="relative flex min-w-0 flex-1 items-center gap-2">
      <MedIcon name={query} />
      <div className="relative min-w-0 flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => { if (results.length) setOpen(true); }}
          placeholder="Buscar medicamento..."
          className="w-full bg-transparent text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />
        {loading && <Loader2 className="absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-gray-400" />}
        {!loading && !value && query && <Search className="absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-300" />}
      </div>
      {open && results.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-gray-200 bg-white shadow-lg">
          {results.map((p) => (
            <button
              key={p.id}
              onMouseDown={() => handleSelect(p)}
              className="flex w-full flex-col px-4 py-2.5 text-left hover:bg-green-50 first:rounded-t-xl last:rounded-b-xl"
            >
              <span className="text-sm font-semibold text-gray-900">{p.nombre}</span>
              <span className="text-xs text-gray-400">
                Stock: {p.stockActual} {p.unidad} · {p.categoria}
                {p.proveedor ? ` · ${p.proveedor.razonSocial}` : ''}
              </span>
            </button>
          ))}
        </div>
      )}
      {open && !loading && results.length === 0 && query.length >= 2 && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg">
          <p className="text-sm text-gray-400">Sin resultados para "{query}"</p>
        </div>
      )}
    </div>
  );
}

// ── Modal principal ─────────────────────────────────────────────────────────
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

  const updateRow = (key: number, fields: Partial<SolicitudRow>) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...fields } : r)));

  const addRow = () => setRows((prev) => [...prev, emptyRow(nextKey.current++)]);
  const removeRow = (key: number) => setRows((prev) => prev.length > 1 ? prev.filter((r) => r.key !== key) : prev);

  const handleConfirmar = async () => {
    const validos = rows.filter((r) => r.productoId && r.cantSolicitada > 0);
    if (!validos.length) { setError('Agregá al menos un medicamento válido del inventario'); return; }

    try {
      setSaving(true); setError(null);
      await crearCompra({
        observaciones,
        detalles: validos.map((r) => ({
          productoId: r.productoId,
          nombreProducto: r.nombreProducto,
          proveedorId: undefined,
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

  const handleClose = () => {
    setRows([emptyRow(1)]);
    setObservaciones('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  const filledCount = rows.filter((r) => r.productoId).length;
  const selectCls = 'h-8 w-full rounded-lg border border-gray-200 bg-white px-2 pr-6 text-xs text-gray-700 focus:border-brand focus:outline-none appearance-none';
  const numInputCls = 'h-9 w-16 rounded-xl border border-gray-200 bg-white px-2 text-center text-sm font-semibold text-gray-900 focus:border-brand focus:outline-none';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-[#f5f7f5] shadow-2xl">

        {/* Title */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-3xl font-bold text-brand">Nueva solicitud de compra</h2>
              <p className="mt-1 text-sm text-gray-500">Complete los datos para solicitar reposición de medicamentos</p>
            </div>
            <button onClick={handleClose} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200">
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
                  {/* Medicamento — autocomplete */}
                  <ProductoAutocomplete
                    value={row.productoId}
                    displayValue={row.nombreProducto}
                    onChange={(productoId, nombre, stockActual, stockMin, proveedor) =>
                      updateRow(row.key, { productoId, nombreProducto: nombre, stockActual, stockMin, proveedor })
                    }
                  />
                  {/* Proveedor (autocompletado desde el producto, editable) */}
                  <input
                    type="text"
                    value={row.proveedor}
                    onChange={(e) => updateRow(row.key, { proveedor: e.target.value })}
                    placeholder="Proveedor..."
                    className="h-8 w-full rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 focus:border-brand focus:outline-none"
                  />
                  {/* Motivo */}
                  <div className="relative">
                    <select value={row.motivo} onChange={(e) => updateRow(row.key, { motivo: e.target.value })} className={selectCls}>
                      {motivos.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">▾</span>
                  </div>
                  {/* S. Actual */}
                  <input type="number" min={0}
                    value={row.stockActual || ''}
                    onChange={(e) => updateRow(row.key, { stockActual: Number(e.target.value) })}
                    className="h-8 w-full rounded-lg border border-gray-200 bg-white px-1 text-center text-sm text-gray-700 focus:border-brand focus:outline-none"
                  />
                  {/* S. Mín */}
                  <input type="number" min={0}
                    value={row.stockMin || ''}
                    onChange={(e) => updateRow(row.key, { stockMin: Number(e.target.value) })}
                    className={`h-8 w-full rounded-lg border px-1 text-center text-sm font-bold focus:outline-none ${isCritical ? 'border-red-200 text-red-600' : 'border-gray-200 text-gray-700 focus:border-brand'}`}
                  />
                  {/* Cant. solicitada */}
                  <div className="flex items-center gap-1">
                    <input type="number" min={1}
                      value={row.cantSolicitada || ''}
                      onChange={(e) => updateRow(row.key, { cantSolicitada: Number(e.target.value) })}
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

          {/* Add row */}
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
          <button onClick={handleClose} className="text-sm font-medium text-gray-500 hover:text-gray-700">
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

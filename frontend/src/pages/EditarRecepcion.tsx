import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, Loader2, Search } from 'lucide-react';
import { getRecepcion, actualizarRecepcion, confirmarRecepcion, procesarRecepcion } from '../api/recepciones';
import { getProveedores } from '../api/proveedores';
import { getInventario } from '../api/inventario';
import type { Proveedor, ProductoInventario, RecepcionDetalle } from '../types';

interface DetalleRow extends RecepcionDetalle {
  key: number;
  nombreProducto: string;
  precio: number;
}

function toRow(d: RecepcionDetalle, key: number): DetalleRow {
  return {
    ...d,
    key,
    nombreProducto: d.producto?.nombre ?? '',
    precio: d.precio ?? 0,
  };
}

export default function EditarRecepcion() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [proveedorId, setProveedorId] = useState('');
  const [remito, setRemito] = useState('');
  const [fechaRecepcion, setFechaRecepcion] = useState('');
  const [rows, setRows] = useState<DetalleRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const nextKey = useRef(1000);

  const [searchResults, setSearchResults] = useState<ProductoInventario[]>([]);
  const [activeSearchRow, setActiveSearchRow] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    getProveedores({ limit: 100 }).then((res) => setProveedores(res.data)).catch(() => { /* ignore */ });
    if (id) {
      getRecepcion(id).then((r) => {
        setProveedorId(r.proveedorId);
        setRemito(r.remito ?? '');
        setFechaRecepcion(r.fechaRecepcion.slice(0, 10));
        setRows(r.detalles.map((d, i) => toRow(d, i)));
        nextKey.current = r.detalles.length + 1;
      }).catch(() => {}).finally(() => setLoading(false));
    } else { setLoading(false); }
  }, [id]);

  const handleSearch = useCallback((query: string, rowKey: number) => {
    setSearchQuery(query);
    setActiveSearchRow(rowKey);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (query.length < 2) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await getInventario({ page: 1, limit: 10, busqueda: query });
        setSearchResults(res.data);
      } catch { setSearchResults([]); }
    }, 300);
  }, []);

  const selectMedicamento = (rowKey: number, prod: ProductoInventario) => {
    setRows((prev) => prev.map((r) => r.key === rowKey ? { ...r, productoId: prod.id, nombreProducto: prod.nombre, ean: prod.ean ?? '', troquel: prod.troquel ?? '' } : r));
    setSearchResults([]);
    setActiveSearchRow(null);
    setSearchQuery('');
  };

  const updateRow = (key: number, field: keyof DetalleRow, value: string | number) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  };

  const addRow = () => {
    setRows((prev) => [...prev, { key: nextKey.current++, productoId: '', nombreProducto: '', cantidad: 0, precio: 0, ean: '', troquel: '', lote: '', fechaVencimiento: '' }]);
  };

  const removeRow = (key: number) => {
    setRows((prev) => prev.length > 1 ? prev.filter((r) => r.key !== key) : prev);
  };

  const buildPayload = () => ({
    proveedorId,
    remito: remito || undefined,
    fechaRecepcion,
    detalles: rows.filter((r) => r.productoId).map((r) => ({
      productoId: r.productoId,
      cantidad: r.cantidad,
      precio: r.precio || undefined,
      ean: r.ean || undefined,
      troquel: r.troquel || undefined,
      lote: r.lote,
      fechaVencimiento: r.fechaVencimiento,
    })),
  });

  const handleSaveDraft = async () => {
    if (!id) return;
    try {
      setSaving(true); setError(null);
      await actualizarRecepcion(id, buildPayload());
      navigate('/recepciones');
    } catch { setError('Error al guardar'); } finally { setSaving(false); }
  };

  const handleConfirmar = async () => {
    if (!id) return;
    try {
      setSaving(true); setError(null);
      await actualizarRecepcion(id, buildPayload());
      const confirmed = await confirmarRecepcion(id);
      await procesarRecepcion(confirmed.id);
      navigate('/recepciones');
    } catch { setError('Error al confirmar'); } finally { setSaving(false); }
  };

  const recId = id ? (id.startsWith('REC') ? id : `REC-${id.slice(-4).toUpperCase()}`) : '';

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand" /></div>;

  return (
    <div>
      <button onClick={() => navigate('/recepciones')} className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-brand">
        <ChevronLeft className="h-4 w-4" />
        Volver a recepciones
      </button>

      <div className="mb-6">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">Borrador</span>
        <h1 className="mt-2 font-serif text-4xl font-bold text-gray-900">Recepción: {recId}</h1>
      </div>

      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-3 gap-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Proveedor</label>
            <select value={proveedorId} onChange={(e) => setProveedorId(e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none">
              <option value="">Seleccionar proveedor...</option>
              {proveedores.map((p) => <option key={p.id} value={p.id}>{p.razonSocial}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Remito</label>
            <input type="text" value={remito} onChange={(e) => setRemito(e.target.value)} placeholder="Nro. de remito"
              className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Fecha de recepción</label>
            <input type="date" value={fechaRecepcion} onChange={(e) => setFechaRecepcion(e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Detalle de Medicamentos</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Medicamento</th>
              <th className="w-20 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Cant.</th>
              <th className="w-24 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Precio</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Lote</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Vencimiento</th>
              <th className="w-12 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row) => (
              <tr key={row.key}>
                <td className="relative px-4 py-2">
                  {row.productoId ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">{row.nombreProducto}</span>
                      <button onClick={() => updateRow(row.key, 'productoId', '')} className="text-xs text-gray-400 hover:text-red-500">×</button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                      <input type="text" placeholder="Buscar medicamento..."
                        value={activeSearchRow === row.key ? searchQuery : ''}
                        onChange={(e) => handleSearch(e.target.value, row.key)}
                        onFocus={() => setActiveSearchRow(row.key)}
                        className="h-9 w-full rounded-xl border border-gray-200 pl-8 pr-3 text-sm focus:border-brand focus:outline-none" />
                      {activeSearchRow === row.key && searchResults.length > 0 && (
                        <div className="absolute left-0 top-full z-10 mt-1 max-h-48 w-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                          {searchResults.map((prod) => (
                            <button key={prod.id} onClick={() => selectMedicamento(row.key, prod)}
                              className="flex w-full flex-col px-3 py-2 text-left hover:bg-gray-50">
                              <span className="text-sm font-medium text-gray-900">{prod.nombre}</span>
                              <span className="text-xs text-gray-500">{prod.categoria}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-2">
                  <input type="number" min={0} value={row.cantidad || ''} onChange={(e) => updateRow(row.key, 'cantidad', Number(e.target.value))}
                    className="h-9 w-full rounded-xl border border-gray-200 px-2 text-center text-sm focus:border-brand focus:outline-none" />
                </td>
                <td className="px-4 py-2">
                  <input type="number" min={0} step="0.01" value={row.precio || ''} onChange={(e) => updateRow(row.key, 'precio', Number(e.target.value))}
                    placeholder="$0"
                    className="h-9 w-full rounded-xl border border-gray-200 px-2 text-sm focus:border-brand focus:outline-none" />
                </td>
                <td className="px-4 py-2">
                  <input type="text" value={row.lote} onChange={(e) => updateRow(row.key, 'lote', e.target.value)} placeholder="Nro. lote"
                    className="h-9 w-full rounded-xl border border-gray-200 px-2 text-sm focus:border-brand focus:outline-none" />
                </td>
                <td className="px-4 py-2">
                  <input type="date" value={row.fechaVencimiento} onChange={(e) => updateRow(row.key, 'fechaVencimiento', e.target.value)}
                    className="h-9 w-full rounded-xl border border-gray-200 px-2 text-sm focus:border-brand focus:outline-none" />
                </td>
                <td className="px-4 py-2">
                  <button onClick={() => removeRow(row.key)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-gray-100 px-6 py-3">
          <button onClick={addRow} className="flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-light">
            <Plus className="h-4 w-4" />
            Insertar nueva fila
          </button>
        </div>
      </div>

      {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="mt-6 flex items-center justify-end gap-3">
        <button onClick={() => navigate('/recepciones')} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancelar
        </button>
        <button onClick={handleSaveDraft} disabled={saving} className="rounded-xl border border-brand px-5 py-2.5 text-sm font-medium text-brand hover:bg-green-50 disabled:opacity-50">
          {saving ? <Loader2 className="mr-1 inline h-4 w-4 animate-spin" /> : null}
          Guardar borrador
        </button>
        <button onClick={handleConfirmar} disabled={saving} className="rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-light disabled:opacity-50">
          {saving ? <Loader2 className="mr-1 inline h-4 w-4 animate-spin" /> : null}
          Confirmar e ingresar al stock
        </button>
      </div>
    </div>
  );
}

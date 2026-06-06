import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Loader2, ChevronLeft, Search } from 'lucide-react';
import { getProveedores } from '../api/proveedores';
import { crearRecepcion, confirmarRecepcion, procesarRecepcion } from '../api/recepciones';
import { getInventario } from '../api/inventario';
import type { Proveedor, ProductoInventario } from '../types';
import ConfirmModal from '../components/common/ConfirmModal';
import SortableTh, { type SortDirection } from '../components/common/SortableTh';
import { applySortDirection, compareDate, compareNumber, compareText, nextSortDirection } from '../utils/sort';

interface DetalleRow {
  key: number;
  productoId: string;
  nombreProducto: string;
  cantidad: number;
  precio: number;
  ean: string;
  troquel: string;
  lote: string;
  fechaVencimiento: string;
}

type SortKey = 'nombreProducto' | 'cantidad' | 'precio' | 'ean' | 'troquel' | 'lote' | 'fechaVencimiento';

function emptyRow(key: number): DetalleRow {
  return { key, productoId: '', nombreProducto: '', cantidad: 0, precio: 0, ean: '', troquel: '', lote: '', fechaVencimiento: '' };
}

export default function NuevaRecepcion() {
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [proveedorId, setProveedorId] = useState('');
  const [remito, setRemito] = useState('');
  const [transportista, setTransportista] = useState('');
  const [numeroGuia, setNumeroGuia] = useState('');
  const [cantBultos, setCantBultos] = useState('');
  const [fechaRecepcion, setFechaRecepcion] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<DetalleRow[]>([emptyRow(1)]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const nextKey = useRef(2);
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'nombreProducto',
    direction: 'asc',
  });

  const [searchResults, setSearchResults] = useState<ProductoInventario[]>([]);
  const [activeSearchRow, setActiveSearchRow] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    getProveedores({ limit: 100 }).then((res) => setProveedores(res.data)).catch(() => {});
  }, []);

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
    setRows((prev) =>
      prev.map((r) =>
        r.key === rowKey
          ? { ...r, productoId: prod.id, nombreProducto: prod.nombre, ean: prod.ean ?? '', troquel: prod.troquel ?? '' }
          : r
      )
    );
    setSearchResults([]);
    setActiveSearchRow(null);
    setSearchQuery('');
  };

  const updateRow = (key: number, field: keyof DetalleRow, value: string | number) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  };

  const addRow = () => { setRows((prev) => [...prev, emptyRow(nextKey.current++)]); };
  const removeRow = (key: number) => { setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev)); };

  const totalItems = rows.reduce((sum, r) => sum + (r.cantidad || 0), 0);
  const totalPrecio = rows.reduce((sum, r) => sum + (r.cantidad || 0) * (r.precio || 0), 0);
  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      let result = 0;

      if (sort.key === 'nombreProducto') result = compareText(a.nombreProducto, b.nombreProducto);
      if (sort.key === 'cantidad') result = compareNumber(a.cantidad, b.cantidad);
      if (sort.key === 'precio') result = compareNumber(a.precio, b.precio);
      if (sort.key === 'ean') result = compareText(a.ean, b.ean);
      if (sort.key === 'troquel') result = compareText(a.troquel, b.troquel);
      if (sort.key === 'lote') result = compareText(a.lote, b.lote);
      if (sort.key === 'fechaVencimiento') result = compareDate(a.fechaVencimiento, b.fechaVencimiento);

      return applySortDirection(result, sort.direction);
    });
  }, [rows, sort]);

  const handleSort = (key: SortKey) => {
    setSort((current) => ({ key, direction: nextSortDirection(current, key) }));
  };

  const validate = (): boolean => {
    if (!proveedorId) { setError('Seleccione un proveedor'); return false; }
    const validRows = rows.filter((r) => r.productoId);
    if (validRows.length === 0) { setError('Agregue al menos un medicamento'); return false; }
    for (const r of validRows) {
      if (r.cantidad <= 0) { setError(`La cantidad de "${r.nombreProducto}" debe ser mayor a 0`); return false; }
      if (!r.lote) { setError(`El lote de "${r.nombreProducto}" es requerido`); return false; }
      if (!r.fechaVencimiento) { setError(`La fecha de vencimiento de "${r.nombreProducto}" es requerida`); return false; }
    }
    return true;
  };

  const buildPayload = () => ({
    proveedorId,
    remito: remito || undefined,
    transportista: transportista || undefined,
    numeroGuia: numeroGuia || undefined,
    cantBultos: cantBultos ? Number(cantBultos) : undefined,
    fechaRecepcion,
    detalles: rows
      .filter((r) => r.productoId)
      .map((r) => ({
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
    if (!validate()) return;
    try {
      setSaving(true); setError(null);
      await crearRecepcion(buildPayload());
      navigate('/recepciones');
    } catch { setError('Error al guardar el borrador'); } finally { setSaving(false); }
  };

  const handleOpenConfirm = () => {
    if (!validate()) return;
    setConfirmModalOpen(true);
  };

  const handleConfirmAndProcess = async () => {
    if (!validate()) return;
    setConfirmModalOpen(false);
    try {
      setSaving(true); setError(null);
      const recepcion = await crearRecepcion(buildPayload());
      const processed = await procesarRecepcion(recepcion.id);
      await confirmarRecepcion(processed.id);
      navigate('/recepciones');
    } catch { setError('Error al confirmar la recepción'); } finally { setSaving(false); }
  };

  return (
    <div>
      <button onClick={() => navigate('/recepciones')} className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-brand">
        <ChevronLeft className="h-4 w-4" />
        Volver a recepciones
      </button>

      <div className="mb-6">
        <h1 className="font-serif text-4xl font-bold text-gray-900">Nueva recepción</h1>
        <p className="mt-1 text-sm text-gray-500">Registre un nuevo ingreso de stock desde un proveedor</p>
      </div>

      {/* Form header */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-3 gap-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Proveedor</label>
            <select value={proveedorId} onChange={(e) => setProveedorId(e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
              <option value="">Seleccionar proveedor...</option>
              {proveedores.map((p) => <option key={p.id} value={p.id}>{p.razonSocial}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Remito</label>
            <input type="text" value={remito} onChange={(e) => setRemito(e.target.value)} placeholder="Nro. de remito"
              className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Fecha de recepción</label>
            <input type="date" value={fechaRecepcion} onChange={(e) => setFechaRecepcion(e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Transportista</label>
            <input type="text" value={transportista} onChange={(e) => setTransportista(e.target.value)} placeholder="Nombre del transportista"
              className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Número de Guía</label>
            <input type="text" value={numeroGuia} onChange={(e) => setNumeroGuia(e.target.value)} placeholder="Nro. de guía"
              className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Cant. Bultos</label>
            <input type="number" min={0} value={cantBultos} onChange={(e) => setCantBultos(e.target.value)} placeholder="0"
              className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
          </div>
        </div>
      </div>

      {/* Products table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Detalle de Medicamentos</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <SortableTh label="Medicamento" sortKey="nombreProducto" activeKey={sort.key} direction={sort.direction} onSort={handleSort} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400" />
              <SortableTh label="Cant." sortKey="cantidad" activeKey={sort.key} direction={sort.direction} onSort={handleSort} className="w-20 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400" />
              <SortableTh label="Precio" sortKey="precio" activeKey={sort.key} direction={sort.direction} onSort={handleSort} className="w-24 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400" />
              <SortableTh label="EAN" sortKey="ean" activeKey={sort.key} direction={sort.direction} onSort={handleSort} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400" />
              <SortableTh label="Troquel" sortKey="troquel" activeKey={sort.key} direction={sort.direction} onSort={handleSort} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400" />
              <SortableTh label="Lote" sortKey="lote" activeKey={sort.key} direction={sort.direction} onSort={handleSort} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400" />
              <SortableTh label="Vencimiento" sortKey="fechaVencimiento" activeKey={sort.key} direction={sort.direction} onSort={handleSort} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400" />
              <th className="w-12 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sortedRows.map((row) => (
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
                        className="h-9 w-full rounded-xl border border-gray-200 pl-8 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
                      {activeSearchRow === row.key && searchResults.length > 0 && (
                        <div className="absolute left-0 top-full z-10 mt-1 max-h-48 w-80 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
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
                    className="h-9 w-full rounded-xl border border-gray-200 px-2 text-sm text-center focus:border-brand focus:outline-none" />
                </td>
                <td className="px-4 py-2">
                  <input type="number" min={0} step="0.01" value={row.precio || ''} onChange={(e) => updateRow(row.key, 'precio', Number(e.target.value))}
                    placeholder="$0"
                    className="h-9 w-full rounded-xl border border-gray-200 px-2 text-sm focus:border-brand focus:outline-none" />
                </td>
                <td className="px-4 py-2">
                  <input type="text" value={row.ean} onChange={(e) => updateRow(row.key, 'ean', e.target.value)}
                    className="h-9 w-full rounded-xl border border-gray-200 px-2 text-sm focus:border-brand focus:outline-none" />
                </td>
                <td className="px-4 py-2">
                  <input type="text" value={row.troquel} onChange={(e) => updateRow(row.key, 'troquel', e.target.value)}
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
                  <button onClick={() => removeRow(row.key)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500">
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

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Footer bar */}
      <div className="mt-6 flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <span>Total Items: <span className="font-bold text-gray-900">{totalItems}</span></span>
          <span>Total $: <span className="font-bold text-gray-900">${totalPrecio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/recepciones')}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={handleSaveDraft} disabled={saving}
            className="rounded-xl border border-brand px-5 py-2.5 text-sm font-medium text-brand hover:bg-green-50 disabled:opacity-50">
            {saving ? <Loader2 className="mr-1 inline h-4 w-4 animate-spin" /> : null}
            Guardar borrador
          </button>
          <button onClick={handleOpenConfirm} disabled={saving}
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-light disabled:opacity-50">
            {saving ? <Loader2 className="mr-1 inline h-4 w-4 animate-spin" /> : null}
            Confirmar e ingresar al stock
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModalOpen}
        title="Confirmar recepción"
        description="Esta acción procesará la recepción, confirmará lo recibido e ingresará los medicamentos al stock."
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        loading={saving}
        onConfirm={handleConfirmAndProcess}
        onCancel={() => setConfirmModalOpen(false)}
      />
    </div>
  );
}

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, Loader2, Edit, X } from 'lucide-react';
import validbarcode from 'barcode-validator';
import { getRecepcion, actualizarRecepcion, confirmarRecepcion, procesarRecepcion } from '../api/recepciones';
import { getProveedores } from '../api/proveedores';
import { getInventario, getProductoPorEan } from '../api/inventario';
import type { EstadoRecepcion, Proveedor, ProductoInventario, RecepcionDetalle } from '../types';
import SortableTh, { type SortDirection } from '../components/common/SortableTh';
import ConfirmModal from '../components/common/ConfirmModal';
import { applySortDirection, compareDate, compareNumber, compareText, nextSortDirection } from '../utils/sort';

interface DetalleRow extends RecepcionDetalle {
  key: number;
  nombreProducto: string;
  categoria?: string;
  presentacion?: string;
  laboratorio?: string;
}

type SortKey = 'nombreProducto' | 'cantidad' | 'lote' | 'fechaVencimiento';
type SubmitAction = 'procesar' | 'confirmar';

function formatDate(d?: string): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function toRow(d: RecepcionDetalle, key: number): DetalleRow {
  return {
    ...d,
    key,
    nombreProducto: d.producto?.nombre ?? '',
    lote: d.lote ?? '',
    fechaVencimiento: d.fechaVencimiento?.slice(0, 10) ?? '',
    categoria: d.producto?.categoria,
    presentacion: d.producto?.presentacion,
    laboratorio: d.producto?.laboratorio,
  };
}

export default function EditarRecepcion() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [proveedorId, setProveedorId] = useState('');
  const [remito, setRemito] = useState('');
  const [fechaRecepcion, setFechaRecepcion] = useState('');
  const [estado, setEstado] = useState<EstadoRecepcion>('BORRADOR');
  const [rows, setRows] = useState<DetalleRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const nextKey = useRef(1000);
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'nombreProducto',
    direction: 'asc',
  });

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [editingRow, setEditingRow] = useState<DetalleRow | null>(null);
  const [modalSearchResults, setModalSearchResults] = useState<ProductoInventario[]>([]);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [eanLookupMessage, setEanLookupMessage] = useState<string | null>(null);
  const [eanLookupLoading, setEanLookupLoading] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [submitAction, setSubmitAction] = useState<SubmitAction>('procesar');

  useEffect(() => {
    getProveedores({ limit: 100 }).then((res) => setProveedores(res.data)).catch(() => { /* ignore */ });
    if (id) {
      getRecepcion(id).then((r) => {
        setProveedorId(r.proveedorId);
        setRemito(r.remito ?? '');
        setFechaRecepcion(r.fechaRecepcion.slice(0, 10));
        setEstado(r.estado);
        setRows(r.detalles.map((d, i) => toRow(d, i)));
        nextKey.current = r.detalles.length + 1;
      }).catch(() => {}).finally(() => setLoading(false));
    } else { setLoading(false); }
  }, [id]);

  const updateRow = (key: number, field: keyof DetalleRow, value: string | number) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  };

  const addRow = () => {
    const row = { key: nextKey.current++, productoId: '', nombreProducto: '', cantidad: 0, ean: '', troquel: '', lote: '', fechaVencimiento: '' };
    setEditingRow(row);
    setModalSearchQuery('');
    setModalSearchResults([]);
  };

  const removeRow = (key: number) => {
    setRows((prev) => prev.filter((r) => r.key !== key));
    setError(null);
  };

  const validRows = rows.filter((r) => r.productoId);
  const buildPayload = () => ({
    proveedorId,
    remito: remito || undefined,
    fechaRecepcion,
    detalles: validRows.map((r) => ({
      productoId: r.productoId,
      cantidad: r.cantidad,
      ean: r.ean || undefined,
      troquel: r.troquel || undefined,
      lote: r.lote || undefined,
      fechaVencimiento: r.fechaVencimiento || undefined,
    })),
  });

  const validateDraft = (options: { requireRemito?: boolean; requireTraceability?: boolean; requireLotAndExpiry?: boolean } = {}) => {
    const { requireRemito = false, requireTraceability = false, requireLotAndExpiry = false } = options;
    if (!proveedorId) return 'Seleccione un proveedor';
    if (requireRemito && !remito.trim()) return 'Ingrese el número de remito';
    if (!fechaRecepcion) return 'Seleccione la fecha de recepción';
    if (rows.length === 0) return 'Agregue al menos un medicamento';

    const rowWithoutProduct = rows.find((r) => !r.productoId);
    if (rowWithoutProduct) {
      return `Busque y seleccione un medicamento válido para "${rowWithoutProduct.nombreProducto || rowWithoutProduct.ean || 'la fila nueva'}"`;
    }

    const invalidQuantityRow = rows.find((r) => r.cantidad <= 0);
    if (invalidQuantityRow) {
      return `Complete cantidad para "${invalidQuantityRow.nombreProducto}"`;
    }

    if (requireLotAndExpiry) {
      const invalidLotRow = rows.find((r) => !r.lote || !r.fechaVencimiento);
      if (invalidLotRow) {
        return `Complete lote y vencimiento para "${invalidLotRow.nombreProducto}"`;
      }
    }

    if (requireTraceability) {
      const rowWithoutTraceability = rows.find((r) => !r.ean?.trim() || !r.troquel?.trim());
      if (rowWithoutTraceability) {
        return `Complete EAN y troquel para "${rowWithoutTraceability.nombreProducto}"`;
      }
    }

    return null;
  };

  const handleSaveDraft = async () => {
    if (!id) return;
    const validationError = validateDraft();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      setSaving(true); setError(null);
      await actualizarRecepcion(id, buildPayload());
      navigate('/recepciones');
    } catch { setError('Error al guardar'); } finally { setSaving(false); }
  };

  const handleProcesar = async () => {
    if (!id) return;
    const validationError = validateDraft({ requireRemito: true, requireTraceability: true, requireLotAndExpiry: true });
    if (validationError) {
      setError(validationError);
      setConfirmModalOpen(false);
      return;
    }
    try {
      setSaving(true); setError(null);
      await actualizarRecepcion(id, buildPayload());
      await procesarRecepcion(id);
      navigate('/recepciones');
    } catch { setError('Error al procesar'); } finally { setSaving(false); }
  };

  const handleConfirmar = async () => {
    if (!id) return;
    const validationError = validateDraft({ requireRemito: true, requireTraceability: true, requireLotAndExpiry: true });
    if (validationError) {
      setError(validationError);
      setConfirmModalOpen(false);
      return;
    }
    try {
      setSaving(true); setError(null);
      await actualizarRecepcion(id, buildPayload());
      await confirmarRecepcion(id);
      navigate('/recepciones');
    } catch { setError('Error al confirmar'); } finally { setSaving(false); }
  };

  const recId = id ? (id.startsWith('REC') ? id : `REC-${id.slice(-4).toUpperCase()}`) : '';
  const isBorrador = estado === 'BORRADOR';
  const badgeClasses = isBorrador
    ? 'bg-amber-100 text-amber-700'
    : 'bg-blue-100 text-blue-700';
  const badgeLabel = isBorrador ? 'Borrador' : estado === 'PROCESADA' ? 'Procesada' : 'Confirmada';
  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      let result = 0;

      if (sort.key === 'nombreProducto') result = compareText(a.nombreProducto, b.nombreProducto);
      if (sort.key === 'cantidad') result = compareNumber(a.cantidad, b.cantidad);
      if (sort.key === 'lote') result = compareText(a.lote, b.lote);
      if (sort.key === 'fechaVencimiento') result = compareDate(a.fechaVencimiento, b.fechaVencimiento);

      return applySortDirection(result, sort.direction);
    });
  }, [rows, sort]);

  const handleSort = (key: SortKey) => {
    setSort((current) => ({ key, direction: nextSortDirection(current, key) }));
  };

  const openEditModal = (row: DetalleRow) => {
    setEditingRow({ ...row });
    setModalSearchQuery(row.nombreProducto);
    setModalSearchResults([]);
  };

  const handleModalSearch = (query: string) => {
    if (!editingRow) return;
    setModalSearchQuery(query);
    setEditingRow({ ...editingRow, nombreProducto: query, productoId: '' });
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (query.length < 2) {
      setModalSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await getInventario({ page: 1, limit: 8, busqueda: query });
        setModalSearchResults(res.data);
      } catch {
        setModalSearchResults([]);
      }
    }, 300);
  };

  const selectModalMedicamento = (prod: ProductoInventario) => {
    if (!editingRow) return;
    setEditingRow({
      ...editingRow,
      productoId: prod.id,
      nombreProducto: prod.nombre,
      ean: prod.ean ?? '',
      troquel: prod.troquel ?? '',
      categoria: prod.categoria,
      presentacion: prod.presentacion,
      laboratorio: prod.laboratorio,
    });
    setModalSearchQuery(prod.nombre);
    setModalSearchResults([]);
    setEanLookupMessage(null);
  };

  const updateEditingRow = (field: keyof DetalleRow, value: string | number) => {
    setEditingRow((current) => current ? { ...current, [field]: value } : current);
  };

  const lookupProductoByEan = async (eanValue = editingRow?.ean ?? '') => {
    if (!editingRow) return;
    const ean = eanValue.replace(/\D/g, '');

    if (!ean) {
      setEanLookupMessage(null);
      return;
    }

    try {
      setEanLookupLoading(true);
      setEanLookupMessage(null);
      const prod = await getProductoPorEan(ean);
      selectModalMedicamento(prod);
      setEanLookupMessage(validbarcode(ean) ? 'Medicamento encontrado por EAN' : 'Medicamento encontrado en inventario');
    } catch {
      setEanLookupMessage(validbarcode(ean) ? 'No hay medicamento registrado con ese EAN' : 'EAN inválido o no registrado');
    } finally {
      setEanLookupLoading(false);
    }
  };

  const saveEditingRow = () => {
    if (!editingRow) return;
    if (!editingRow.productoId) {
      setEanLookupMessage('Seleccione un medicamento o ingrese un EAN válido registrado');
      return;
    }
    if (editingRow.cantidad <= 0) {
      setEanLookupMessage('Complete cantidad');
      return;
    }
    setRows((prev) => {
      const exists = prev.some((row) => row.key === editingRow.key);
      return exists
        ? prev.map((row) => row.key === editingRow.key ? editingRow : row)
        : [...prev, editingRow];
    });
    setEditingRow(null);
    setModalSearchResults([]);
    setEanLookupMessage(null);
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand" /></div>;

  return (
    <div>
      <button onClick={() => navigate('/recepciones')} className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-brand">
        <ChevronLeft className="h-4 w-4" />
        Volver a recepciones
      </button>

      <div className="mb-6">
        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${badgeClasses}`}>{badgeLabel}</span>
        <h1 className="mt-2 font-serif text-4xl font-bold text-gray-900">Recepción: {recId}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {isBorrador
            ? 'Complete remito, EAN, troquel, cantidad, lote y vencimiento para procesar la recepción'
            : 'Edite los datos del remito y los medicamentos recibidos'}
        </p>
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
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Detalle de Medicamentos</h2>
          <button
            onClick={() => rows[0] ? openEditModal(rows[0]) : addRow()}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-light"
          >
            Modificar recepción
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <SortableTh label="Medicamento" sortKey="nombreProducto" activeKey={sort.key} direction={sort.direction} onSort={handleSort} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400" />
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Categoría</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Presentación</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">EAN</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Troquel</th>
              <SortableTh label="Lote" sortKey="lote" activeKey={sort.key} direction={sort.direction} onSort={handleSort} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400" />
              <SortableTh label="Vencimiento" sortKey="fechaVencimiento" activeKey={sort.key} direction={sort.direction} onSort={handleSort} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400" />
              <SortableTh label="Cantidad" sortKey="cantidad" activeKey={sort.key} direction={sort.direction} onSort={handleSort} className="w-28 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400" />
              <th className="w-24 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sortedRows.map((row) => (
              <tr key={row.key}>
                <td className="px-4 py-5">
                  <p className="text-sm font-semibold text-gray-900">{row.nombreProducto || 'Sin medicamento'}</p>
                  <p className="text-xs text-gray-400">Lote {row.lote || '—'}</p>
                </td>
                <td className="px-4 py-5">
                  <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-green-700">
                    {row.categoria ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-5 text-sm text-gray-600">{row.presentacion ?? '—'}</td>
                <td className="px-4 py-5">
                  <input
                    type="text"
                    value={row.ean ?? ''}
                    onChange={(e) => updateRow(row.key, 'ean', e.target.value.replace(/\D/g, ''))}
                    placeholder="EAN"
                    className="h-10 w-full min-w-32 rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none"
                  />
                </td>
                <td className="px-4 py-5">
                  <input
                    type="text"
                    value={row.troquel ?? ''}
                    onChange={(e) => updateRow(row.key, 'troquel', e.target.value)}
                    placeholder="Troquel"
                    className="h-10 w-full min-w-28 rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none"
                  />
                </td>
                <td className="px-4 py-5">
                  <input
                    type="text"
                    value={row.lote ?? ''}
                    onChange={(e) => updateRow(row.key, 'lote', e.target.value)}
                    placeholder="Nro. lote"
                    className="h-10 w-full min-w-28 rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none"
                  />
                </td>
                <td className="px-4 py-5">
                  <input
                    type="date"
                    value={row.fechaVencimiento ?? ''}
                    onChange={(e) => updateRow(row.key, 'fechaVencimiento', e.target.value)}
                    title={formatDate(row.fechaVencimiento)}
                    className="h-10 w-full min-w-36 rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none"
                  />
                </td>
                <td className="px-4 py-5">
                  <div className="inline-flex items-center rounded-lg bg-gray-50 text-sm font-bold text-gray-900">
                    <button onClick={() => updateRow(row.key, 'cantidad', Math.max(1, row.cantidad - 1))} className="px-3 py-2 text-gray-500">−</button>
                    <span className="w-8 text-center">{row.cantidad}</span>
                    <button onClick={() => updateRow(row.key, 'cantidad', row.cantidad + 1)} className="px-3 py-2 text-gray-500">+</button>
                  </div>
                </td>
                <td className="px-4 py-5">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEditModal(row)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-brand">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => removeRow(row.key)} className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {sortedRows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-sm text-gray-400">
                  No hay medicamentos en este borrador
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="border-t border-gray-100 px-6 py-3">
          <button onClick={addRow} className="mx-auto flex items-center gap-2 rounded-full border border-dashed border-gray-300 px-8 py-2 text-sm font-semibold uppercase tracking-widest text-brand hover:border-brand">
            <Plus className="h-4 w-4" />
            Insertar medicamento
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
          Guardar cambios
        </button>
        {estado !== 'CONFIRMADA' && (
          <button
            onClick={() => {
              setSubmitAction(isBorrador ? 'procesar' : 'confirmar');
              setConfirmModalOpen(true);
            }}
            disabled={saving}
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-light disabled:opacity-50"
          >
            {saving ? <Loader2 className="mr-1 inline h-4 w-4 animate-spin" /> : null}
            {isBorrador ? 'Procesar recepción' : 'Confirmar e ingresar stock'}
          </button>
        )}
      </div>

      {editingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-4xl overflow-hidden rounded-b-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between px-9 py-7">
              <div>
                <h2 className="font-serif text-4xl font-bold text-brand">Registrar Recepcion</h2>
                <p className="mt-1 text-sm text-gray-500">Introduzca la información del producto</p>
              </div>
              <button onClick={() => setEditingRow(null)} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-10 px-9 pb-8">
              <section>
                <p className="mb-4 border-b border-gray-100 pb-3 text-xs font-bold uppercase tracking-widest text-gray-500">Información general</p>
                <label className="mb-1.5 block text-sm font-medium text-gray-600">Nombre</label>
                <div className="relative">
                  <input
                    value={modalSearchQuery}
                    onChange={(e) => handleModalSearch(e.target.value)}
                    className="h-12 w-full bg-gray-100 px-4 text-lg text-gray-900 focus:outline-none"
                  />
                  {modalSearchResults.length > 0 && (
                    <div className="absolute left-0 top-full z-10 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                      {modalSearchResults.map((prod) => (
                        <button key={prod.id} onClick={() => selectModalMedicamento(prod)} className="flex w-full flex-col px-4 py-3 text-left hover:bg-gray-50">
                          <span className="text-sm font-semibold text-gray-900">{prod.nombre}</span>
                          <span className="text-xs text-gray-500">{prod.categoria}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-600">Categoría</label>
                    <input value={editingRow.categoria ?? ''} onChange={(e) => updateEditingRow('categoria', e.target.value)} className="h-12 w-full bg-gray-100 px-4 text-lg focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-600">Presentación</label>
                    <input value={editingRow.presentacion ?? ''} onChange={(e) => updateEditingRow('presentacion', e.target.value)} className="h-12 w-full bg-gray-100 px-4 text-lg focus:outline-none" />
                  </div>
                </div>

                <p className="mb-4 mt-10 border-b border-gray-100 pb-3 text-xs font-bold uppercase tracking-widest text-gray-500">Stock</p>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-600">Cantidad</label>
                  <input type="number" min={1} value={editingRow.cantidad || ''} onChange={(e) => updateEditingRow('cantidad', Number(e.target.value))} className="h-12 w-full bg-gray-100 px-4 text-lg focus:outline-none" />
                </div>
              </section>

              <section>
                <p className="mb-4 border-b border-gray-100 pb-3 text-xs font-bold uppercase tracking-widest text-gray-500">Identificación</p>
                <label className="mb-1.5 block text-sm font-medium text-gray-600">EAN</label>
                <div className="flex gap-2">
                  <input
                    value={editingRow.ean ?? ''}
                    onBlur={() => lookupProductoByEan()}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      updateEditingRow('ean', value);
                      if (value.length === 8 || value.length === 12 || value.length === 13) {
                        lookupProductoByEan(value);
                      } else {
                        setEanLookupMessage(null);
                      }
                    }}
                    className="h-12 flex-1 bg-gray-100 px-4 text-lg focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => lookupProductoByEan()}
                    disabled={eanLookupLoading}
                    className="h-12 rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-light disabled:opacity-50"
                  >
                    {eanLookupLoading ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>
                {eanLookupMessage && (
                  <p className={`mt-2 text-xs ${eanLookupMessage.includes('encontrado') ? 'text-green-700' : 'text-red-600'}`}>
                    {eanLookupMessage}
                  </p>
                )}
                <label className="mb-1.5 mt-6 block text-sm font-medium text-gray-600">Troquel</label>
                <input value={editingRow.troquel ?? ''} onChange={(e) => updateEditingRow('troquel', e.target.value)} className="h-12 w-full bg-gray-100 px-4 text-lg focus:outline-none" />

                <p className="mb-4 mt-10 border-b border-gray-100 pb-3 text-xs font-bold uppercase tracking-widest text-gray-500">Laboratorio</p>
                <label className="mb-1.5 block text-sm font-medium text-gray-600">Laboratorio</label>
                <input value={editingRow.laboratorio ?? ''} onChange={(e) => updateEditingRow('laboratorio', e.target.value)} className="h-12 w-full bg-gray-100 px-4 text-lg focus:outline-none" />

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-600">Lote</label>
                    <input value={editingRow.lote} onChange={(e) => updateEditingRow('lote', e.target.value)} className="h-12 w-full bg-gray-100 px-4 text-lg focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-600">Vencimiento</label>
                    <input type="date" value={editingRow.fechaVencimiento} onChange={(e) => updateEditingRow('fechaVencimiento', e.target.value)} className="h-12 w-full bg-gray-100 px-4 text-lg focus:outline-none" />
                  </div>
                </div>
              </section>
            </div>

            <div className="flex items-center justify-between bg-gray-100 px-9 py-6">
              <button
                onClick={() => {
                  removeRow(editingRow.key);
                  setEditingRow(null);
                  setEanLookupMessage(null);
                }}
                className="flex items-center gap-2 text-sm font-semibold text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar medicamento
              </button>
              <div className="flex items-center gap-4">
                <button onClick={() => setEditingRow(null)} className="px-5 py-2.5 text-sm font-semibold text-gray-700">Cancelar</button>
                <button onClick={saveEditingRow} className="rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white shadow-lg hover:bg-brand-light">Guardar cambios</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModalOpen}
        title={submitAction === 'procesar' ? 'Procesar recepción' : 'Confirmar recepción'}
        description={submitAction === 'procesar'
          ? 'Esta acción guardará los cambios y pasará el borrador a PROCESADA. Requiere remito y todavía no impacta stock.'
          : 'Esta acción guardará los cambios, confirmará lo recibido e ingresará los medicamentos al stock.'}
        confirmLabel={submitAction === 'procesar' ? 'Procesar' : 'Confirmar'}
        cancelLabel="Cancelar"
        loading={saving}
        onConfirm={submitAction === 'procesar' ? handleProcesar : handleConfirmar}
        onCancel={() => setConfirmModalOpen(false)}
      />
    </div>
  );
}

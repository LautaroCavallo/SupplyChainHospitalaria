import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Loader2, ChevronLeft, Search } from 'lucide-react';
import { getProveedores } from '../api/proveedores';
import { crearRecepcion, confirmarRecepcion, procesarRecepcion } from '../api/recepciones';
import { getInventario } from '../api/inventario';
import type { Proveedor, ProductoInventario } from '../types';

interface DetalleRow {
  key: number;
  productoId: string;
  nombreProducto: string;
  cantidad: number;
  ean: string;
  troquel: string;
  lote: string;
  fechaVencimiento: string;
}

function emptyRow(key: number): DetalleRow {
  return { key, productoId: '', nombreProducto: '', cantidad: 0, ean: '', troquel: '', lote: '', fechaVencimiento: '' };
}

export default function NuevaRecepcion() {
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [proveedorId, setProveedorId] = useState('');
  const [remito, setRemito] = useState('');
  const [fechaRecepcion, setFechaRecepcion] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<DetalleRow[]>([emptyRow(1)]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextKey = useRef(2);

  const [searchResults, setSearchResults] = useState<ProductoInventario[]>([]);
  const [activeSearchRow, setActiveSearchRow] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    getProveedores({ limit: 100 })
      .then((res) => setProveedores(res.data))
      .catch(() => {});
  }, []);

  const handleSearch = useCallback(
    (query: string, rowKey: number) => {
      setSearchQuery(query);
      setActiveSearchRow(rowKey);
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }
      searchTimeout.current = setTimeout(async () => {
        try {
          const res = await getInventario({ page: 1, limit: 10, busqueda: query });
          setSearchResults(res.data);
        } catch {
          setSearchResults([]);
        }
      }, 300);
    },
    []
  );

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

  const addRow = () => {
    setRows((prev) => [...prev, emptyRow(nextKey.current++)]);
  };

  const removeRow = (key: number) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));
  };

  const totalItems = rows.reduce((sum, r) => sum + (r.cantidad || 0), 0);

  const validate = (): boolean => {
    if (!proveedorId) {
      setError('Seleccione un proveedor');
      return false;
    }
    const validRows = rows.filter((r) => r.productoId);
    if (validRows.length === 0) {
      setError('Agregue al menos un medicamento');
      return false;
    }
    for (const r of validRows) {
      if (r.cantidad <= 0) {
        setError(`La cantidad de "${r.nombreProducto}" debe ser mayor a 0`);
        return false;
      }
      if (!r.lote) {
        setError(`El lote de "${r.nombreProducto}" es requerido`);
        return false;
      }
      if (!r.fechaVencimiento) {
        setError(`La fecha de vencimiento de "${r.nombreProducto}" es requerida`);
        return false;
      }
    }
    return true;
  };

  const buildPayload = () => ({
    proveedorId,
    remito: remito || undefined,
    fechaRecepcion,
    detalles: rows
      .filter((r) => r.productoId)
      .map((r) => ({
        productoId: r.productoId,
        cantidad: r.cantidad,
        ean: r.ean || undefined,
        troquel: r.troquel || undefined,
        lote: r.lote,
        fechaVencimiento: r.fechaVencimiento,
      })),
  });

  const handleSaveDraft = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      setError(null);
      await crearRecepcion(buildPayload());
      navigate('/recepciones');
    } catch {
      setError('Error al guardar el borrador');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmAndProcess = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      setError(null);
      const recepcion = await crearRecepcion(buildPayload());
      const confirmed = await confirmarRecepcion(recepcion.id);
      await procesarRecepcion(confirmed.id);
      navigate('/recepciones');
    } catch {
      setError('Error al confirmar la recepción');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => navigate('/recepciones')}
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-teal-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a recepciones
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva recepción</h1>
        <p className="mt-1 text-sm text-gray-500">
          Registre un nuevo ingreso de stock desde un proveedor
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Proveedor</label>
            <select
              value={proveedorId}
              onChange={(e) => setProveedorId(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="">Seleccionar proveedor...</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.razonSocial}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Remito</label>
            <input
              type="text"
              value={remito}
              onChange={(e) => setRemito(e.target.value)}
              placeholder="Nro. de remito"
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Fecha de recepción</label>
            <input
              type="date"
              value={fechaRecepcion}
              onChange={(e) => setFechaRecepcion(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Detalle de Medicamentos</h2>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Medicamento
              </th>
              <th className="w-20 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Cant.
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                EAN / Código
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Troquel
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Lote
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Vencimiento
              </th>
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
                      <button
                        onClick={() => updateRow(row.key, 'productoId', '')}
                        className="text-xs text-gray-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar medicamento..."
                        value={activeSearchRow === row.key ? searchQuery : ''}
                        onChange={(e) => handleSearch(e.target.value, row.key)}
                        onFocus={() => setActiveSearchRow(row.key)}
                        className="h-9 w-full rounded-lg border border-gray-200 pl-8 pr-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                      {activeSearchRow === row.key && searchResults.length > 0 && (
                        <div className="absolute left-0 top-full z-10 mt-1 max-h-48 w-80 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                          {searchResults.map((prod) => (
                            <button
                              key={prod.id}
                              onClick={() => selectMedicamento(row.key, prod)}
                              className="flex w-full flex-col px-3 py-2 text-left hover:bg-gray-50"
                            >
                              <span className="text-sm font-medium text-gray-900">{prod.nombre}</span>
                              <span className="text-xs text-gray-500">
                                {prod.principioActivo ?? prod.categoria} — {prod.presentacion ?? prod.unidad}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min={0}
                    value={row.cantidad || ''}
                    onChange={(e) => updateRow(row.key, 'cantidad', Number(e.target.value))}
                    className="h-9 w-full rounded-lg border border-gray-200 px-2 text-sm text-center focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={row.ean}
                    onChange={(e) => updateRow(row.key, 'ean', e.target.value)}
                    className="h-9 w-full rounded-lg border border-gray-200 px-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={row.troquel}
                    onChange={(e) => updateRow(row.key, 'troquel', e.target.value)}
                    className="h-9 w-full rounded-lg border border-gray-200 px-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={row.lote}
                    onChange={(e) => updateRow(row.key, 'lote', e.target.value)}
                    placeholder="Nro. lote"
                    className="h-9 w-full rounded-lg border border-gray-200 px-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="date"
                    value={row.fechaVencimiento}
                    onChange={(e) => updateRow(row.key, 'fechaVencimiento', e.target.value)}
                    className="h-9 w-full rounded-lg border border-gray-200 px-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => removeRow(row.key)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-gray-100 px-6 py-3">
          <button
            onClick={addRow}
            className="flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-800"
          >
            <Plus className="h-4 w-4" />
            Insertar nueva fila debajo
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Total de ítems: <span className="font-semibold text-gray-900">{totalItems}</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/recepciones')}
            className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="rounded-lg border border-teal-200 px-5 py-2.5 text-sm font-medium text-teal-700 hover:bg-teal-50 disabled:opacity-50"
          >
            {saving ? <Loader2 className="mr-1 inline h-4 w-4 animate-spin" /> : null}
            Guardar borrador
          </button>
          <button
            onClick={handleConfirmAndProcess}
            disabled={saving}
            className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
          >
            {saving ? <Loader2 className="mr-1 inline h-4 w-4 animate-spin" /> : null}
            Confirmar e ingresar al stock
          </button>
        </div>
      </div>
    </div>
  );
}

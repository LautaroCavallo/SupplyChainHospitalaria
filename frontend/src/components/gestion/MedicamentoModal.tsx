import { useState, useEffect } from 'react';
import { X, Info, BarChart2, DollarSign, MoreHorizontal, Loader2, Trash2 } from 'lucide-react';
import { crearMedicamento, actualizarMedicamento, eliminarMedicamento } from '../../api/medicamentos';
import ConfirmModal from '../common/ConfirmModal';
import type { MedicamentoListItem } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  medicamento: MedicamentoListItem | null;
}

const categorias = ['Analgésicos', 'Antibióticos', 'Cardiología', 'Endocrinología', 'Anestesia', 'Jarabe', 'Otro'];
const laboratorios = ['PharmaCore S.A.', 'NaturaPharma', 'BioMed', 'Laboratorio Central S.A.', 'Roemmers', 'Bayer', 'Otro'];

type Estado = 'ACTIVO' | 'INACTIVO';

export default function MedicamentoModal({ isOpen, onClose, medicamento }: Props) {
  const isEdit = !!medicamento;

  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [presentacion, setPresentacion] = useState('');
  const [ean, setEan] = useState('');
  const [laboratorio, setLaboratorio] = useState('');
  const [estado, setEstado] = useState<Estado>('ACTIVO');
  const [precio, setPrecio] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (medicamento) {
      setNombre(medicamento.nombre);
      setCategoria(medicamento.categoria);
      setPresentacion(medicamento.presentacion ?? '');
      setEan(medicamento.ean ?? '');
      setLaboratorio(medicamento.laboratorio ?? '');
      setEstado(medicamento.estado);
      setPrecio(medicamento.precio?.toString() ?? '');
      setObservaciones(medicamento.observaciones ?? '');
    } else {
      setNombre(''); setCategoria(''); setPresentacion('');
      setEan(''); setLaboratorio(''); setEstado('ACTIVO');
      setPrecio(''); setObservaciones('');
    }
    setError(null);
  }, [medicamento, isOpen]);

  const handleSubmit = async () => {
    if (!nombre || !categoria) { setError('Nombre y categoría son requeridos'); return; }
    try {
      setSaving(true); setError(null);
      const payload = {
        nombre, categoria,
        presentacion: presentacion || undefined,
        ean: ean || undefined,
        laboratorio: laboratorio || undefined,
        estado,
        precio: precio ? Number(precio) : undefined,
        observaciones: observaciones || undefined,
      };
      if (isEdit && medicamento) {
        await actualizarMedicamento(medicamento.id, payload);
      } else {
        await crearMedicamento(payload);
      }
      onClose();
    } catch { setError('Error al guardar el medicamento'); }
    finally { setSaving(false); }
  };

  if (!isOpen) return null;

  const estadoOptions: { value: Estado; label: string }[] = [
    { value: 'ACTIVO', label: 'Activo' },
    { value: 'INACTIVO', label: 'Inactivo' },
  ];

  // Incluir el laboratorio guardado en las opciones (puede no estar en la lista fija)
  const laboratorioOptions = laboratorio && !laboratorios.includes(laboratorio)
    ? [laboratorio, ...laboratorios]
    : laboratorios;

  const inputCls = 'h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/20';
  const selectCls = 'h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/20 appearance-none';
  const labelCls = 'mb-1.5 block text-xs font-medium text-gray-500';
  const sectionHeadCls = 'mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-[#f5f7f5] shadow-2xl">

        {/* Title area */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-3xl font-bold text-brand">
                {isEdit ? 'Editar medicamento' : 'Nuevo medicamento'}
              </h2>
              <p className="mt-1 text-sm text-gray-500">Modifique la información del producto seleccionado</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 pb-6">
          <div className="grid grid-cols-2 gap-x-10 gap-y-6">
            {/* Left — Información General */}
            <div>
              <div className={sectionHeadCls}>
                <Info className="h-3.5 w-3.5" />
                Información General
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Nombre</label>
                  <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre del medicamento" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Categoría</label>
                    <div className="relative">
                      <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={selectCls}>
                        <option value="">Seleccionar...</option>
                        {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Presentación</label>
                    <input type="text" value={presentacion} onChange={(e) => setPresentacion(e.target.value)}
                      placeholder="Ej: Caja x 16 comp." className={inputCls} />
                  </div>
                </div>
                <ConfirmModal
                  isOpen={confirmOpen}
                  title="Eliminar medicamento"
                  description="¿Está seguro que desea eliminar este medicamento? Esta acción no se puede deshacer."
                  confirmLabel="Eliminar"
                  cancelLabel="Cancelar"
                  loading={deleting}
                  onConfirm={async () => {
                    if (!medicamento) return;
                    try { setDeleting(true); await eliminarMedicamento(medicamento.id); onClose(); }
                    catch { setError('Error al eliminar el medicamento'); }
                    finally { setDeleting(false); setConfirmOpen(false); }
                  }}
                  onCancel={() => setConfirmOpen(false)}
                />
              </div>
            </div>

            {/* Right — Identificación */}
            <div>
              <div className={sectionHeadCls}>
                <BarChart2 className="h-3.5 w-3.5" />
                Identificación
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>EAN</label>
                  <input type="text" value={ean} onChange={(e) => setEan(e.target.value)}
                    placeholder="Código de barras EAN" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Laboratorio</label>
                  <div className="relative">
                    <select value={laboratorio} onChange={(e) => setLaboratorio(e.target.value)} className={selectCls}>
                      <option value="">Seleccionar...</option>
                      {laboratorioOptions.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Precio (optional, left) */}
            <div>
              <div className={sectionHeadCls}>
                <DollarSign className="h-3.5 w-3.5" />
                Precio
              </div>
              <div>
                <label className={labelCls}>Precio de Venta al Público</label>
                <input type="number" min={0} step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)}
                  placeholder="$0.00" className={inputCls} />
              </div>
            </div>

            {/* Estado (right) */}
            <div>
              <div className={sectionHeadCls}>
                <MoreHorizontal className="h-3.5 w-3.5" />
                Estado del Producto
              </div>
              <div className="flex flex-wrap gap-2 pr-2">
                {estadoOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setEstado(value)}
                    className={`flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                      estado === value
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-200/80 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {estado === value && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-700 text-white text-[10px]">✓</span>}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Observaciones — full width */}
            <div className="col-span-2">
              <div className={sectionHeadCls}>
                <MoreHorizontal className="h-3.5 w-3.5" />
                Información Adicional
              </div>
              <div>
                <label className={labelCls}>Observaciones</label>
                <input type="text" value={observaciones} onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ej: Mantener en lugar fresco y seco." className={inputCls} />
              </div>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-100/60 px-8 py-4">
          {isEdit ? (
            <button onClick={() => setConfirmOpen(true)} className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
              Eliminar medicamento
            </button>
          ) : <span />}
          <div className="flex items-center gap-3">
            <button onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900">
              Cancelar
            </button>
            <button onClick={handleSubmit} disabled={saving}
              className="flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-light disabled:opacity-50">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

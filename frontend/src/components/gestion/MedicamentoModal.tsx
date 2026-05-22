import { useState, useEffect } from 'react';
import { X, Loader2, Trash2 } from 'lucide-react';
import { crearMedicamento, actualizarMedicamento } from '../../api/medicamentos';
import type { MedicamentoListItem } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  medicamento: MedicamentoListItem | null;
}

const categorias = ['Analgésicos', 'Antibióticos', 'Cardiología', 'Endocrinología', 'Anestesia', 'Jarabe', 'Otro'];
const laboratorios = ['PharmaCore', 'NaturaPharma', 'BioMed', 'Laboratorio Central S.A.', 'Otro'];

export default function MedicamentoModal({ isOpen, onClose, medicamento }: Props) {
  const isEdit = !!medicamento;
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [presentacion, setPresentacion] = useState('');
  const [ean, setEan] = useState('');
  const [laboratorio, setLaboratorio] = useState('');
  const [estado, setEstado] = useState<'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO'>('ACTIVO');
  const [precio, setPrecio] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setNombre(''); setCategoria(''); setPresentacion(''); setEan('');
      setLaboratorio(''); setEstado('ACTIVO'); setPrecio(''); setObservaciones('');
    }
  }, [medicamento, isOpen]);

  const handleSubmit = async () => {
    if (!nombre || !categoria) { setError('Nombre y categoría son requeridos'); return; }
    try {
      setSaving(true); setError(null);
      const payload = { nombre, categoria, presentacion: presentacion || undefined, ean: ean || undefined, laboratorio: laboratorio || undefined, estado, precio: precio ? Number(precio) : undefined, observaciones: observaciones || undefined };
      if (isEdit && medicamento) {
        await actualizarMedicamento(medicamento.id, payload);
      } else {
        await crearMedicamento(payload);
      }
      onClose();
    } catch { setError('Error al guardar el medicamento'); } finally { setSaving(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Editar medicamento' : 'Nuevo medicamento'}
          </h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-5 grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Información General</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Nombre</label>
                  <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del medicamento"
                    className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Categoría</label>
                    <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
                      className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none">
                      <option value="">Seleccionar...</option>
                      {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Presentación</label>
                    <input type="text" value={presentacion} onChange={(e) => setPresentacion(e.target.value)} placeholder="Ej: Comprimidos x 20"
                      className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Identificación</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">EAN</label>
                  <input type="text" value={ean} onChange={(e) => setEan(e.target.value)} placeholder="Código EAN"
                    className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Laboratorio</label>
                  <select value={laboratorio} onChange={(e) => setLaboratorio(e.target.value)}
                    className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none">
                    <option value="">Seleccionar...</option>
                    {laboratorios.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Precio (PVP)</label>
                  <input type="number" min={0} step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="$0.00"
                    className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">Estado del Producto</label>
              <div className="flex gap-3">
                {(['ACTIVO', 'INACTIVO', 'SUSPENDIDO'] as const).map((s) => (
                  <label key={s} className="flex cursor-pointer items-center gap-2">
                    <input type="radio" name="estado" checked={estado === s} onChange={() => setEstado(s)}
                      className="h-4 w-4 border-gray-300 text-brand focus:ring-brand" />
                    <span className="text-sm text-gray-700">{s.charAt(0) + s.slice(1).toLowerCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Observaciones</label>
              <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={2} placeholder="Notas adicionales..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-brand focus:outline-none resize-none" />
            </div>
          </div>

          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          {isEdit ? (
            <button className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
              Eliminar medicamento
            </button>
          ) : <div />}
          <div className="flex gap-3">
            <button onClick={onClose} className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button onClick={handleSubmit} disabled={saving}
              className="rounded-xl bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-light disabled:opacity-50">
              {saving ? <Loader2 className="mr-1 inline h-4 w-4 animate-spin" /> : null}
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

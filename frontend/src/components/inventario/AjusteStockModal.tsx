import { useState } from 'react';
import Modal from '../common/Modal';
import type { ProductoInventario } from '../../types';

interface AjusteStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  producto: ProductoInventario | null;
  onConfirm: (data: { tipo: string; cantidad: number; motivo: string }) => Promise<void>;
}

const motivos = [
  'Ingreso de lote',
  'Ajuste por auditoría',
  'Rotura/Vencimiento',
  'Dispensación',
  'Otro',
];

export default function AjusteStockModal({ isOpen, onClose, producto, onConfirm }: AjusteStockModalProps) {
  const [tipo, setTipo] = useState<'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO'>('AJUSTE_POSITIVO');
  const [cantidad, setCantidad] = useState(0);
  const [motivo, setMotivo] = useState(motivos[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (cantidad <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await onConfirm({ tipo, cantidad, motivo });
      setCantidad(0);
      setTipo('AJUSTE_POSITIVO');
      setMotivo(motivos[0]);
      onClose();
    } catch {
      setError('Error al ajustar el stock');
    } finally {
      setSaving(false);
    }
  };

  if (!producto) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajustar stock" size="sm">
      <div className="space-y-5">
        <div>
          <p className="text-sm text-gray-500">Producto</p>
          <p className="font-medium text-gray-900">{producto.nombre}</p>
          <p className="text-xs text-gray-400">Stock actual: {producto.stockActual} {producto.unidad}</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Tipo de ajuste</label>
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="tipo"
                checked={tipo === 'AJUSTE_POSITIVO'}
                onChange={() => setTipo('AJUSTE_POSITIVO')}
                className="h-4 w-4 border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">Incremento</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="tipo"
                checked={tipo === 'AJUSTE_NEGATIVO'}
                onChange={() => setTipo('AJUSTE_NEGATIVO')}
                className="h-4 w-4 border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">Decremento</span>
            </label>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Cantidad</label>
          <input
            type="number"
            min={1}
            value={cantidad || ''}
            onChange={(e) => setCantidad(Number(e.target.value))}
            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="0"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Motivo</label>
          <select
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            {motivos.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Confirmar Ajuste'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

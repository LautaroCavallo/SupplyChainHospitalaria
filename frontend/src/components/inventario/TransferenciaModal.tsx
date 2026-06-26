import { useState, useEffect } from 'react';
import { X, Loader2, ArrowRight, Plus } from 'lucide-react';
import { getDepositos, crearDeposito, transferirStock } from '../../api/depositos';
import type { Deposito, ProductoInventario, StockPorDeposito } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  producto: ProductoInventario;
  stockPorDeposito: StockPorDeposito[];
  onTransferido: () => void;
}

export default function TransferenciaModal({ isOpen, onClose, producto, stockPorDeposito, onTransferido }: Props) {
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [origenId, setOrigenId] = useState('');
  const [destinoId, setDestinoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creandoDeposito, setCreandoDeposito] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');

  const cargarDepositos = async () => {
    const deps = await getDepositos(true);
    setDepositos(deps);
    return deps;
  };

  useEffect(() => {
    if (isOpen) {
      setError(null); setCantidad(''); setCreandoDeposito(false); setNuevoNombre('');
      cargarDepositos().then((deps) => {
        // Origen sugerido: el depósito con más stock de este producto
        const conStock = [...stockPorDeposito].sort((a, b) => b.stock - a.stock)[0];
        setOrigenId(conStock?.depositoId ?? deps[0]?.id ?? '');
        setDestinoId('');
      }).catch(() => setError('No se pudieron cargar los depósitos'));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const stockOrigen = stockPorDeposito.find((s) => s.depositoId === origenId)?.stock ?? 0;

  const handleCrearDeposito = async () => {
    if (!nuevoNombre.trim()) return;
    try {
      setSaving(true); setError(null);
      const nuevo = await crearDeposito({ nombre: nuevoNombre.trim(), tipo: 'PISO' });
      await cargarDepositos();
      setDestinoId(nuevo.id);
      setCreandoDeposito(false);
      setNuevoNombre('');
    } catch { setError('Error al crear el depósito'); }
    finally { setSaving(false); }
  };

  const handleTransferir = async () => {
    const cant = Number(cantidad);
    if (!origenId || !destinoId) { setError('Seleccioná origen y destino'); return; }
    if (origenId === destinoId) { setError('El origen y el destino deben ser distintos'); return; }
    if (!cant || cant <= 0) { setError('Ingresá una cantidad válida'); return; }
    if (cant > stockOrigen) { setError(`El origen solo tiene ${stockOrigen} unidades`); return; }

    try {
      setSaving(true); setError(null);
      await transferirStock({ productoId: producto.id, depositoOrigenId: origenId, depositoDestinoId: destinoId, cantidad: cant });
      onTransferido();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.error ?? 'Error al transferir');
    } finally { setSaving(false); }
  };

  const selectCls = 'h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-brand focus:outline-none';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#f5f7f5] shadow-2xl">
        <div className="flex items-start justify-between px-8 pt-7 pb-5">
          <div>
            <h2 className="font-serif text-2xl font-bold text-brand">Transferir stock</h2>
            <p className="mt-1 text-sm text-gray-500">{producto.nombre}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-8 pb-6 space-y-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Origen</label>
              <select value={origenId} onChange={(e) => setOrigenId(e.target.value)} className={selectCls}>
                {depositos.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
              <p className="mt-1 text-[11px] text-gray-400">Disponible: {stockOrigen} ud</p>
            </div>
            <ArrowRight className="mb-7 h-5 w-5 text-gray-400" />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Destino</label>
              <select value={destinoId} onChange={(e) => setDestinoId(e.target.value)} className={selectCls}>
                <option value="">Seleccionar...</option>
                {depositos.filter((d) => d.id !== origenId).map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
            </div>
          </div>

          {creandoDeposito ? (
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="mb-1.5 block text-xs font-medium text-gray-500">Nombre del nuevo depósito</label>
                <input value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej: Depósito Piso 3" className={selectCls} />
              </div>
              <button onClick={handleCrearDeposito} disabled={saving}
                className="h-11 rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-light disabled:opacity-50">
                Crear
              </button>
              <button onClick={() => setCreandoDeposito(false)}
                className="h-11 rounded-xl border border-gray-200 px-3 text-sm text-gray-500">
                Cancelar
              </button>
            </div>
          ) : (
            <button onClick={() => setCreandoDeposito(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline">
              <Plus className="h-3.5 w-3.5" /> Nuevo depósito
            </button>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">Cantidad a transferir</label>
            <input type="number" min={1} max={stockOrigen} value={cantidad} onChange={(e) => setCantidad(e.target.value)}
              placeholder="0" className={selectCls} />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-white px-8 py-4">
          <button onClick={onClose} className="text-sm font-medium text-gray-500 hover:text-gray-700">Cancelar</button>
          <button onClick={handleTransferir} disabled={saving}
            className="flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-light disabled:opacity-50">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Transferir
          </button>
        </div>
      </div>
    </div>
  );
}

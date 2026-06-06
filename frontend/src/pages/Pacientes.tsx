import { useMemo, useState } from 'react';
import { FileText, QrCode, CheckCircle2, Loader2 } from 'lucide-react';
import { validarReceta, registrarConsumo } from '../api/pacientes';
import type { RecetaDetalle } from '../types';
import ConfirmModal from '../components/common/ConfirmModal';
import QRScannerModal from '../components/pacientes/QRScannerModal';
import SortableTh, { type SortDirection } from '../components/common/SortableTh';
import { applySortDirection, compareNumber, compareText, nextSortDirection } from '../utils/sort';

type SortKey = 'medicamento' | 'descripcion' | 'cantAutorizada' | 'cantConsumida';

export default function Pacientes() {
  const [recetaId, setRecetaId] = useState('');
  const [receta, setReceta] = useState<RecetaDetalle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consumos, setConsumos] = useState<Record<number, number>>({});
  const [savingConsumo, setSavingConsumo] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [confirmConsumoOpen, setConfirmConsumoOpen] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'medicamento',
    direction: 'asc',
  });

  const handleValidar = async (id?: string) => {
    const idToUse = (id ?? recetaId).trim();
    if (!idToUse) return;
    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);
      const result = await validarReceta(idToUse);
      setReceta(result);
      setRecetaId(idToUse);
      setConsumos(Object.fromEntries(result.items.map((item, index) => [index, item.cantAutorizada])));

      if (!result.valida) {
        const message = result.errores?.length
          ? result.errores.join('; ')
          : result.estado === 'Vencida'
            ? `La receta ${idToUse} es inválida porque está vencida`:
            `La receta ${idToUse} no es válida`;
        setError(message);
      }
    } catch (err: any) {
      const backendMessage = err?.response?.data?.error || err?.message;
      setError(backendMessage || 'Receta no encontrada o inválida');
      setReceta(null);
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = (data: string) => {
    // The QR may contain a full ID or a URL with the ID embedded
    // Try to extract a pattern like REC-XXXX-XXXX or use the raw value
    const match = data.match(/recetas?[=/](\d+)/i) ?? data.match(/\b\d+\b/);
    const extracted = match ? match[1] ?? match[0] : data.trim();
    setRecetaId(extracted);
    handleValidar(extracted);
  };

  const handleOpenConfirmConsumo = () => {
    if (!receta || receta.consumida) return;
    setConfirmConsumoOpen(true);
  };

  const handleRegistrarConsumo = async () => {
    if (!receta || receta.consumida) return;
    setConfirmConsumoOpen(false);

    try {
      setSavingConsumo(true);
      setError(null);
      setSuccessMsg(null);

      const items = receta.items
        .map((item, i) => ({
          medicamento: item.medicamento,
          cantConsumo: consumos[i] ?? item.cantConsumida,
        }))
        .filter((item) => item.cantConsumo > 0);

      await registrarConsumo(receta.id, items);
      setSuccessMsg('Consumo registrado exitosamente');
      setReceta((current) => current ? { ...current, consumida: true, estado: 'Consumida' } : current);
    } catch (err: any) {
      const backendMessage = err?.response?.data?.error || err?.message;
      const detailMessages = Array.isArray(err?.response?.data?.details)
        ? err.response.data.details.map((d: any) => d.mensaje).join('; ')
        : null;

      setError(detailMessages || backendMessage || 'Error al registrar el consumo');
    } finally {
      setSavingConsumo(false);
    }
  };

  const sortedItems = useMemo(() => {
    return [...(receta?.items ?? [])]
      .map((item, index) => ({ item, index }))
      .sort((a, b) => {
        let result = 0;

        if (sort.key === 'medicamento') result = compareText(a.item.medicamento, b.item.medicamento);
        if (sort.key === 'descripcion') result = compareText(a.item.descripcion, b.item.descripcion);
        if (sort.key === 'cantAutorizada') result = compareNumber(a.item.cantAutorizada, b.item.cantAutorizada);
        if (sort.key === 'cantConsumida') {
          result = compareNumber(
            consumos[a.index] ?? a.item.cantConsumida,
            consumos[b.index] ?? b.item.cantConsumida
          );
        }

        return applySortDirection(result, sort.direction);
      });
  }, [consumos, receta?.items, sort]);

  const handleSort = (key: SortKey) => {
    setSort((current) => ({ key, direction: nextSortDirection(current, key) }));
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-5xl font-bold text-gray-900">Pacientes</h1>
        <p className="mt-2 text-sm text-gray-500">Validacion de recetas y registro de consumo</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left panel: Validar receta */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
              <FileText className="h-4 w-4 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Validar Receta</h2>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Ingrese ID de Receta
            </label>
            <input
              type="text"
              value={recetaId}
              onChange={(e) => setRecetaId(e.target.value)}
              placeholder="8502"
              onKeyDown={(e) => e.key === 'Enter' && handleValidar()}
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <button
            onClick={() => handleValidar()}
            disabled={loading}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white hover:bg-brand-light disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Validar receta
          </button>

          <button
            onClick={() => setQrScannerOpen(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition-colors"
          >
            <QrCode className="h-4 w-4" />
            Escanear QR con cámara
          </button>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          )}
          {successMsg && (
            <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{successMsg}</p>
          )}

          {/* Doctor info */}
          {receta && (
            <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Información del Médico
              </p>
              <p className="text-sm font-semibold text-gray-900">{receta.medicoNombre}</p>
              <p className="text-xs text-gray-500">
                Matrícula: {receta.medicoMatricula} · Especialidad: {receta.medicoEspecialidad}
              </p>
            </div>
          )}
        </div>

        {/* Right panel: Detalle receta */}
        {receta ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Detalle de Receta</h2>
                <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                  <span>👤 {receta.paciente}</span>
                  <span>📅 {receta.fecha}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">Estado</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {receta.estado}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">Consumida</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                    {receta.consumida ? 'Sí' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Ítems Autorizados
            </p>

            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <SortableTh label="Medicamento" sortKey="medicamento" activeKey={sort.key} direction={sort.direction} onSort={handleSort} className="pb-2 text-xs font-semibold uppercase tracking-widest text-gray-400" />
                  <SortableTh label="Descripción" sortKey="descripcion" activeKey={sort.key} direction={sort.direction} onSort={handleSort} className="pb-2 text-xs font-semibold uppercase tracking-widest text-gray-400" />
                  <SortableTh label="Cant. Autorizada" sortKey="cantAutorizada" activeKey={sort.key} direction={sort.direction} onSort={handleSort} align="center" className="pb-2 text-xs font-semibold uppercase tracking-widest text-gray-400" />
                  <SortableTh label="Cant. Consumida" sortKey="cantConsumida" activeKey={sort.key} direction={sort.direction} onSort={handleSort} align="center" className="pb-2 text-xs font-semibold uppercase tracking-widest text-gray-400" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedItems.map(({ item, index }) => (
                  <tr key={index}>
                    <td className="py-3 text-sm font-semibold text-gray-900">{item.medicamento}</td>
                    <td className="py-3 pr-4 text-xs text-gray-500">{item.descripcion}</td>
                    <td className="py-3 text-center text-sm font-bold text-gray-900">{item.cantAutorizada}</td>
                    <td className="py-3 text-center">
                      <input
                        type="number"
                        min={0}
                        max={item.cantAutorizada}
                        value={consumos[index] ?? item.cantConsumida}
                        onChange={(e) => setConsumos((prev) => ({ ...prev, [index]: Number(e.target.value) }))}
                        className="h-9 w-16 rounded-xl border border-gray-200 text-center text-sm font-semibold focus:border-brand focus:outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleOpenConfirmConsumo}
                disabled={savingConsumo || receta.consumida}
                className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-light disabled:opacity-60"
              >
                {savingConsumo ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Registrar consumo
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-12">
            <div className="text-center">
              <FileText className="mx-auto mb-3 h-12 w-12 text-gray-200" />
              <p className="text-sm text-gray-400">
                Ingrese un ID de receta para ver los detalles
              </p>
            </div>
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
        onScan={handleQRScan}
      />

      <ConfirmModal
        isOpen={confirmConsumoOpen}
        title="Confirmar consignación"
        description="¿Confirmar la dispensación de esta receta? Una vez confirmada no podrá volver a dispensarse."
        confirmLabel="Registrar consumo"
        cancelLabel="Cancelar"
        loading={savingConsumo}
        onConfirm={handleRegistrarConsumo}
        onCancel={() => setConfirmConsumoOpen(false)}
      />
    </div>
  );
}

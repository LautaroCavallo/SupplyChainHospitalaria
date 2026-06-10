import { v4 as uuidv4 } from 'uuid';
import { IComprasService, OrdenCompraPayload, ResultadoEnvio, AdjudicacionCallbackDTO } from '../../../domain/services/IComprasService';

// Tabla de precios: valores ascendentes múltiplos de 1000
// El hash del nombre del producto selecciona un índice de esta tabla → precio siempre consistente entre runs
const TABLA_PRECIOS = [
  1000, 2000, 3000, 4000, 5000,
  6000, 7000, 8000, 9000, 10000,
  11000, 12000, 13000, 14000, 15000,
  16000, 17000, 18000, 19000, 20000,
];

function hashPrecio(nombre: string): number {
  let hash = 5381;
  for (let i = 0; i < nombre.length; i++) {
    hash = ((hash << 5) + hash) ^ nombre.charCodeAt(i);
    hash = hash >>> 0; // forzar unsigned 32-bit
  }
  return TABLA_PRECIOS[hash % TABLA_PRECIOS.length];
}

export class ComprasFixtureService implements IComprasService {
  async enviarOrdenCompra(payload: OrdenCompraPayload): Promise<ResultadoEnvio> {
    const ordenCompraExternaId = `OC-COMPRAS-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 6).toUpperCase()}`;

    const itemsAdjudicados = payload.items.map((item) => ({
      productoId: item.productoId,
      cantidadAprobada: item.cantidad,
      precioUnitario: hashPrecio(item.nombre),
    }));

    const autoCallback: AdjudicacionCallbackDTO = {
      aprobado: true,
      referenciaExterna: ordenCompraExternaId,
      proveedorAdjudicado: { razonSocial: 'Proveedor Mock S.A.' },
      itemsAdjudicados,
      fechaAprobacion: new Date().toISOString(),
      fechaEntregaEstimada: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      observaciones: 'Adjudicación automática (mock)',
    };

    return {
      exitoso: true,
      ordenCompraExternaId,
      mensaje: 'OC recibida',
      errores: [],
      autoCallback,
    };
  }
}

import { v4 as uuidv4 } from 'uuid';
import { IComprasService, OrdenCompraPayload, ResultadoEnvio, AdjudicacionCallbackDTO } from '../../../domain/services/IComprasService';

export class ComprasFixtureService implements IComprasService {
  async enviarOrdenCompra(payload: OrdenCompraPayload): Promise<ResultadoEnvio> {
    const ordenCompraExternaId = `OC-COMPRAS-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 6).toUpperCase()}`;

    const itemsAdjudicados = payload.items.map((item) => ({
      productoId: item.productoId,
      cantidadAprobada: item.cantidad,
      precioUnitario: Math.round((Math.random() * 4900 + 100) * 100) / 100,
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

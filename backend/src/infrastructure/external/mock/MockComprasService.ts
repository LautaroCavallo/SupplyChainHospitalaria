import { IComprasService, SolicitudCompraExterna, ResultadoEnvio } from '../../../domain/services/IComprasService';

export class MockComprasService implements IComprasService {
  async enviarSolicitud(solicitud: SolicitudCompraExterna): Promise<ResultadoEnvio> {
    return {
      exitoso: true,
      solicitudExternaId: `OC-${Date.now().toString(36).toUpperCase()}`,
      mensaje: 'Solicitud de compra enviada al módulo de compras exitosamente',
      errores: [],
    };
  }
}

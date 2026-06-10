import { IComprasService, OrdenCompraPayload, ResultadoEnvio } from '../../../domain/services/IComprasService';

export class HttpComprasService implements IComprasService {
  constructor(private readonly comprasApiUrl: string) {}

  async enviarOrdenCompra(payload: OrdenCompraPayload): Promise<ResultadoEnvio> {
    const response = await fetch(`${this.comprasApiUrl}/ordenes-compra`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        exitoso: false,
        mensaje: `Error HTTP ${response.status} al contactar módulo de Compras`,
        errores: [`HTTP ${response.status}: ${response.statusText}`],
      };
    }

    const data = await response.json() as {
      exitoso: boolean;
      ordenCompraExternaId?: string;
      mensaje: string;
      errores: string[];
    };

    return {
      exitoso: data.exitoso,
      ordenCompraExternaId: data.ordenCompraExternaId,
      mensaje: data.mensaje,
      errores: data.errores ?? [],
    };
  }
}

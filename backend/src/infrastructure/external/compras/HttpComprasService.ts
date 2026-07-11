import { IComprasService, OrdenCompraPayload, ResultadoEnvio } from '../../../domain/services/IComprasService';

/**
 * Adapter HTTP hacia el Módulo 7 (Compras/Facturación).
 * POST {comprasApiUrl}/ordenes-compra con el contrato OrdenCompraFarmaciaRequest.
 *
 * Módulo 7 exige JWT de Core (Authorization: Bearer). `getToken` provee un token
 * de servicio válido; ante un 401 se fuerza un re-login y se reintenta una vez.
 */
export class HttpComprasService implements IComprasService {
  constructor(
    private readonly comprasApiUrl: string,
    private readonly getToken?: (force?: boolean) => Promise<string>,
  ) {}

  async enviarOrdenCompra(payload: OrdenCompraPayload): Promise<ResultadoEnvio> {
    const post = async (forceToken = false): Promise<Response> => {
      const token = this.getToken ? await this.getToken(forceToken) : undefined;
      return fetch(`${this.comprasApiUrl}/ordenes-compra`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
    };

    let response = await post();
    // Token vencido → re-login y un reintento.
    if (response.status === 401 && this.getToken) {
      response = await post(true);
    }

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

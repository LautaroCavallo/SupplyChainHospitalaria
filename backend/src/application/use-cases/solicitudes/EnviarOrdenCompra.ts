import { v4 as uuidv4 } from 'uuid';
import { ISolicitudCompraRepository } from '../../../domain/repositories/ISolicitudCompraRepository';
import { IEventPublisher } from '../../../domain/services/IEventPublisher';
import { OrdenCompraPayload } from '../../../domain/services/IComprasService';
import { SolicitudCompraResponseDTO } from '../../dtos';
import { NotFoundError, ValidationError } from '../../errors/AppError';
import { config } from '../../../config';

/**
 * Envío a Compras — ahora ASÍNCRONO (orientado a eventos).
 *
 * En vez de llamar sincrónicamente al módulo de Compras (que bloqueaba el request
 * y perdía el pedido si el proceso moría), este caso de uso:
 *   1. marca la solicitud como ENVIADA,
 *   2. publica un evento en Kafka (topic durable).
 *
 * El WORKER (src/worker.ts) consume ese evento y hace el envío real al módulo de
 * Compras. Si se cae la API o el worker, el evento sobrevive en Kafka y se procesa
 * al reiniciar el worker.
 */
export class EnviarOrdenCompra {
  constructor(
    private readonly solicitudRepository: ISolicitudCompraRepository,
    private readonly eventPublisher: IEventPublisher,
  ) {}

  async execute(solicitudId: string, backendBaseUrl: string): Promise<SolicitudCompraResponseDTO> {
    const solicitud = await this.solicitudRepository.findById(solicitudId);
    if (!solicitud) {
      throw new NotFoundError(`Solicitud de compra ${solicitudId} no encontrada`);
    }

    if (solicitud.estado !== 'PENDIENTE') {
      throw new ValidationError(`La solicitud debe estar en estado PENDIENTE para enviarse a Compras (estado actual: ${solicitud.estado})`);
    }

    const ordenCompraId = uuidv4();
    const callbackUrl = `${backendBaseUrl}/api/v1/solicitudes-compra/${solicitudId}/confirmacion-adjudicacion`;

    // Construir proveedor sugerido si existe en la solicitud
    const proveedorSugerido = (solicitud as any).proveedorSugerido
      ? {
          id: (solicitud as any).proveedorSugerido.id as string,
          razonSocial: (solicitud as any).proveedorSugerido.razonSocial as string,
          cuit: (solicitud as any).proveedorSugerido.cuit as string,
        }
      : undefined;

    const items = solicitud.detalles.map((d) => ({
      productoId: d.productoId,
      nombre: (d as any).producto?.nombre ?? d.productoId,
      cantidad: d.cantidadSolicitada,
      unidad: d.unidad ?? 'unidad',
    }));

    const payload: OrdenCompraPayload = {
      ordenCompraId,
      solicitudCompraId: solicitudId,
      prioridad: solicitud.prioridad,
      proveedorSugerido,
      items,
      motivo: solicitud.motivo,
      fechaGeneracion: new Date().toISOString(),
      callbackUrl,
    };

    // 1) Marcar ENVIADA antes de publicar: así el worker siempre encuentra la
    //    solicitud en el estado esperado (sin carreras).
    await this.solicitudRepository.update(solicitudId, {
      estado: 'ENVIADA',
      ordenCompraId,
    });

    // 2) Publicar el evento en el topic durable. Si Kafka falla, revertimos a
    //    PENDIENTE para que el usuario pueda reintentar (consistencia simple).
    try {
      const key = proveedorSugerido?.id ?? solicitudId;
      await this.eventPublisher.publish(config.kafka.topics.ordenSolicitada, key, payload);
    } catch (err) {
      await this.solicitudRepository.update(solicitudId, { estado: 'PENDIENTE' });
      throw new ValidationError(`No se pudo encolar el envío a Compras: ${(err as Error).message}`);
    }

    const solicitudActualizada = await this.solicitudRepository.findById(solicitudId);
    return solicitudActualizada as unknown as SolicitudCompraResponseDTO;
  }
}

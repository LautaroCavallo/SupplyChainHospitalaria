import { ISolicitudCompraRepository } from '../../../domain/repositories/ISolicitudCompraRepository';
import { ConfirmacionAdjudicacionDTO, SolicitudCompraResponseDTO } from '../../dtos';
import { NotFoundError, ValidationError } from '../../errors/AppError';

export class ConfirmarAdjudicacion {
  constructor(
    private readonly solicitudRepository: ISolicitudCompraRepository,
  ) {}

  async execute(solicitudId: string, payload: ConfirmacionAdjudicacionDTO): Promise<SolicitudCompraResponseDTO> {
    const solicitud = await this.solicitudRepository.findById(solicitudId);
    if (!solicitud) {
      throw new NotFoundError(`Solicitud de compra ${solicitudId} no encontrada`);
    }

    if (solicitud.estado !== 'ENVIADA') {
      throw new ValidationError(`La solicitud debe estar en estado ENVIADA para recibir confirmación (estado actual: ${solicitud.estado})`);
    }

    if (payload.aprobado) {
      const detallesUpdate = payload.itemsAdjudicados?.map((item) => ({
        productoId: item.productoId,
        cantidadAprobada: item.cantidadAprobada,
        precioUnitario: item.precioUnitario,
      }));

      await this.solicitudRepository.update(solicitudId, {
        estado: 'APROBADA',
        referenciaExterna: payload.referenciaExterna,
        proveedorAdjudicadoRazonSocial: payload.proveedorAdjudicado?.razonSocial,
        fechaAprobacion: payload.fechaAprobacion ? new Date(payload.fechaAprobacion) : new Date(),
        fechaEntregaEstimada: payload.fechaEntregaEstimada ? new Date(payload.fechaEntregaEstimada) : undefined,
        observaciones: payload.observaciones,
        detalles: detallesUpdate,
      });
    } else {
      await this.solicitudRepository.update(solicitudId, {
        estado: 'RECHAZADA',
        referenciaExterna: payload.referenciaExterna,
        observaciones: payload.observaciones,
      });
    }

    const solicitudActualizada = await this.solicitudRepository.findById(solicitudId);
    return solicitudActualizada as unknown as SolicitudCompraResponseDTO;
  }
}

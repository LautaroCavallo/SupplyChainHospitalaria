import { ISolicitudCompraRepository } from '../../../domain/repositories/ISolicitudCompraRepository';
import { IInventarioRepository } from '../../../domain/repositories/IInventarioRepository';
import { CrearSolicitudCompraDTO, SolicitudCompraResponseDTO } from '../../dtos';
import { NotFoundError, ValidationError } from '../../errors/AppError';

export class ActualizarSolicitudCompra {
  constructor(
    private readonly solicitudRepository: ISolicitudCompraRepository,
    private readonly inventarioRepository: IInventarioRepository,
  ) {}

  async execute(id: string, dto: CrearSolicitudCompraDTO): Promise<SolicitudCompraResponseDTO> {
    const solicitud = await this.solicitudRepository.findById(id);
    if (!solicitud) {
      throw new NotFoundError(`Solicitud ${id} no encontrada`);
    }

    if (solicitud.estado !== 'BORRADOR') {
      throw new ValidationError('Solo se puede modificar una solicitud en estado BORRADOR');
    }

    if (!dto.detalles || dto.detalles.length === 0) {
      throw new ValidationError('La solicitud debe tener al menos un detalle');
    }

    for (const detalle of dto.detalles) {
      const producto = await this.inventarioRepository.findById(detalle.productoId);
      if (!producto) {
        throw new NotFoundError(`Producto con id ${detalle.productoId} no encontrado`);
      }
    }

    const result = await this.solicitudRepository.updateBorrador(id, {
      prioridad: dto.prioridad as any,
      motivo: dto.motivo,
      proveedorSugeridoId: dto.proveedorSugeridoId,
      detalles: dto.detalles,
    });

    return result as unknown as SolicitudCompraResponseDTO;
  }
}

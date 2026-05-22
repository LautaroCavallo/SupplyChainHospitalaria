import { ISolicitudCompraRepository } from '../../../domain/repositories/ISolicitudCompraRepository';
import { IInventarioRepository } from '../../../domain/repositories/IInventarioRepository';
import { CrearSolicitudCompraDTO, SolicitudCompraResponseDTO } from '../../dtos';
import { NotFoundError, ValidationError } from '../../errors/AppError';

export class CrearSolicitudCompra {
  constructor(
    private readonly solicitudRepository: ISolicitudCompraRepository,
    private readonly inventarioRepository: IInventarioRepository,
  ) {}

  async execute(dto: CrearSolicitudCompraDTO): Promise<SolicitudCompraResponseDTO> {
    if (!dto.detalles || dto.detalles.length === 0) {
      throw new ValidationError('La solicitud debe tener al menos un detalle');
    }

    for (const detalle of dto.detalles) {
      const producto = await this.inventarioRepository.findById(detalle.productoId);
      if (!producto) {
        throw new NotFoundError(`Producto con id ${detalle.productoId} no encontrado`);
      }
    }

    const result = await this.solicitudRepository.create({
      ...dto,
      prioridad: (dto.prioridad ?? 'NORMAL') as any,
    });
    return result as unknown as SolicitudCompraResponseDTO;
  }
}

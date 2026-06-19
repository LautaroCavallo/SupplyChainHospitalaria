import { IRecepcionRepository } from '../../../domain/repositories/IRecepcionRepository';
import { RecepcionResponseDTO } from '../../dtos';
import { NotFoundError, ValidationError } from '../../errors/AppError';

export class ConfirmarRecepcion {
  constructor(private readonly recepcionRepository: IRecepcionRepository) {}

  async execute(id: string, usuarioId?: string): Promise<RecepcionResponseDTO> {
    const recepcion = await this.recepcionRepository.findById(id);
    if (!recepcion) {
      throw new NotFoundError(`Recepción con id ${id} no encontrada`);
    }

    if (recepcion.estado !== 'PROCESADA') {
      throw new ValidationError(
        `La recepción debe estar en estado PROCESADA para confirmar. Estado actual: ${recepcion.estado}`,
      );
    }

    if (!recepcion.remito?.trim()) {
      throw new ValidationError('Debe cargar el número de remito antes de confirmar la recepción');
    }

    if (recepcion.detalles.length === 0) {
      throw new ValidationError('La recepción debe tener al menos un detalle');
    }

    const detalleIncompleto = recepcion.detalles.find((detalle) =>
      !detalle.productoId || detalle.cantidad <= 0 || !detalle.lote?.trim() || !detalle.fechaVencimiento
    );
    if (detalleIncompleto) {
      throw new ValidationError('Todos los detalles deben tener producto, cantidad, lote y vencimiento antes de confirmar');
    }

    const result = await this.recepcionRepository.procesarStock(id, usuarioId);
    return result as unknown as RecepcionResponseDTO;
  }
}

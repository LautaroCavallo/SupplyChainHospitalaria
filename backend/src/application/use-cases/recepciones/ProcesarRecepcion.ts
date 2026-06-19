import { IRecepcionRepository } from '../../../domain/repositories/IRecepcionRepository';
import { RecepcionResponseDTO } from '../../dtos';
import { NotFoundError, ValidationError } from '../../errors/AppError';

export class ProcesarRecepcion {
  constructor(private readonly recepcionRepository: IRecepcionRepository) {}

  async execute(id: string): Promise<RecepcionResponseDTO> {
    const recepcion = await this.recepcionRepository.findById(id);
    if (!recepcion) {
      throw new NotFoundError(`Recepción con id ${id} no encontrada`);
    }

    if (recepcion.estado !== 'BORRADOR') {
      throw new ValidationError(
        `La recepción debe estar en estado BORRADOR para procesar. Estado actual: ${recepcion.estado}`,
      );
    }

    if (recepcion.detalles.length === 0) {
      throw new ValidationError('La recepción debe tener al menos un detalle');
    }

    if (!recepcion.remito?.trim()) {
      throw new ValidationError('Para procesar debe ingresar el número de remito');
    }

    const detalleIncompleto = recepcion.detalles.find((detalle) =>
      !detalle.productoId
      || detalle.cantidad <= 0
      || !detalle.ean?.trim()
      || !detalle.troquel?.trim()
      || !detalle.lote?.trim()
      || !detalle.fechaVencimiento
    );
    if (detalleIncompleto) {
      throw new ValidationError('Para procesar debe completar remito, producto, EAN, troquel, cantidad, lote y vencimiento en todos los detalles');
    }

    const result = await this.recepcionRepository.update(id, { estado: 'PROCESADA' });
    return result as unknown as RecepcionResponseDTO;
  }
}

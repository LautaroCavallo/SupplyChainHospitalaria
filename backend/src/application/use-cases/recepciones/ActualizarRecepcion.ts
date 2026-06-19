import { IRecepcionRepository } from '../../../domain/repositories/IRecepcionRepository';
import { IProveedorRepository } from '../../../domain/repositories/IProveedorRepository';
import { CrearRecepcionDTO, RecepcionResponseDTO } from '../../dtos';
import { NotFoundError, ConflictError } from '../../errors/AppError';

export class ActualizarRecepcion {
  constructor(
    private readonly recepcionRepository: IRecepcionRepository,
    private readonly proveedorRepository: IProveedorRepository,
  ) {}

  async execute(id: string, dto: CrearRecepcionDTO): Promise<RecepcionResponseDTO> {
    const recepcion = await this.recepcionRepository.findById(id);
    if (!recepcion) {
      throw new NotFoundError(`Recepción con id ${id} no encontrada`);
    }

    if (!['BORRADOR', 'PROCESADA'].includes(recepcion.estado)) {
      throw new ConflictError('Solo se pueden modificar recepciones en estado BORRADOR o PROCESADA');
    }

    const proveedor = await this.proveedorRepository.findById(dto.proveedorId);
    if (!proveedor) {
      throw new NotFoundError(`Proveedor con id ${dto.proveedorId} no encontrado`);
    }

    const result = await this.recepcionRepository.update(id, {
      proveedorId: dto.proveedorId,
      solicitudCompraId: dto.solicitudCompraId,
      remito: dto.remito,
      fechaRecepcion: dto.fechaRecepcion ? new Date(dto.fechaRecepcion) : undefined,
      observaciones: dto.observaciones,
      detalles: dto.detalles.map((d) => ({
        productoId: d.productoId,
        cantidad: d.cantidad,
        ean: d.ean,
        troquel: d.troquel,
        lote: d.lote,
        fechaVencimiento: d.fechaVencimiento ? new Date(d.fechaVencimiento) : undefined,
      })),
    });

    return result as unknown as RecepcionResponseDTO;
  }
}

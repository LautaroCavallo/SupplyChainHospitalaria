import { IRecepcionRepository } from '../../../domain/repositories/IRecepcionRepository';
import { IProveedorRepository } from '../../../domain/repositories/IProveedorRepository';
import { CrearRecepcionDTO, RecepcionResponseDTO } from '../../dtos';
import { NotFoundError } from '../../errors/AppError';

export class CrearRecepcion {
  constructor(
    private readonly recepcionRepository: IRecepcionRepository,
    private readonly proveedorRepository: IProveedorRepository,
  ) {}

  async execute(dto: CrearRecepcionDTO): Promise<RecepcionResponseDTO> {
    const proveedor = await this.proveedorRepository.findById(dto.proveedorId);
    if (!proveedor) {
      throw new NotFoundError(`Proveedor con id ${dto.proveedorId} no encontrado`);
    }

    const result = await this.recepcionRepository.create({
      proveedorId: dto.proveedorId,
      remito: dto.remito,
      fechaRecepcion: dto.fechaRecepcion ? new Date(dto.fechaRecepcion) : undefined,
      observaciones: dto.observaciones,
      detalles: dto.detalles.map(d => ({
        ...d,
        fechaVencimiento: new Date(d.fechaVencimiento),
      })),
    });
    return result as unknown as RecepcionResponseDTO;
  }
}

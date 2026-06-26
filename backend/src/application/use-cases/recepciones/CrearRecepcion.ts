import { IRecepcionRepository } from '../../../domain/repositories/IRecepcionRepository';
import { IProveedorRepository } from '../../../domain/repositories/IProveedorRepository';
import { INotificacionRepository } from '../../../domain/repositories/INotificacionRepository';
import { CrearRecepcionDTO, RecepcionResponseDTO } from '../../dtos';
import { NotFoundError } from '../../errors/AppError';

export class CrearRecepcion {
  constructor(
    private readonly recepcionRepository: IRecepcionRepository,
    private readonly proveedorRepository: IProveedorRepository,
    private readonly notificacionRepository: INotificacionRepository,
  ) {}

  async execute(dto: CrearRecepcionDTO, usuarioId?: string): Promise<RecepcionResponseDTO> {
    const proveedor = await this.proveedorRepository.findById(dto.proveedorId);
    if (!proveedor) {
      throw new NotFoundError(`Proveedor con id ${dto.proveedorId} no encontrado`);
    }

    const result = await this.recepcionRepository.create({
      proveedorId: dto.proveedorId,
      solicitudCompraId: dto.solicitudCompraId,
      remito: dto.remito,
      fechaRecepcion: dto.fechaRecepcion ? new Date(dto.fechaRecepcion) : undefined,
      estado: 'PROCESADA',
      observaciones: dto.observaciones,
      usuarioId,
      detalles: dto.detalles.map(d => ({
        productoId: d.productoId,
        cantidad: d.cantidad,
        ean: d.ean,
        troquel: d.troquel,
        lote: d.lote,
        fechaVencimiento: d.fechaVencimiento ? new Date(d.fechaVencimiento) : undefined,
      })),
    });

    // Crear notificación de nueva recepción
    try {
      const recepcionId = (result as any).id ?? '';
      await this.notificacionRepository.crearSiNoExiste({
        tipo: 'nueva_recepcion',
        titulo: `Nueva recepción: ${dto.remito ?? recepcionId}`,
        descripcion: `Se registró una nueva recepción de ${proveedor.razonSocial} con ${dto.detalles.length} ítem(s).`,
        referencia: `recepcion_${recepcionId}`,
        usuarioId,
      });
    } catch {
      // No interrumpir el flujo si falla la notificación
    }

    return result as unknown as RecepcionResponseDTO;
  }
}

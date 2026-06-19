import { IRecepcionRepository } from '../../../domain/repositories/IRecepcionRepository';
import { ISolicitudCompraRepository } from '../../../domain/repositories/ISolicitudCompraRepository';
import { IProveedorRepository } from '../../../domain/repositories/IProveedorRepository';
import { RecepcionResponseDTO } from '../../dtos';
import { NotFoundError, ValidationError } from '../../errors/AppError';

function cuitFromName(name: string): string {
  const digits = name
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)
    .toString()
    .padStart(8, '0')
    .slice(-8);
  const base = `30${digits}`;
  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const total = base.split('').reduce((sum, digit, index) => sum + Number(digit) * multipliers[index], 0);
  const rest = total % 11;
  const checkDigit = rest === 0 ? 0 : rest === 1 ? 9 : 11 - rest;

  return `${base}${checkDigit}`;
}

export class CrearRecepcionDesdeOrdenCompra {
  constructor(
    private readonly recepcionRepository: IRecepcionRepository,
    private readonly solicitudCompraRepository: ISolicitudCompraRepository,
    private readonly proveedorRepository: IProveedorRepository,
  ) {}

  async execute(solicitudId: string, usuarioId?: string): Promise<RecepcionResponseDTO> {
    const existente = await this.recepcionRepository.findBySolicitudCompraId(solicitudId);
    if (existente) {
      const solicitudExistente = await this.solicitudCompraRepository.findById(solicitudId);
      if (solicitudExistente?.estado === 'APROBADA') {
        await this.solicitudCompraRepository.update(solicitudId, { estado: 'EN_RECEPCION' });
      }

      if (
        existente.estado === 'PROCESADA'
        && existente.observaciones?.includes('Generada desde orden de compra')
      ) {
        const result = await this.recepcionRepository.update(existente.id, { estado: 'BORRADOR' });
        return result as unknown as RecepcionResponseDTO;
      }

      return existente as unknown as RecepcionResponseDTO;
    }

    const solicitud = await this.solicitudCompraRepository.findById(solicitudId);
    if (!solicitud) {
      throw new NotFoundError(`Orden de compra ${solicitudId} no encontrada`);
    }

    if (solicitud.estado !== 'APROBADA') {
      throw new ValidationError(`La orden de compra debe estar APROBADA para generar recepción. Estado actual: ${solicitud.estado}`);
    }

    let proveedorId = solicitud.proveedorSugeridoId ?? (solicitud as any).proveedorSugerido?.id;
    if (!proveedorId && solicitud.proveedorAdjudicadoRazonSocial) {
      const [proveedorExistente] = await this.proveedorRepository.findAll({
        razonSocial: solicitud.proveedorAdjudicadoRazonSocial,
        limit: 1,
      });
      const proveedor = proveedorExistente ?? await this.proveedorRepository.create({
        razonSocial: solicitud.proveedorAdjudicadoRazonSocial,
        cuit: cuitFromName(solicitud.proveedorAdjudicadoRazonSocial),
      });

      proveedorId = proveedor.id;
    }

    if (!proveedorId) {
      throw new ValidationError('La orden de compra aprobada no tiene proveedor asociado para crear la recepción');
    }

    const result = await this.recepcionRepository.create({
      proveedorId,
      solicitudCompraId: solicitud.id,
      fechaRecepcion: new Date(),
      estado: 'BORRADOR',
      observaciones: `Generada desde orden de compra ${solicitud.id}`,
      usuarioId,
      detalles: solicitud.detalles.map((detalle) => ({
        productoId: detalle.productoId,
        cantidad: detalle.cantidadAprobada ?? detalle.cantidadSolicitada,
        lote: undefined,
        fechaVencimiento: undefined,
      })),
    });
    await this.solicitudCompraRepository.update(solicitud.id, { estado: 'EN_RECEPCION' });

    return result as unknown as RecepcionResponseDTO;
  }
}

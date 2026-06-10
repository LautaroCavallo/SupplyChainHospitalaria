import { v4 as uuidv4 } from 'uuid';
import { ISolicitudCompraRepository } from '../../../domain/repositories/ISolicitudCompraRepository';
import { IComprasService } from '../../../domain/services/IComprasService';
import { SolicitudCompraResponseDTO } from '../../dtos';
import { NotFoundError, ValidationError } from '../../errors/AppError';

export class EnviarOrdenCompra {
  constructor(
    private readonly solicitudRepository: ISolicitudCompraRepository,
    private readonly comprasService: IComprasService,
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

    const payload = {
      ordenCompraId,
      solicitudCompraId: solicitudId,
      prioridad: solicitud.prioridad,
      proveedorSugerido,
      items,
      motivo: solicitud.motivo,
      fechaGeneracion: new Date().toISOString(),
      callbackUrl,
    };

    const resultado = await this.comprasService.enviarOrdenCompra(payload);

    if (!resultado.exitoso) {
      throw new ValidationError(`Error al enviar a Compras: ${resultado.errores.join(', ')}`);
    }

    // Actualizar solicitud a ENVIADA
    await this.solicitudRepository.update(solicitudId, {
      estado: 'ENVIADA',
      ordenCompraId,
      ordenCompraExternaId: resultado.ordenCompraExternaId,
    });

    // Si el mock devuelve autoCallback, procesar adjudicación inline
    if (resultado.autoCallback) {
      const cb = resultado.autoCallback;

      if (cb.aprobado) {
        const detallesUpdate = cb.itemsAdjudicados?.map((item) => ({
          productoId: item.productoId,
          cantidadAprobada: item.cantidadAprobada,
          precioUnitario: item.precioUnitario,
        }));

        await this.solicitudRepository.update(solicitudId, {
          estado: 'APROBADA',
          referenciaExterna: cb.referenciaExterna,
          proveedorAdjudicadoRazonSocial: cb.proveedorAdjudicado?.razonSocial,
          fechaAprobacion: cb.fechaAprobacion ? new Date(cb.fechaAprobacion) : new Date(),
          fechaEntregaEstimada: cb.fechaEntregaEstimada ? new Date(cb.fechaEntregaEstimada) : undefined,
          observaciones: cb.observaciones,
          detalles: detallesUpdate,
        });
      } else {
        await this.solicitudRepository.update(solicitudId, {
          estado: 'RECHAZADA',
          referenciaExterna: cb.referenciaExterna,
          observaciones: cb.observaciones,
        });
      }
    }

    const solicitudActualizada = await this.solicitudRepository.findById(solicitudId);
    return solicitudActualizada as unknown as SolicitudCompraResponseDTO;
  }
}

import { IDepositoRepository, TransferenciaData } from '../../../domain/repositories/IDepositoRepository';
import { ValidationError } from '../../errors/AppError';

export class TransferirStock {
  constructor(private readonly depositoRepository: IDepositoRepository) {}

  async execute(data: TransferenciaData): Promise<{ unidadesTransferidas: number }> {
    if (!data.productoId) throw new ValidationError('El producto es requerido');
    if (!data.depositoOrigenId || !data.depositoDestinoId) {
      throw new ValidationError('Depósito de origen y destino son requeridos');
    }
    if (data.depositoOrigenId === data.depositoDestinoId) {
      throw new ValidationError('El depósito de origen y destino no pueden ser el mismo');
    }
    if (!data.cantidad || data.cantidad <= 0) {
      throw new ValidationError('La cantidad a transferir debe ser mayor a cero');
    }

    try {
      const unidades = await this.depositoRepository.transferir(data);
      return { unidadesTransferidas: unidades };
    } catch (e) {
      throw new ValidationError((e as Error).message);
    }
  }
}

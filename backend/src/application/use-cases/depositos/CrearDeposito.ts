import { IDepositoRepository, CreateDepositoData } from '../../../domain/repositories/IDepositoRepository';
import { Deposito } from '../../../domain/entities/Deposito';
import { ValidationError } from '../../errors/AppError';

export class CrearDeposito {
  constructor(private readonly depositoRepository: IDepositoRepository) {}

  async execute(data: CreateDepositoData): Promise<Deposito> {
    if (!data.nombre || data.nombre.trim().length === 0) {
      throw new ValidationError('El nombre del depósito es requerido');
    }
    return this.depositoRepository.create({
      nombre: data.nombre.trim(),
      tipo: data.tipo ?? 'PISO',
      descripcion: data.descripcion,
    });
  }
}

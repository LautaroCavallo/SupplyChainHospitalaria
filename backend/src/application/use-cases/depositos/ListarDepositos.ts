import { IDepositoRepository } from '../../../domain/repositories/IDepositoRepository';
import { Deposito } from '../../../domain/entities/Deposito';

export class ListarDepositos {
  constructor(private readonly depositoRepository: IDepositoRepository) {}

  async execute(soloActivos = false): Promise<Deposito[]> {
    return this.depositoRepository.findAll(soloActivos);
  }
}

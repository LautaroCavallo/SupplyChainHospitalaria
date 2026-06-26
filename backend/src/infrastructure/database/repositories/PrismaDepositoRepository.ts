import prisma from '../prisma-client';
import {
  IDepositoRepository,
  CreateDepositoData,
  UpdateDepositoData,
  StockPorDeposito,
  TransferenciaData,
} from '../../../domain/repositories/IDepositoRepository';
import { Deposito } from '../../../domain/entities/Deposito';

export class PrismaDepositoRepository implements IDepositoRepository {
  private toEntity(raw: any): Deposito {
    return new Deposito(raw);
  }

  async findAll(soloActivos = false): Promise<Deposito[]> {
    const data = await prisma.deposito.findMany({
      where: soloActivos ? { activo: true } : {},
      orderBy: [{ tipo: 'asc' }, { nombre: 'asc' }],
    });
    return data.map(this.toEntity);
  }

  async findById(id: string): Promise<Deposito | null> {
    const data = await prisma.deposito.findUnique({ where: { id } });
    return data ? this.toEntity(data) : null;
  }

  async create(data: CreateDepositoData): Promise<Deposito> {
    const created = await prisma.deposito.create({ data });
    return this.toEntity(created);
  }

  async update(id: string, data: UpdateDepositoData): Promise<Deposito> {
    const updated = await prisma.deposito.update({ where: { id }, data });
    return this.toEntity(updated);
  }

  async stockPorProducto(productoId: string): Promise<StockPorDeposito[]> {
    const depositos = await prisma.deposito.findMany({ where: { activo: true } });
    const grupos = await prisma.lote.groupBy({
      by: ['depositoId'],
      where: { productoId, stockDisponible: { gt: 0 } },
      _sum: { stockDisponible: true },
    });

    const mapaStock = new Map(grupos.map((g) => [g.depositoId, g._sum.stockDisponible ?? 0]));

    return depositos
      .map((d) => ({
        depositoId: d.id,
        depositoNombre: d.nombre,
        depositoTipo: d.tipo as StockPorDeposito['depositoTipo'],
        stock: mapaStock.get(d.id) ?? 0,
      }))
      .filter((s) => s.stock > 0);
  }

  async transferir(data: TransferenciaData): Promise<number> {
    const { productoId, depositoOrigenId, depositoDestinoId, cantidad, usuarioId } = data;

    if (depositoOrigenId === depositoDestinoId) {
      throw new Error('El depósito de origen y destino no pueden ser el mismo');
    }
    if (cantidad <= 0) {
      throw new Error('La cantidad a transferir debe ser mayor a cero');
    }

    return prisma.$transaction(async (tx) => {
      const [origen, destino, producto] = await Promise.all([
        tx.deposito.findUnique({ where: { id: depositoOrigenId } }),
        tx.deposito.findUnique({ where: { id: depositoDestinoId } }),
        tx.productoInventario.findUnique({ where: { id: productoId } }),
      ]);
      if (!origen) throw new Error('Depósito de origen no encontrado');
      if (!destino) throw new Error('Depósito de destino no encontrado');
      if (!producto) throw new Error('Producto no encontrado');

      // Solo se transfieren lotes vigentes (no vencidos), igual que la dispensación
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const lotesOrigen = await tx.lote.findMany({
        where: {
          productoId,
          depositoId: depositoOrigenId,
          stockDisponible: { gt: 0 },
          fechaVencimiento: { gte: today },
        },
        orderBy: [{ fechaVencimiento: 'asc' }, { createdAt: 'asc' }],
      });

      const disponible = lotesOrigen.reduce((t, l) => t + l.stockDisponible, 0);
      if (disponible < cantidad) {
        throw new Error(`Stock vigente insuficiente en el depósito de origen. Disponible: ${disponible}, solicitado: ${cantidad}`);
      }

      let restante = cantidad;
      for (const lote of lotesOrigen) {
        if (restante <= 0) break;
        const mover = Math.min(restante, lote.stockDisponible);

        // Descontar del lote origen
        await tx.lote.update({
          where: { id: lote.id },
          data: { stockDisponible: { decrement: mover } },
        });

        // Incrementar / crear el lote equivalente en el destino (mismo número de lote)
        const loteDestino = await tx.lote.findUnique({
          where: {
            productoId_numeroLote_depositoId: {
              productoId,
              numeroLote: lote.numeroLote,
              depositoId: depositoDestinoId,
            },
          },
        });

        if (loteDestino) {
          await tx.lote.update({
            where: { id: loteDestino.id },
            data: {
              stockInicial: { increment: mover },
              stockDisponible: { increment: mover },
              fechaVencimiento: lote.fechaVencimiento,
              estado: 'VIGENTE',
            },
          });
        } else {
          await tx.lote.create({
            data: {
              productoId,
              numeroLote: lote.numeroLote,
              depositoId: depositoDestinoId,
              fechaVencimiento: lote.fechaVencimiento,
              stockInicial: mover,
              stockDisponible: mover,
              estado: 'VIGENTE',
            },
          });
        }

        // Movimiento de transferencia (no altera el stock global del producto)
        await tx.movimientoStock.create({
          data: {
            productoId,
            loteId: lote.id,
            depositoId: depositoOrigenId,
            depositoDestinoId,
            tipo: 'TRANSFERENCIA',
            cantidad: mover,
            motivo: `Transferencia ${origen.nombre} → ${destino.nombre} - Lote ${lote.numeroLote}`,
            usuarioId: usuarioId ?? null,
          },
        });

        restante -= mover;
      }

      return cantidad;
    });
  }
}

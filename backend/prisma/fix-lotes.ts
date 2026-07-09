import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const productosSinLotes = await prisma.productoInventario.findMany({
    where: {
      stockActual: { gt: 0 },
      lotes: { none: {} },
    },
    include: { lotes: true },
  });

  if (productosSinLotes.length === 0) {
    console.log('Todos los productos con stock ya tienen lotes asignados.');
    return;
  }

  let depositoCentral = await prisma.deposito.findFirst({
    where: { tipo: 'CENTRAL' },
  });

  if (!depositoCentral) {
    depositoCentral = await prisma.deposito.create({
      data: {
        nombre: 'Farmacia Central',
        tipo: 'CENTRAL',
        descripcion: 'Depósito central de la farmacia',
      },
    });
    console.log('Depósito central creado.');
  }

  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  console.log(`\nProductos con stock sin lotes: ${productosSinLotes.length}\n`);

  for (const producto of productosSinLotes) {
    const prefijo = producto.nombre
      .substring(0, 3)
      .toUpperCase()
      .replace(/\s/g, '');
    const numeroLote = `${prefijo}-2026-INIT`;

    const lote = await prisma.lote.create({
      data: {
        productoId: producto.id,
        depositoId: depositoCentral.id,
        numeroLote,
        fechaVencimiento: oneYearFromNow,
        stockDisponible: producto.stockActual,
        stockInicial: producto.stockActual,
        estado: 'VIGENTE',
      },
    });

    console.log(
      `  ✔ ${producto.nombre} → Lote "${lote.numeroLote}" (stock: ${producto.stockActual})`
    );
  }

  console.log('\nLotes creados exitosamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

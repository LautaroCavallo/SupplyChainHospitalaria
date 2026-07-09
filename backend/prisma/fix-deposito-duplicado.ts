import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const KEEP_ID = '00000000-0000-0000-0000-000000000001';
const DUPLICATE_ID = 'bc26356f-98d0-4c3f-8b22-ba8a4b6c5f5b';

async function main() {
  const lotesDelDuplicado = await prisma.lote.findMany({
    where: { depositoId: DUPLICATE_ID },
  });
  console.log(`Lotes en el depósito duplicado: ${lotesDelDuplicado.length}`);

  if (lotesDelDuplicado.length > 0) {
    await prisma.lote.updateMany({
      where: { depositoId: DUPLICATE_ID },
      data: { depositoId: KEEP_ID },
    });
    console.log(`Reasignados ${lotesDelDuplicado.length} lotes al depósito principal.`);
  }

  await prisma.movimientoStock.updateMany({
    where: { depositoId: DUPLICATE_ID },
    data: { depositoId: KEEP_ID },
  });
  await prisma.movimientoStock.updateMany({
    where: { depositoDestinoId: DUPLICATE_ID },
    data: { depositoDestinoId: KEEP_ID },
  });

  await prisma.deposito.delete({ where: { id: DUPLICATE_ID } });
  console.log('Depósito duplicado eliminado.');

  const depositos = await prisma.deposito.findMany();
  console.log('\nDepósitos restantes:');
  depositos.forEach((d) => console.log(`  - ${d.nombre} (${d.tipo}) [${d.id}]`));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

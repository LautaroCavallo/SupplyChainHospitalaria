import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const depositos = await p.deposito.findMany();
  console.log(JSON.stringify(depositos, null, 2));
}
main().finally(() => p.$disconnect());

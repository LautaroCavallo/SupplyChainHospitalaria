import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// IDs reales de la BD
const P = {
  omeprazol: '062df701-5f87-41ae-ba7d-29a90a3968f9',
  insulina: '15ce449c-6960-4d9d-9d99-a852d4e85087',
  propofol: '1a63058d-0ec1-407d-9b2b-497abc8527a9',
  guantes: '21cf4438-d935-4726-8d03-fd232ea76e71',
  paracetamol: '3c062958-6757-4a76-b750-5ac2774075a8',
  dexametasona: '72c55cec-c259-40ea-ab30-e9a92ffe251d',
  amoxicilina: '74b16913-3e56-4b28-848e-1e6f8a980384',
  ibuprofeno: 'b54b1211-3100-44a4-8f1b-259344b03b63',
  jeringa: 'cc3b1802-db9e-4625-b7a7-44aaf9198d71',
  diclofenac: 'fcee9406-8c1b-4215-927f-a24c670af7e2',
};

const PROV = {
  biomed: '020b5730-a0b9-4ef3-8121-65c03f4f41f5',
  drogueriaSur: 'a6939301-cff5-4740-9956-28de0a4fa51c',
  pharmaPlus: '662e9c2e-fd90-4201-96e9-47076645a8dc',
  alfa: 'bc614c0d-2ccb-45f2-b237-08ab9d01703e',
};

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function daysFromNow(n: number): Date {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

async function main() {
  const solicitudes = [
    {
      estado: 'PENDIENTE',
      prioridad: 'URGENTE',
      motivo: 'Quiebre de stock de antibióticos en guardia',
      createdAt: daysAgo(1),
      detalles: [
        { productoId: P.amoxicilina, cantidadSolicitada: 500, unidad: 'unidad', precioUnitario: 12.5 },
        { productoId: P.diclofenac, cantidadSolicitada: 200, unidad: 'unidad', precioUnitario: 8.0 },
      ],
    },
    {
      estado: 'PENDIENTE',
      prioridad: 'NORMAL',
      motivo: 'Reposición mensual de descartables',
      createdAt: daysAgo(3),
      detalles: [
        { productoId: P.guantes, cantidadSolicitada: 300, unidad: 'caja', precioUnitario: 45.0 },
        { productoId: P.jeringa, cantidadSolicitada: 1000, unidad: 'unidad', precioUnitario: 3.2 },
      ],
    },
    {
      estado: 'APROBADA',
      prioridad: 'ALTA',
      motivo: 'Reposición de insulina por aumento de demanda',
      createdAt: daysAgo(7),
      fechaAprobacion: daysAgo(5),
      fechaEntregaEstimada: daysFromNow(3),
      proveedorSugeridoId: PROV.drogueriaSur,
      detalles: [
        { productoId: P.insulina, cantidadSolicitada: 100, cantidadAprobada: 80, unidad: 'unidad', precioUnitario: 320.0 },
      ],
    },
    {
      estado: 'APROBADA',
      prioridad: 'NORMAL',
      motivo: 'Compra programada de analgésicos',
      createdAt: daysAgo(10),
      fechaAprobacion: daysAgo(8),
      fechaEntregaEstimada: daysFromNow(5),
      proveedorSugeridoId: PROV.alfa,
      detalles: [
        { productoId: P.paracetamol, cantidadSolicitada: 800, cantidadAprobada: 800, unidad: 'unidad', precioUnitario: 5.5 },
        { productoId: P.ibuprofeno, cantidadSolicitada: 600, cantidadAprobada: 500, unidad: 'unidad', precioUnitario: 7.8 },
      ],
    },
    {
      estado: 'ENVIADA',
      prioridad: 'URGENTE',
      motivo: 'Stock crítico de anestésico para quirófano',
      createdAt: daysAgo(14),
      fechaAprobacion: daysAgo(12),
      fechaEntregaEstimada: daysAgo(2),
      proveedorSugeridoId: PROV.biomed,
      proveedorAdjudicadoRazonSocial: 'BioMed S.A.',
      ordenCompraExternaId: 'OC-2026-00123',
      referenciaExterna: 'REQ-9981',
      detalles: [
        { productoId: P.propofol, cantidadSolicitada: 50, cantidadAprobada: 50, unidad: 'unidad', precioUnitario: 180.0 },
      ],
    },
    {
      estado: 'ENVIADA',
      prioridad: 'NORMAL',
      motivo: 'Reposición de gastroprotectores',
      createdAt: daysAgo(20),
      fechaAprobacion: daysAgo(18),
      fechaEntregaEstimada: daysAgo(5),
      proveedorSugeridoId: PROV.drogueriaSur,
      proveedorAdjudicadoRazonSocial: 'Droguería Sur S.A.',
      ordenCompraExternaId: 'OC-2026-00118',
      detalles: [
        { productoId: P.omeprazol, cantidadSolicitada: 400, cantidadAprobada: 400, unidad: 'unidad', precioUnitario: 9.9 },
      ],
    },
    {
      estado: 'RECHAZADA',
      prioridad: 'NORMAL',
      motivo: 'Solicitud duplicada de corticoides',
      observaciones: 'Rechazada por duplicación con OC-2026-00100',
      createdAt: daysAgo(25),
      detalles: [
        { productoId: P.dexametasona, cantidadSolicitada: 150, unidad: 'unidad', precioUnitario: 6.4 },
      ],
    },
  ];

  for (const s of solicitudes) {
    const { detalles, ...data } = s;
    await prisma.solicitudCompra.create({
      data: {
        ...data,
        detalles: { create: detalles },
      },
    });
  }

  console.log(`Seed completado: ${solicitudes.length} solicitudes de compra creadas`);
  const counts = await prisma.solicitudCompra.groupBy({
    by: ['estado'],
    _count: true,
  });
  console.log('Totales por estado:', counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const proveedores = await Promise.all([
    prisma.proveedor.create({
      data: {
        razonSocial: 'Droguería Sur S.A.',
        cuit: '30-71234567-0',
        direccion: 'Av. San Martín 1234, CABA',
        telefono: '011-4555-1234',
        email: 'ventas@drogueriasur.com.ar',
        contacto: 'Carlos Méndez',
      },
    }),
    prisma.proveedor.create({
      data: {
        razonSocial: 'Farmacéutica Alfa S.R.L.',
        cuit: '30-65432109-8',
        direccion: 'Calle Córdoba 567, Rosario',
        telefono: '0341-422-5678',
        email: 'pedidos@farmalfa.com.ar',
        contacto: 'María López',
      },
    }),
    prisma.proveedor.create({
      data: {
        razonSocial: 'BioMed S.A.',
        cuit: '30-78901234-5',
        direccion: 'Ruta 9 Km 312, Córdoba',
        telefono: '0351-489-3456',
        email: 'info@biomed.com.ar',
        contacto: 'Roberto Fernández',
      },
    }),
    prisma.proveedor.create({
      data: {
        razonSocial: 'Laboratorios PharmaPlus',
        cuit: '30-69876543-2',
        direccion: 'Av. Libertador 8901, CABA',
        telefono: '011-4788-9012',
        email: 'comercial@pharmaplus.com.ar',
        contacto: 'Ana García',
      },
    }),
  ]);

  const productos = await Promise.all([
    prisma.productoInventario.create({
      data: {
        nombre: 'Amoxicilina 500mg',
        descripcion: 'Antibiótico de amplio espectro',
        principioActivo: 'Amoxicilina',
        presentacion: 'Cápsulas x 16',
        categoria: 'MEDICAMENTO',
        ean: '7791234567890',
        troquel: '12345-6',
        stockActual: 1420,
        stockMinimo: 200,
        stockCritico: 50,
        unidad: 'unidad',
        proveedorId: proveedores[3].id,
      },
    }),
    prisma.productoInventario.create({
      data: {
        nombre: 'Insulina Glargina 100 UI',
        descripcion: 'Insulina de acción prolongada',
        principioActivo: 'Insulina Glargina',
        presentacion: 'Inyectable',
        categoria: 'MEDICAMENTO',
        ean: '7799876543210',
        troquel: '98765-4',
        stockActual: 24,
        stockMinimo: 50,
        stockCritico: 15,
        unidad: 'unidad',
        proveedorId: proveedores[0].id,
      },
    }),
    prisma.productoInventario.create({
      data: {
        nombre: 'Propofol 1% 20ml',
        descripcion: 'Anestésico intravenoso',
        principioActivo: 'Propofol',
        presentacion: 'Ampollas',
        categoria: 'MEDICAMENTO',
        ean: '7794561237894',
        troquel: '45612-3',
        stockActual: 0,
        stockMinimo: 30,
        stockCritico: 10,
        unidad: 'unidad',
        proveedorId: proveedores[1].id,
      },
    }),
    prisma.productoInventario.create({
      data: {
        nombre: 'Ibuprofeno 400mg',
        descripcion: 'Analgésico y antiinflamatorio',
        principioActivo: 'Ibuprofeno',
        presentacion: 'Blíster x 10',
        categoria: 'MEDICAMENTO',
        ean: '7793216549870',
        troquel: '32165-9',
        stockActual: 4500,
        stockMinimo: 500,
        stockCritico: 100,
        unidad: 'unidad',
        proveedorId: proveedores[2].id,
      },
    }),
    prisma.productoInventario.create({
      data: {
        nombre: 'Dexametasona 4mg',
        descripcion: 'Corticoide antiinflamatorio',
        principioActivo: 'Dexametasona',
        presentacion: 'Comprimidos x 20',
        categoria: 'MEDICAMENTO',
        ean: '7796549873215',
        troquel: '65498-7',
        stockActual: 620,
        stockMinimo: 100,
        stockCritico: 25,
        unidad: 'unidad',
        proveedorId: proveedores[3].id,
      },
    }),
    prisma.productoInventario.create({
      data: {
        nombre: 'Omeprazol 20mg',
        descripcion: 'Inhibidor de la bomba de protones',
        principioActivo: 'Omeprazol',
        presentacion: 'Cápsulas x 28',
        categoria: 'MEDICAMENTO',
        ean: '7791112223334',
        troquel: '11122-3',
        stockActual: 890,
        stockMinimo: 200,
        stockCritico: 50,
        unidad: 'unidad',
        proveedorId: proveedores[0].id,
      },
    }),
    prisma.productoInventario.create({
      data: {
        nombre: 'Paracetamol 500mg',
        descripcion: 'Analgésico y antipirético',
        principioActivo: 'Paracetamol',
        presentacion: 'Comprimidos x 20',
        categoria: 'MEDICAMENTO',
        ean: '7792223334445',
        troquel: '22233-4',
        stockActual: 3200,
        stockMinimo: 500,
        stockCritico: 100,
        unidad: 'unidad',
        proveedorId: proveedores[1].id,
      },
    }),
    prisma.productoInventario.create({
      data: {
        nombre: 'Guantes Latex Talle M',
        descripcion: 'Guantes descartables de látex',
        principioActivo: null,
        presentacion: 'Caja x 100',
        categoria: 'DESCARTABLE',
        ean: '7798887776665',
        troquel: null,
        stockActual: 45,
        stockMinimo: 100,
        stockCritico: 30,
        unidad: 'caja',
        proveedorId: proveedores[2].id,
      },
    }),
    prisma.productoInventario.create({
      data: {
        nombre: 'Jeringa 5ml c/aguja',
        descripcion: 'Jeringa descartable con aguja 21G',
        principioActivo: null,
        presentacion: 'Unidad',
        categoria: 'DESCARTABLE',
        ean: '7795556667778',
        troquel: null,
        stockActual: 8,
        stockMinimo: 500,
        stockCritico: 100,
        unidad: 'unidad',
        proveedorId: proveedores[0].id,
      },
    }),
    prisma.productoInventario.create({
      data: {
        nombre: 'Diclofenac 75mg',
        descripcion: 'Antiinflamatorio no esteroideo',
        principioActivo: 'Diclofenac',
        presentacion: 'Comprimidos x 20',
        categoria: 'MEDICAMENTO',
        ean: '7793334445556',
        troquel: '33344-5',
        stockActual: 150,
        stockMinimo: 200,
        stockCritico: 50,
        unidad: 'unidad',
        proveedorId: proveedores[3].id,
      },
    }),
  ]);

  const now = new Date();
  const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  await Promise.all([
    prisma.lote.create({
      data: {
        productoId: productos[0].id,
        numeroLote: '2405A',
        fechaVencimiento: new Date('2026-12-31'),
        stockDisponible: 800,
        stockInicial: 1000,
        estado: 'VIGENTE',
      },
    }),
    prisma.lote.create({
      data: {
        productoId: productos[0].id,
        numeroLote: '2311B',
        fechaVencimiento: new Date('2024-08-15'),
        stockDisponible: 620,
        stockInicial: 800,
        estado: 'PROXIMO_A_VENCER',
      },
    }),
    prisma.lote.create({
      data: {
        productoId: productos[0].id,
        numeroLote: '2209C',
        fechaVencimiento: new Date('2023-12-31'),
        stockDisponible: 0,
        stockInicial: 500,
        estado: 'VENCIDO',
      },
    }),
    prisma.lote.create({
      data: {
        productoId: productos[1].id,
        numeroLote: 'INS-2024-001',
        fechaVencimiento: threeMonthsFromNow,
        stockDisponible: 24,
        stockInicial: 50,
        estado: 'PROXIMO_A_VENCER',
      },
    }),
    prisma.lote.create({
      data: {
        productoId: productos[3].id,
        numeroLote: 'IBU-2025-A',
        fechaVencimiento: oneYearFromNow,
        stockDisponible: 4500,
        stockInicial: 5000,
        estado: 'VIGENTE',
      },
    }),
    prisma.lote.create({
      data: {
        productoId: productos[4].id,
        numeroLote: 'DEX-2025-01',
        fechaVencimiento: oneYearFromNow,
        stockDisponible: 620,
        stockInicial: 700,
        estado: 'VIGENTE',
      },
    }),
  ]);

  const recepcion1 = await prisma.recepcion.create({
    data: {
      proveedorId: proveedores[0].id,
      remito: '0001-00045678',
      fechaRecepcion: new Date('2026-05-15'),
      estado: 'PROCESADA',
      totalItems: 45,
      detalles: {
        create: [
          {
            productoId: productos[0].id,
            cantidad: 24,
            ean: '7791234567890',
            troquel: '12345-6',
            lote: 'LOT-998',
            fechaVencimiento: new Date('2025-12-31'),
          },
          {
            productoId: productos[3].id,
            cantidad: 21,
            ean: '7793216549870',
            troquel: '32165-9',
            lote: 'IBU-2025-B',
            fechaVencimiento: new Date('2026-06-30'),
          },
        ],
      },
    },
  });

  const recepcion2 = await prisma.recepcion.create({
    data: {
      proveedorId: proveedores[1].id,
      remito: '0002-00012345',
      fechaRecepcion: new Date('2026-05-16'),
      estado: 'CONFIRMADA',
      totalItems: 12,
      detalles: {
        create: [
          {
            productoId: productos[1].id,
            cantidad: 12,
            ean: '7799876543210',
            troquel: '98765-4',
            lote: 'INS-2024-002',
            fechaVencimiento: new Date('2027-01-15'),
          },
        ],
      },
    },
  });

  await prisma.recepcion.create({
    data: {
      proveedorId: proveedores[2].id,
      fechaRecepcion: new Date('2026-05-17'),
      estado: 'BORRADOR',
      totalItems: 8,
      detalles: {
        create: [
          {
            productoId: productos[2].id,
            cantidad: 8,
            ean: '7794561237894',
            troquel: '45612-3',
            lote: 'PRO-2025-01',
            fechaVencimiento: new Date('2026-11-30'),
          },
        ],
      },
    },
  });

  await Promise.all([
    prisma.movimientoStock.create({
      data: {
        productoId: productos[0].id,
        tipo: 'INGRESO',
        cantidad: 500,
        motivo: 'Recepción inicial de stock',
        referencia: recepcion1.id,
      },
    }),
    prisma.movimientoStock.create({
      data: {
        productoId: productos[0].id,
        tipo: 'EGRESO',
        cantidad: 80,
        motivo: 'Dispensación a piso 3',
        referencia: 'DISP-001',
      },
    }),
    prisma.movimientoStock.create({
      data: {
        productoId: productos[1].id,
        tipo: 'INGRESO',
        cantidad: 50,
        motivo: 'Recepción de proveedor',
        referencia: recepcion2.id,
      },
    }),
    prisma.movimientoStock.create({
      data: {
        productoId: productos[1].id,
        tipo: 'CONSUMO_RECETA',
        cantidad: 26,
        motivo: 'Consumo por receta médica',
        referencia: 'REC-2024-001',
      },
    }),
    prisma.movimientoStock.create({
      data: {
        productoId: productos[3].id,
        tipo: 'AJUSTE_POSITIVO',
        cantidad: 100,
        motivo: 'Ajuste por auditoría',
      },
    }),
  ]);

  await prisma.solicitudCompra.create({
    data: {
      estado: 'PENDIENTE',
      prioridad: 'URGENTE',
      motivo: 'Stock crítico de Propofol - sin existencias',
      detalles: {
        create: [
          {
            productoId: productos[2].id,
            cantidadSolicitada: 50,
          },
          {
            productoId: productos[8].id,
            cantidadSolicitada: 1000,
          },
        ],
      },
    },
  });

  console.log('Seed completed successfully');
  console.log(`Created ${proveedores.length} proveedores`);
  console.log(`Created ${productos.length} productos`);
  console.log('Created lotes, recepciones, movimientos, and solicitudes');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

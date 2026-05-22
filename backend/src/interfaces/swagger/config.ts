import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Health Grid - Farmacia e Insumos Hospitalarios API',
      version: '1.0.0',
      description: 'API del módulo de Farmacia e Insumos Hospitalarios para el sistema Health Grid. Gestión de inventario, recepciones, recetas, vademécum y solicitudes de compra.',
      contact: {
        name: 'Health Grid',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'API v1',
      },
    ],
    tags: [
      { name: 'Vademecum', description: 'Consulta de medicamentos del vademécum Alfabeta' },
      { name: 'Proveedores', description: 'Gestión de proveedores farmacéuticos' },
      { name: 'Inventario', description: 'Gestión de inventario de productos farmacéuticos' },
      { name: 'Recepciones', description: 'Recepción de mercadería de proveedores' },
      { name: 'Alertas', description: 'Alertas de stock crítico y vencimientos' },
      { name: 'Solicitudes de Compra', description: 'Solicitudes de compra de insumos' },
      { name: 'Recetas', description: 'Validación y dispensación de recetas médicas' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Proveedor: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            razonSocial: { type: 'string' },
            cuit: { type: 'string', example: '30-71234567-8' },
            direccion: { type: 'string', nullable: true },
            telefono: { type: 'string', nullable: true },
            email: { type: 'string', format: 'email', nullable: true },
            contacto: { type: 'string', nullable: true },
            activo: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ProductoInventario: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nombre: { type: 'string' },
            descripcion: { type: 'string', nullable: true },
            principioActivo: { type: 'string', nullable: true },
            presentacion: { type: 'string', nullable: true },
            categoria: { type: 'string' },
            ean: { type: 'string', nullable: true },
            troquel: { type: 'string', nullable: true },
            stockActual: { type: 'integer' },
            stockMinimo: { type: 'integer' },
            stockCritico: { type: 'integer' },
            unidad: { type: 'string' },
            proveedorId: { type: 'string', format: 'uuid', nullable: true },
            activo: { type: 'boolean' },
            proveedor: { $ref: '#/components/schemas/Proveedor' },
          },
        },
        Lote: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            numeroLote: { type: 'string' },
            productoId: { type: 'string', format: 'uuid' },
            fechaVencimiento: { type: 'string', format: 'date-time' },
            stockDisponible: { type: 'integer' },
            stockInicial: { type: 'integer' },
            estado: { type: 'string', enum: ['VIGENTE', 'VENCIDO', 'AGOTADO'] },
          },
        },
        MovimientoStock: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            productoId: { type: 'string', format: 'uuid' },
            loteId: { type: 'string', format: 'uuid', nullable: true },
            tipo: { type: 'string', enum: ['ENTRADA', 'SALIDA', 'AJUSTE'] },
            cantidad: { type: 'integer' },
            motivo: { type: 'string' },
            referencia: { type: 'string', nullable: true },
            usuarioId: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Recepcion: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            proveedorId: { type: 'string', format: 'uuid' },
            remito: { type: 'string', nullable: true },
            fechaRecepcion: { type: 'string', format: 'date-time' },
            estado: { type: 'string', enum: ['BORRADOR', 'CONFIRMADA', 'PROCESADA', 'ANULADA'] },
            observaciones: { type: 'string', nullable: true },
            totalItems: { type: 'integer' },
            proveedor: { $ref: '#/components/schemas/Proveedor' },
            detalles: {
              type: 'array',
              items: { $ref: '#/components/schemas/RecepcionDetalle' },
            },
          },
        },
        RecepcionDetalle: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            recepcionId: { type: 'string', format: 'uuid' },
            productoId: { type: 'string', format: 'uuid' },
            cantidad: { type: 'integer' },
            ean: { type: 'string', nullable: true },
            troquel: { type: 'string', nullable: true },
            lote: { type: 'string' },
            fechaVencimiento: { type: 'string', format: 'date-time' },
          },
        },
        SolicitudCompra: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            estado: { type: 'string', enum: ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'ENVIADA'] },
            prioridad: { type: 'string', enum: ['BAJA', 'NORMAL', 'ALTA', 'URGENTE'] },
            motivo: { type: 'string', nullable: true },
            detalles: {
              type: 'array',
              items: { $ref: '#/components/schemas/SolicitudCompraDetalle' },
            },
          },
        },
        SolicitudCompraDetalle: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            solicitudId: { type: 'string', format: 'uuid' },
            productoId: { type: 'string', format: 'uuid' },
            cantidadSolicitada: { type: 'integer' },
            cantidadAprobada: { type: 'integer', nullable: true },
          },
        },
        MedicamentoVademecum: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nombre: { type: 'string' },
            principioActivo: { type: 'string' },
            presentacion: { type: 'string' },
            laboratorio: { type: 'string' },
            categoria: { type: 'string' },
            ean: { type: 'string' },
            troquel: { type: 'string' },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'array', items: {} },
            total: { type: 'integer' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
            details: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);

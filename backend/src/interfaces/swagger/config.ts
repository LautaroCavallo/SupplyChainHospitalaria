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
            estado: { type: 'string', enum: ['VIGENTE', 'PROXIMO_A_VENCER', 'VENCIDO', 'AGOTADO'] },
          },
        },
        MovimientoStock: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            productoId: { type: 'string', format: 'uuid' },
            loteId: { type: 'string', format: 'uuid', nullable: true },
            tipo: { type: 'string', enum: ['INGRESO', 'EGRESO', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO', 'CONSUMO_RECETA'] },
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
        Medicamento: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nombre: { type: 'string' },
            categoria: { type: 'string', example: 'Antibióticos' },
            presentacion: { type: 'string', nullable: true },
            ean: { type: 'string', nullable: true },
            laboratorio: { type: 'string', nullable: true },
            estado: { type: 'string', enum: ['ACTIVO', 'INACTIVO', 'SUSPENDIDO'] },
            precio: { type: 'number', nullable: true },
            observaciones: { type: 'string', nullable: true },
          },
        },
        MedicamentoRequest: {
          type: 'object',
          properties: {
            nombre: { type: 'string' },
            categoria: { type: 'string' },
            presentacion: { type: 'string', nullable: true },
            ean: { type: 'string', nullable: true },
            laboratorio: { type: 'string', nullable: true },
            estado: { type: 'string', enum: ['ACTIVO', 'INACTIVO', 'SUSPENDIDO'] },
            precio: { type: 'number', nullable: true },
            observaciones: { type: 'string', nullable: true },
          },
          required: ['nombre'],
        },
        MedicamentosSummary: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            activos: { type: 'integer' },
            inactivos: { type: 'integer' },
          },
        },
        InventarioSummary: {
          type: 'object',
          properties: {
            totalProductos: { type: 'integer' },
            alertaBajoStock: { type: 'integer' },
            sinStock: { type: 'integer' },
          },
        },
        MovimientoLote: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            loteId: { type: 'string', format: 'uuid', nullable: true },
            productoId: { type: 'string', format: 'uuid' },
            tipo: { type: 'string', enum: ['INGRESO', 'EGRESO', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO', 'CONSUMO_RECETA'] },
            cantidad: { type: 'integer' },
            motivo: { type: 'string', nullable: true },
            responsable: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        RecetaItem: {
          type: 'object',
          properties: {
            productoId: { type: 'string' },
            nombre: { type: 'string' },
            medicamento: { type: 'string', nullable: true },
            cantidad: { type: 'integer' },
            indicaciones: { type: 'string', nullable: true },
          },
        },
        RecetaValidacion: {
          type: 'object',
          properties: {
            recetaId: { type: 'string' },
            valida: { type: 'boolean' },
            pacienteId: { type: 'string' },
            pacienteNombre: { type: 'string' },
            medicoId: { type: 'string' },
            medicoNombre: { type: 'string' },
            items: { type: 'array', items: { $ref: '#/components/schemas/RecetaItem' } },
            errores: { type: 'array', items: { type: 'string' } },
            consumida: { type: 'boolean' },
            estado: { type: 'string', enum: ['Activa', 'Consumida', 'Vencida'] },
          },
        },
        RecetaConsumoItem: {
          type: 'object',
          properties: {
            productoId: { type: 'string' },
            medicamento: { type: 'string', nullable: true },
            loteId: { type: 'string', nullable: true },
            cantidad: { type: 'integer' },
            cantConsumo: { type: 'integer', nullable: true },
          },
        },
        RecetaConsumoRequest: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/RecetaConsumoItem' },
            },
          },
          required: ['items'],
        },
        RecetaConsumoResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
          },
        },
      },
    },
    paths: {
      '/dashboard': {
        get: {
          tags: ['Dashboard'],
          summary: 'Resumen operativo del módulo de farmacia',
          responses: {
            '200': {
              description: 'Resumen de actividad, recetas y stock crítico',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          recetasValidadas: { type: 'integer' },
                          medicamentosCriticos: { type: 'integer' },
                          actividadReciente: { type: 'integer' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/dashboard/actividad-reciente': {
        get: {
          tags: ['Dashboard'],
          summary: 'Actividad reciente basada en movimientos de stock',
          parameters: [
            { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } },
            { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100 } },
            { name: 'busqueda', in: 'query', required: false, schema: { type: 'string' } },
            { name: 'usuario', in: 'query', required: false, schema: { type: 'string' } },
            { name: 'evento', in: 'query', required: false, schema: { type: 'string', enum: ['receta_validada', 'stock_ajustado', 'nueva_recepcion', 'validacion_rechazada', 'otro'] } },
            { name: 'desde', in: 'query', required: false, schema: { type: 'string', format: 'date' } },
            { name: 'hasta', in: 'query', required: false, schema: { type: 'string', format: 'date' } },
          ],
          responses: {
            '200': { description: 'Actividad reciente paginada' },
          },
        },
      },
      '/medicamentos': {
        get: {
          tags: ['Inventario'],
          summary: 'Listar medicamentos del inventario',
          parameters: [
            { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } },
            { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100 } },
            { name: 'busqueda', in: 'query', required: false, schema: { type: 'string' } },
            { name: 'categoria', in: 'query', required: false, schema: { type: 'string' } },
            { name: 'estado', in: 'query', required: false, schema: { type: 'string', enum: ['ACTIVO', 'INACTIVO', 'SUSPENDIDO'] } },
          ],
          responses: {
            '200': {
              description: 'Listado paginado de medicamentos',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'array', items: { $ref: '#/components/schemas/Medicamento' } },
                      total: { type: 'integer' },
                      page: { type: 'integer' },
                      limit: { type: 'integer' },
                      totalPages: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Inventario'],
          summary: 'Crear medicamento en inventario',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/MedicamentoRequest' } } },
          },
          responses: {
            '201': {
              description: 'Medicamento creado',
              content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Medicamento' } } } } },
            },
            '400': { description: 'Solicitud inválida', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/medicamentos/summary': {
        get: {
          tags: ['Inventario'],
          summary: 'Resumen de medicamentos',
          responses: {
            '200': {
              description: 'Resumen de medicamentos',
              content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/MedicamentosSummary' } } } } },
            },
          },
        },
      },
      '/medicamentos/{id}': {
        put: {
          tags: ['Inventario'],
          summary: 'Actualizar medicamento',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/MedicamentoRequest' } } },
          },
          responses: {
            '200': { description: 'Medicamento actualizado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Medicamento' } } } } } },
            '400': { description: 'Solicitud inválida', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '404': { description: 'Medicamento no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Inventario'],
          summary: 'Desactivar medicamento',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            '204': { description: 'Medicamento desactivado' },
            '404': { description: 'Medicamento no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/inventario/summary': {
        get: {
          tags: ['Inventario'],
          summary: 'Resumen de inventario',
          responses: {
            '200': {
              description: 'Resumen de productos y alertas de stock',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: '#/components/schemas/InventarioSummary' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/inventario/{id}/lotes/{loteId}/historial': {
        get: {
          tags: ['Inventario'],
          summary: 'Historial de movimientos de un lote',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
            { name: 'loteId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
            { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } },
            { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100 } },
            { name: 'tipo', in: 'query', required: false, schema: { type: 'string', enum: ['INGRESO', 'EGRESO', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO', 'CONSUMO_RECETA', 'SALIDAS'] } },
            { name: 'fechaDesde', in: 'query', required: false, schema: { type: 'string', format: 'date' } },
            { name: 'fechaHasta', in: 'query', required: false, schema: { type: 'string', format: 'date' } },
          ],
          responses: {
            '200': {
              description: 'Historial paginado del lote',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'array', items: { $ref: '#/components/schemas/MovimientoLote' } },
                      total: { type: 'integer' },
                      page: { type: 'integer' },
                      limit: { type: 'integer' },
                      totalPages: { type: 'integer' },
                    },
                  },
                },
              },
            },
            '400': { description: 'Solicitud inválida', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/recetas/{id}/validar': {
        post: {
          tags: ['Recetas'],
          summary: 'Validar una receta médica',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Identificador de la receta a validar',
            },
          ],
          requestBody: {
            description: 'No requiere body, solo el ID de receta en la ruta',
            required: false,
          },
          responses: {
            '200': {
              description: 'Receta validada correctamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/RecetaValidacion' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Solicitud inválida o datos de receta incorrectos',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '404': {
              description: 'Receta no encontrada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/recetas/{id}/consumir': {
        post: {
          tags: ['Recetas'],
          summary: 'Consumir una receta médica y generar el movimiento de stock',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Identificador de la receta a consumir',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RecetaConsumoRequest' },
                example: {
                  items: [
                    { medicamento: 'Amoxicilina 500mg', cantConsumo: 2 },
                  ],
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Receta consumida exitosamente',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/RecetaConsumoResponse' },
                },
              },
            },
            '400': {
              description: 'Solicitud inválida o validación de receta fallida',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '404': {
              description: 'Receta no encontrada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);

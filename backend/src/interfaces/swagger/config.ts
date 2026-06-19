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
      { name: 'Auth', description: 'Autenticación de usuarios' },
      { name: 'Dashboard', description: 'Indicadores operativos y actividad reciente' },
      { name: 'Medicamentos', description: 'ABM de medicamentos' },
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
            solicitudCompraId: { type: 'string', format: 'uuid', nullable: true, description: 'Orden de compra aprobada que originó la recepción' },
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
            lote: { type: 'string', nullable: true },
            fechaVencimiento: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        SolicitudCompra: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            estado: { type: 'string', enum: ['BORRADOR', 'PENDIENTE', 'ENVIADA', 'APROBADA', 'EN_RECEPCION', 'RECHAZADA'] },
            prioridad: { type: 'string', enum: ['BAJA', 'NORMAL', 'ALTA', 'URGENTE'] },
            motivo: { type: 'string', nullable: true },
            observaciones: { type: 'string', nullable: true },
            ordenCompraId: { type: 'string', format: 'uuid', nullable: true, description: 'UUID generado al enviar la OC a Compras' },
            ordenCompraExternaId: { type: 'string', nullable: true, description: 'ID devuelto por el módulo de Compras al recibir la OC' },
            referenciaExterna: { type: 'string', nullable: true, description: 'Referencia final de adjudicación' },
            proveedorSugeridoId: { type: 'string', format: 'uuid', nullable: true },
            proveedorAdjudicadoRazonSocial: { type: 'string', nullable: true, description: 'Proveedor seleccionado por Compras tras la licitación' },
            fechaAprobacion: { type: 'string', format: 'date-time', nullable: true },
            fechaEntregaEstimada: { type: 'string', format: 'date-time', nullable: true, description: 'Estimada por Compras. Mock: now + 10 días' },
            createdAt: { type: 'string', format: 'date-time' },
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
            cantidadAprobada: { type: 'integer', nullable: true, description: 'Completado por Compras en la adjudicación' },
            precioUnitario: { type: 'number', format: 'float', nullable: true, description: 'Precio unitario devuelto por Compras. Null hasta que se adjudique. En modo mock se calcula de forma determinística con múltiplos de 1000.' },
            unidad: { type: 'string', default: 'unidad' },
          },
        },
        ConfirmacionAdjudicacionRequest: {
          type: 'object',
          required: ['aprobado'],
          properties: {
            aprobado: { type: 'boolean', description: 'true = adjudicada, false = rechazada' },
            referenciaExterna: { type: 'string', example: 'OC-COMPRAS-123' },
            proveedorAdjudicado: {
              type: 'object',
              nullable: true,
              properties: { razonSocial: { type: 'string' } },
            },
            itemsAdjudicados: {
              type: 'array',
              nullable: true,
              items: {
                type: 'object',
                properties: {
                  productoId: { type: 'string', format: 'uuid' },
                  cantidadAprobada: { type: 'integer' },
                  precioUnitario: { type: 'number', format: 'float', example: 7000 },
                },
              },
            },
            fechaAprobacion: { type: 'string', format: 'date-time', nullable: true },
            fechaEntregaEstimada: { type: 'string', format: 'date-time', nullable: true, description: 'Default mock: now + 10 días' },
            observaciones: { type: 'string' },
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
            estado: { type: 'string', enum: ['ACTIVO', 'INACTIVO'] },
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
            estado: { type: 'string', enum: ['ACTIVO', 'INACTIVO'] },
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
        AuthLoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@healthgrid.local' },
            password: { type: 'string', format: 'password', example: 'admin123' },
          },
        },
        AuthLoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    nombre: { type: 'string' },
                    rol: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    paths: {
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Iniciar sesión',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthLoginRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Login exitoso',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthLoginResponse' } } },
            },
            '400': { description: 'Credenciales inválidas o request mal formado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '401': { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/vademecum/search': {
        get: {
          tags: ['Vademecum'],
          summary: 'Buscar medicamentos en el vademécum',
          security: [],
          parameters: [
            { name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 2 }, description: 'Texto de búsqueda por nombre, principio activo, EAN o troquel' },
          ],
          responses: {
            '200': {
              description: 'Resultados de búsqueda',
              content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/MedicamentoVademecum' } } } } } },
            },
            '400': { description: 'Parámetros inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/vademecum/{id}': {
        get: {
          tags: ['Vademecum'],
          summary: 'Obtener medicamento del vademécum por ID',
          security: [],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': {
              description: 'Medicamento encontrado',
              content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/MedicamentoVademecum' } } } } },
            },
            '404': { description: 'Medicamento no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
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
          tags: ['Medicamentos'],
          summary: 'Listar medicamentos del inventario',
          parameters: [
            { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } },
            { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100 } },
            { name: 'busqueda', in: 'query', required: false, schema: { type: 'string' } },
            { name: 'categoria', in: 'query', required: false, schema: { type: 'string' } },
            { name: 'estado', in: 'query', required: false, description: 'Sin valor devuelve activos e inactivos. ACTIVO = solo activos. INACTIVO = solo inactivos.', schema: { type: 'string', enum: ['ACTIVO', 'INACTIVO'] } },
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
          tags: ['Medicamentos'],
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
          tags: ['Medicamentos'],
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
          tags: ['Medicamentos'],
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
          tags: ['Medicamentos'],
          summary: 'Desactivar medicamento',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            '204': { description: 'Medicamento desactivado' },
            '404': { description: 'Medicamento no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/proveedores': {
        get: {
          tags: ['Proveedores'],
          summary: 'Listar proveedores',
          parameters: [
            { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } },
            { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100 } },
            { name: 'busqueda', in: 'query', required: false, schema: { type: 'string' } },
          ],
          responses: {
            '200': {
              description: 'Listado paginado de proveedores',
              content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Proveedor' } }, total: { type: 'integer' }, page: { type: 'integer' }, limit: { type: 'integer' }, totalPages: { type: 'integer' } } } } },
            },
          },
        },
        post: {
          tags: ['Proveedores'],
          summary: 'Crear proveedor',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['razonSocial', 'cuit'],
                  properties: {
                    razonSocial: { type: 'string' },
                    cuit: { type: 'string', example: '30-71234567-8' },
                    direccion: { type: 'string' },
                    telefono: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    contacto: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Proveedor creado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Proveedor' } } } } } },
            '400': { description: 'Validación fallida', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/proveedores/{id}': {
        get: {
          tags: ['Proveedores'],
          summary: 'Obtener proveedor por ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            '200': { description: 'Proveedor encontrado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Proveedor' } } } } } },
            '404': { description: 'Proveedor no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        put: {
          tags: ['Proveedores'],
          summary: 'Actualizar proveedor',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Proveedor' } } },
          },
          responses: {
            '200': { description: 'Proveedor actualizado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Proveedor' } } } } } },
            '404': { description: 'Proveedor no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Proveedores'],
          summary: 'Eliminar proveedor (soft delete)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            '204': { description: 'Proveedor eliminado' },
            '404': { description: 'Proveedor no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/inventario': {
        get: {
          tags: ['Inventario'],
          summary: 'Listar inventario',
          parameters: [
            { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } },
            { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100 } },
            { name: 'busqueda', in: 'query', required: false, schema: { type: 'string' } },
            { name: 'categoria', in: 'query', required: false, schema: { type: 'string' } },
            { name: 'estado', in: 'query', required: false, schema: { type: 'string', enum: ['CRITICO', 'BAJO', 'SIN_STOCK', 'NORMAL'] } },
          ],
          responses: {
            '200': {
              description: 'Listado paginado de productos de inventario',
              content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/ProductoInventario' } }, total: { type: 'integer' }, page: { type: 'integer' }, limit: { type: 'integer' }, totalPages: { type: 'integer' } } } } },
            },
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
      '/inventario/ean/{ean}': {
        get: {
          tags: ['Inventario'],
          summary: 'Obtener producto por código EAN',
          parameters: [{ name: 'ean', in: 'path', required: true, schema: { type: 'string', pattern: '^\\d{8}$|^\\d{12,13}$' } }],
          responses: {
            '200': { description: 'Producto encontrado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/ProductoInventario' } } } } } },
            '400': { description: 'EAN inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '404': { description: 'Producto no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
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
      '/inventario/{id}': {
        get: {
          tags: ['Inventario'],
          summary: 'Obtener producto de inventario por ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            '200': { description: 'Producto encontrado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/ProductoInventario' } } } } } },
            '404': { description: 'Producto no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/inventario/{id}/ajuste': {
        post: {
          tags: ['Inventario'],
          summary: 'Ajustar stock de un producto',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['cantidad', 'tipo', 'motivo'],
                  properties: {
                    cantidad: { type: 'integer', minimum: 1 },
                    tipo: { type: 'string', enum: ['INCREMENTO', 'DECREMENTO'] },
                    motivo: { type: 'string' },
                    loteId: { type: 'string', format: 'uuid', nullable: true },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Stock ajustado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/ProductoInventario' } } } } } },
            '400': { description: 'Validación fallida', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/inventario/{id}/movimientos': {
        get: {
          tags: ['Inventario'],
          summary: 'Listar movimientos de stock de un producto',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            '200': { description: 'Movimientos del producto', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/MovimientoStock' } } } } } } },
          },
        },
      },
      '/inventario/{id}/lotes': {
        get: {
          tags: ['Inventario'],
          summary: 'Listar lotes de un producto',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            '200': { description: 'Lotes del producto', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Lote' } } } } } } },
          },
        },
      },
      '/recepciones': {
        get: {
          tags: ['Recepciones'],
          summary: 'Listar recepciones',
          parameters: [
            { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } },
            { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100 } },
            { name: 'estado', in: 'query', required: false, schema: { type: 'string', enum: ['BORRADOR', 'CONFIRMADA', 'PROCESADA', 'ANULADA'] } },
          ],
          responses: {
            '200': {
              description: 'Listado paginado de recepciones',
              content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Recepcion' } }, total: { type: 'integer' }, page: { type: 'integer' }, limit: { type: 'integer' }, totalPages: { type: 'integer' } } } } },
            },
          },
        },
        post: {
          tags: ['Recepciones'],
          summary: 'Crear recepción manual en estado PROCESADA',
          description: 'Registra una recepción pendiente de confirmación. No impacta stock hasta llamar a /recepciones/{id}/confirmar.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['proveedorId', 'fechaRecepcion', 'detalles'],
                  properties: {
                    proveedorId: { type: 'string', format: 'uuid' },
                    remito: { type: 'string', nullable: true },
                    fechaRecepcion: { type: 'string', format: 'date-time' },
                    observaciones: { type: 'string', nullable: true },
                    detalles: {
                      type: 'array',
                      minItems: 1,
                      items: {
                        type: 'object',
                        required: ['productoId', 'cantidad'],
                        properties: {
                          productoId: { type: 'string', format: 'uuid' },
                          cantidad: { type: 'integer', minimum: 1 },
                          lote: { type: 'string' },
                          fechaVencimiento: { type: 'string', format: 'date-time' },
                          ean: { type: 'string', nullable: true },
                          troquel: { type: 'string', nullable: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Recepción creada', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Recepcion' } } } } } },
            '400': { description: 'Validación fallida', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/recepciones/desde-orden-compra/{solicitudId}': {
        post: {
          tags: ['Recepciones'],
          summary: 'Generar recepción desde orden de compra aprobada',
          description: 'Crea o devuelve una recepción BORRADOR vinculada a una solicitud de compra APROBADA. La cantidad viene precargada desde la orden y se puede modificar; EAN, troquel, lote y vencimiento se completan manualmente antes de procesar.',
          parameters: [{ name: 'solicitudId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            '201': { description: 'Recepción generada o existente', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Recepcion' } } } } } },
            '400': { description: 'La orden no está aprobada o no tiene proveedor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '404': { description: 'Orden de compra no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/recepciones/{id}': {
        get: {
          tags: ['Recepciones'],
          summary: 'Obtener recepción por ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            '200': { description: 'Recepción encontrada', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Recepcion' } } } } } },
            '404': { description: 'Recepción no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        put: {
          tags: ['Recepciones'],
          summary: 'Actualizar recepción en estado BORRADOR o PROCESADA',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['proveedorId', 'fechaRecepcion', 'detalles'],
                  properties: {
                    proveedorId: { type: 'string', format: 'uuid' },
                    remito: { type: 'string', nullable: true },
                    fechaRecepcion: { type: 'string', format: 'date-time' },
                    observaciones: { type: 'string', nullable: true },
                    detalles: {
                      type: 'array',
                      minItems: 1,
                      items: { $ref: '#/components/schemas/RecepcionDetalle' },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Recepción actualizada', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Recepcion' } } } } } },
            '400': { description: 'Validación fallida o estado inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '404': { description: 'Recepción no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/recepciones/{id}/confirmar': {
        put: {
          tags: ['Recepciones'],
          summary: 'Confirmar recepción',
          description: 'Confirma una recepción PROCESADA, valida remito/lote/vencimiento e impacta stock y lotes. Persiste el estado CONFIRMADA.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            '200': { description: 'Recepción confirmada', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Recepcion' } } } } } },
            '400': { description: 'Estado inválido para confirmar', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/recepciones/{id}/procesar': {
        put: {
          tags: ['Recepciones'],
          summary: 'Procesar recepción BORRADOR a PROCESADA',
          description: 'Pasa una recepción BORRADOR a PROCESADA. Valida remito, producto, EAN, troquel, cantidad, lote y vencimiento. No impacta stock; el impacto ocurre al confirmar.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            '200': { description: 'Recepción procesada sin impacto de stock', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Recepcion' } } } } } },
            '400': { description: 'Estado inválido para procesar', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/alertas/stock-critico': {
        get: {
          tags: ['Alertas'],
          summary: 'Listar productos con stock bajo, crítico o sin stock',
          responses: {
            '200': {
              description: 'Productos que requieren atención',
              content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/ProductoInventario' } } } } } },
            },
          },
        },
      },
      '/solicitudes-compra': {
        get: {
          tags: ['Solicitudes de Compra'],
          summary: 'Listar solicitudes de compra',
          parameters: [
            { name: 'estado', in: 'query', required: false, schema: { type: 'string', enum: ['BORRADOR', 'PENDIENTE', 'ENVIADA', 'APROBADA', 'EN_RECEPCION', 'RECHAZADA'] } },
            { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } },
            { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100 } },
          ],
          responses: {
            '200': {
              description: 'Listado paginado de solicitudes',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'array', items: { $ref: '#/components/schemas/SolicitudCompra' } },
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
          tags: ['Solicitudes de Compra'],
          summary: 'Crear una nueva solicitud de compra (OC sin importes)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['detalles'],
                  properties: {
                    estado: { type: 'string', enum: ['BORRADOR', 'PENDIENTE'], default: 'PENDIENTE', description: 'BORRADOR para guardar como borrador editable; PENDIENTE crea la solicitud lista para enviar.' },
                    prioridad: { type: 'string', enum: ['BAJA', 'NORMAL', 'ALTA', 'URGENTE'], default: 'NORMAL' },
                    motivo: { type: 'string' },
                    observaciones: { type: 'string' },
                    proveedorSugeridoId: { type: 'string', format: 'uuid', nullable: true, description: 'Proveedor sugerido a Compras. Puede ser reemplazado en la adjudicación.' },
                    detalles: {
                      type: 'array',
                      minItems: 1,
                      items: {
                        type: 'object',
                        required: ['productoId', 'cantidadSolicitada'],
                        properties: {
                          productoId: { type: 'string', format: 'uuid' },
                          cantidadSolicitada: { type: 'integer', minimum: 1 },
                          unidad: { type: 'string', default: 'unidad' },
                        },
                      },
                    },
                  },
                },
                example: {
                  prioridad: 'ALTA',
                  motivo: 'Stock crítico detectado',
                  detalles: [
                    { productoId: '<uuid>', cantidadSolicitada: 50, unidad: 'unidad' },
                  ],
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'OC creada en estado PENDIENTE',
              content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/SolicitudCompra' } } } } },
            },
            '400': { description: 'Validación fallida', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/solicitudes-compra/{id}': {
        get: {
          tags: ['Solicitudes de Compra'],
          summary: 'Obtener detalle completo de una OC (incluye precios si ya fue adjudicada)',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            '200': {
              description: 'Detalle de la OC con todos los campos de adjudicación',
              content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/SolicitudCompra' } } } } },
            },
            '404': { description: 'OC no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        put: {
          tags: ['Solicitudes de Compra'],
          summary: 'Editar un borrador (solo estado BORRADOR)',
          description: 'Reemplaza por completo los items del borrador (agregar / modificar / eliminar) y campos de cabecera. Solo permitido cuando la solicitud está en estado BORRADOR.',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['detalles'],
                  properties: {
                    prioridad: { type: 'string', enum: ['BAJA', 'NORMAL', 'ALTA', 'URGENTE'] },
                    motivo: { type: 'string' },
                    observaciones: { type: 'string' },
                    proveedorSugeridoId: { type: 'string', format: 'uuid', nullable: true },
                    detalles: {
                      type: 'array',
                      minItems: 1,
                      items: {
                        type: 'object',
                        required: ['productoId', 'cantidadSolicitada'],
                        properties: {
                          productoId: { type: 'string', format: 'uuid' },
                          cantidadSolicitada: { type: 'integer', minimum: 1 },
                          unidad: { type: 'string', default: 'unidad' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Borrador actualizado',
              content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/SolicitudCompra' } } } } },
            },
            '400': { description: 'La solicitud no está en estado BORRADOR o validación fallida', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '404': { description: 'OC no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Solicitudes de Compra'],
          summary: 'Eliminar un borrador (solo estado BORRADOR)',
          description: 'Elimina permanentemente la solicitud. Solo permitido cuando está en estado BORRADOR.',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            '200': {
              description: 'Borrador eliminado',
              content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } },
            },
            '400': { description: 'La solicitud no está en estado BORRADOR', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '404': { description: 'OC no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/solicitudes-compra/{id}/confirmar-borrador': {
        post: {
          tags: ['Solicitudes de Compra'],
          summary: 'Confirmar un borrador (BORRADOR → PENDIENTE)',
          description: 'Transiciona la solicitud de BORRADOR a PENDIENTE, dejándola lista para enviarse a Compras.',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            '200': {
              description: 'Solicitud confirmada (ahora PENDIENTE)',
              content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/SolicitudCompra' } } } } },
            },
            '400': { description: 'La solicitud no está en estado BORRADOR', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '404': { description: 'OC no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/solicitudes-compra/{id}/enviar-compras': {
        post: {
          tags: ['Solicitudes de Compra'],
          summary: 'Enviar OC al módulo de Compras (PENDIENTE → ENVIADA)',
          description: 'Genera un ordenCompraId, envía la OC al endpoint configurado en COMPRAS_URL e incluye el callbackUrl para la adjudicación. En modo mock (COMPRAS_USE_MOCK=true) simula la adjudicación automáticamente con precios determinísticos en múltiplos de 1000 y pasa directo a APROBADA.',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            '200': {
              description: 'OC enviada. En modo mock pasa directo a APROBADA con precios.',
              content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/SolicitudCompra' } } } } },
            },
            '400': { description: 'La OC no está en estado PENDIENTE', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '404': { description: 'OC no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/solicitudes-compra/{id}/confirmacion-adjudicacion': {
        post: {
          tags: ['Solicitudes de Compra'],
          summary: 'Callback de adjudicación desde el módulo de Compras (ENVIADA → APROBADA o RECHAZADA)',
          description: 'Endpoint que llama el módulo de Compras una vez terminada la licitación. Incluye proveedor adjudicado, precios por item y fecha estimada de entrega. También puede usarse para simular manualmente un rechazo en desarrollo.',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ConfirmacionAdjudicacionRequest' },
                examples: {
                  aprobada: {
                    summary: 'Adjudicación aprobada',
                    value: {
                      aprobado: true,
                      referenciaExterna: 'OC-COMPRAS-123',
                      proveedorAdjudicado: { razonSocial: 'Droguería Ejemplo SA' },
                      itemsAdjudicados: [{ productoId: '<uuid>', cantidadAprobada: 50, precioUnitario: 7000 }],
                      fechaAprobacion: '2026-06-09T00:00:00.000Z',
                      fechaEntregaEstimada: '2026-06-19T00:00:00.000Z',
                      observaciones: 'Adjudicado por licitación pública',
                    },
                  },
                  rechazada: {
                    summary: 'OC rechazada',
                    value: {
                      aprobado: false,
                      referenciaExterna: 'OC-COMPRAS-123',
                      observaciones: 'Sin presupuesto disponible',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Estado actualizado a APROBADA o RECHAZADA',
              content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/SolicitudCompra' } } } } },
            },
            '400': { description: 'La OC no está en estado ENVIADA', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '404': { description: 'OC no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
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

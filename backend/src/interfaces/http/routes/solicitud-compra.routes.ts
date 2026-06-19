import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { SolicitudCompraController } from '../controllers/SolicitudCompraController';
import { Container } from '../../../infrastructure/container';
import { validateRequest } from './validation';

export function solicitudCompraRoutes(container: Container): Router {
  const router = Router();
  const controller = new SolicitudCompraController(
    container.listarSolicitudesCompra,
    container.crearSolicitudCompra,
    container.actualizarSolicitudCompra,
    container.eliminarSolicitudCompra,
    container.confirmarBorrador,
    container.enviarOrdenCompra,
    container.confirmarAdjudicacion,
    container.solicitudCompraRepository,
  );

  router.get('/',
    query('estado').optional().isIn(['BORRADOR', 'PENDIENTE', 'APROBADA', 'RECHAZADA', 'ENVIADA']),
    validateRequest,
    controller.list,
  );

  router.get('/:id',
    param('id').isUUID().withMessage('ID debe ser un UUID válido'),
    validateRequest,
    controller.getById,
  );

  router.post('/',
    body('estado').optional().isIn(['BORRADOR', 'PENDIENTE']),
    body('prioridad').optional().isIn(['BAJA', 'NORMAL', 'ALTA', 'URGENTE']),
    body('motivo').optional().isString().trim(),
    body('proveedorSugeridoId').optional().isUUID(),
    body('detalles').isArray({ min: 1 }).withMessage('Debe incluir al menos un detalle'),
    body('detalles.*.productoId').isUUID().withMessage('Producto ID inválido'),
    body('detalles.*.cantidadSolicitada').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0'),
    body('detalles.*.unidad').optional().isString().trim(),
    validateRequest,
    controller.create,
  );

  router.put('/:id',
    param('id').isUUID().withMessage('ID debe ser un UUID válido'),
    body('prioridad').optional().isIn(['BAJA', 'NORMAL', 'ALTA', 'URGENTE']),
    body('motivo').optional().isString().trim(),
    body('proveedorSugeridoId').optional().isUUID(),
    body('detalles').isArray({ min: 1 }).withMessage('Debe incluir al menos un detalle'),
    body('detalles.*.productoId').isUUID().withMessage('Producto ID inválido'),
    body('detalles.*.cantidadSolicitada').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0'),
    body('detalles.*.unidad').optional().isString().trim(),
    validateRequest,
    controller.update,
  );

  router.delete('/:id',
    param('id').isUUID().withMessage('ID debe ser un UUID válido'),
    validateRequest,
    controller.remove,
  );

  router.post('/:id/confirmar-borrador',
    param('id').isUUID().withMessage('ID debe ser un UUID válido'),
    validateRequest,
    controller.confirmarBorrador,
  );

  router.post('/:id/enviar-compras',
    param('id').isUUID().withMessage('ID debe ser un UUID válido'),
    validateRequest,
    controller.enviarACompras,
  );

  router.post('/:id/confirmacion-adjudicacion',
    param('id').isUUID().withMessage('ID debe ser un UUID válido'),
    body('aprobado').isBoolean().withMessage('aprobado debe ser booleano'),
    body('referenciaExterna').optional().isString(),
    body('itemsAdjudicados').optional({ values: 'null' }).isArray(),
    body('itemsAdjudicados.*.productoId').optional().isUUID(),
    body('itemsAdjudicados.*.cantidadAprobada').optional().isInt({ min: 0 }),
    body('itemsAdjudicados.*.precioUnitario').optional().isFloat({ min: 0 }),
    validateRequest,
    controller.confirmarAdjudicacion,
  );

  return router;
}

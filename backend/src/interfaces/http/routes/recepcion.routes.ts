import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { RecepcionController } from '../controllers/RecepcionController';
import { Container } from '../../../infrastructure/container';
import { validateRequest } from './validation';
import { requirePermiso } from '../middleware/permisos';

export function recepcionRoutes(container: Container): Router {
  const router = Router();
  const controller = new RecepcionController(
    container.listarRecepciones,
    container.obtenerRecepcion,
    container.crearRecepcion,
    container.crearRecepcionDesdeOrdenCompra,
    container.actualizarRecepcion,
    container.confirmarRecepcion,
    container.procesarRecepcion,
  );

  router.use(requirePermiso('farmacia:recepciones:read'));

  router.get('/',
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('estado').optional({ values: 'falsy' }).isIn(['BORRADOR', 'CONFIRMADA', 'PROCESADA', 'ANULADA']),
    validateRequest,
    controller.list,
  );

  router.post('/',
    requirePermiso('farmacia:recepciones:write'),
    body('proveedorId').isUUID().withMessage('Proveedor ID inválido'),
    body('remito').optional().isString().trim(),
    body('fechaRecepcion').isISO8601().withMessage('Fecha de recepción inválida'),
    body('observaciones').optional().isString().trim(),
    body('detalles').isArray({ min: 1 }).withMessage('Debe incluir al menos un detalle'),
    body('detalles.*.productoId').isUUID().withMessage('Producto ID inválido en detalle'),
    body('detalles.*.cantidad').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0'),
    body('detalles.*.lote').optional({ values: 'falsy' }).isString().trim(),
    body('detalles.*.fechaVencimiento').optional({ values: 'falsy' }).isISO8601().withMessage('Fecha de vencimiento inválida en detalle'),
    body('detalles.*.ean').optional().isString().trim(),
    body('detalles.*.troquel').optional().isString().trim(),
    validateRequest,
    controller.create,
  );

  router.post('/desde-orden-compra/:solicitudId',
    requirePermiso('farmacia:recepciones:write'),
    param('solicitudId').isUUID().withMessage('Orden de compra inválida'),
    validateRequest,
    controller.createFromOrdenCompra,
  );

  router.get('/:id',
    param('id').isUUID(),
    validateRequest,
    controller.getById,
  );

  router.put('/:id',
    requirePermiso('farmacia:recepciones:write'),
    param('id').isUUID(),
    body('proveedorId').isUUID().withMessage('Proveedor ID inválido'),
    body('remito').optional().isString().trim(),
    body('fechaRecepcion').isISO8601().withMessage('Fecha de recepción inválida'),
    body('observaciones').optional().isString().trim(),
    body('detalles').isArray({ min: 1 }).withMessage('Debe incluir al menos un detalle'),
    body('detalles.*.productoId').isUUID().withMessage('Producto ID inválido en detalle'),
    body('detalles.*.cantidad').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0'),
    body('detalles.*.lote').optional({ values: 'falsy' }).isString().trim(),
    body('detalles.*.fechaVencimiento').optional({ values: 'falsy' }).isISO8601().withMessage('Fecha de vencimiento inválida en detalle'),
    body('detalles.*.ean').optional().isString().trim(),
    body('detalles.*.troquel').optional().isString().trim(),
    validateRequest,
    controller.update,
  );

  router.put('/:id/confirmar',
    requirePermiso('farmacia:recepciones:write'),
    param('id').isUUID(),
    validateRequest,
    controller.confirmar,
  );

  router.put('/:id/procesar',
    requirePermiso('farmacia:recepciones:write'),
    param('id').isUUID(),
    validateRequest,
    controller.procesar,
  );

  return router;
}

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { RecepcionController } from '../controllers/RecepcionController';
import { Container } from '../../../infrastructure/container';
import { validateRequest } from './validation';

export function recepcionRoutes(container: Container): Router {
  const router = Router();
  const controller = new RecepcionController(
    container.listarRecepciones,
    container.obtenerRecepcion,
    container.crearRecepcion,
    container.confirmarRecepcion,
    container.procesarRecepcion,
  );

  router.get('/',
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('estado').optional({ values: 'falsy' }).isIn(['BORRADOR', 'CONFIRMADA', 'PROCESADA', 'ANULADA']),
    validateRequest,
    controller.list,
  );

  router.post('/',
    body('proveedorId').isUUID().withMessage('Proveedor ID inválido'),
    body('remito').optional().isString().trim(),
    body('fechaRecepcion').isISO8601().withMessage('Fecha de recepción inválida'),
    body('observaciones').optional().isString().trim(),
    body('detalles').isArray({ min: 1 }).withMessage('Debe incluir al menos un detalle'),
    body('detalles.*.productoId').isUUID().withMessage('Producto ID inválido en detalle'),
    body('detalles.*.cantidad').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0'),
    body('detalles.*.lote').isString().trim().notEmpty().withMessage('Número de lote es requerido'),
    body('detalles.*.fechaVencimiento').isISO8601().withMessage('Fecha de vencimiento inválida en detalle'),
    body('detalles.*.ean').optional().isString().trim(),
    body('detalles.*.troquel').optional().isString().trim(),
    validateRequest,
    controller.create,
  );

  router.get('/:id',
    param('id').isUUID(),
    validateRequest,
    controller.getById,
  );

  router.put('/:id/confirmar',
    param('id').isUUID(),
    validateRequest,
    controller.confirmar,
  );

  router.put('/:id/procesar',
    param('id').isUUID(),
    validateRequest,
    controller.procesar,
  );

  return router;
}

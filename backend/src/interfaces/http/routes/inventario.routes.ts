import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { InventarioController } from '../controllers/InventarioController';
import { Container } from '../../../infrastructure/container';
import { validateRequest } from './validation';

export function inventarioRoutes(container: Container): Router {
  const router = Router();
  const controller = new InventarioController(
    container.listarInventario,
    container.obtenerProductoInventario,
    container.ajustarStock,
    container.obtenerMovimientos,
    container.obtenerLotes,
  );

  router.get('/',
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('busqueda').optional({ values: 'falsy' }).isString().trim(),
    query('categoria').optional({ values: 'falsy' }).isString().trim(),
    query('estado').optional({ values: 'falsy' }).isIn(['CRITICO', 'BAJO', 'SIN_STOCK', 'NORMAL']),
    validateRequest,
    controller.list,
  );

  router.get('/:id',
    param('id').isUUID(),
    validateRequest,
    controller.getById,
  );

  router.post('/:id/ajuste',
    param('id').isUUID(),
    body('cantidad').isInt({ min: 1 }).withMessage('Cantidad debe ser un número entero positivo'),
    body('tipo').isIn(['INCREMENTO', 'DECREMENTO']).withMessage('Tipo debe ser INCREMENTO o DECREMENTO'),
    body('motivo').isString().trim().notEmpty().withMessage('Motivo es requerido'),
    body('loteId').optional().isUUID(),
    validateRequest,
    controller.ajustarStock,
  );

  router.get('/:id/movimientos',
    param('id').isUUID(),
    validateRequest,
    controller.getMovimientos,
  );

  router.get('/:id/lotes',
    param('id').isUUID(),
    validateRequest,
    controller.getLotes,
  );

  return router;
}

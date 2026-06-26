import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { Container } from '../../../infrastructure/container';
import { DepositoController } from '../controllers/DepositoController';
import { validateRequest } from './validation';

export function depositoRoutes(container: Container): Router {
  const router = Router();
  const controller = new DepositoController(
    container.listarDepositos,
    container.crearDeposito,
    container.transferirStock,
    container.obtenerStockPorDeposito,
  );

  router.get('/',
    query('activos').optional().isBoolean(),
    validateRequest,
    controller.list,
  );

  router.post('/',
    body('nombre').isString().trim().notEmpty().withMessage('Nombre requerido'),
    body('tipo').optional().isIn(['CENTRAL', 'PISO']),
    body('descripcion').optional().isString().trim(),
    validateRequest,
    controller.create,
  );

  router.post('/transferencias',
    body('productoId').isString().trim().notEmpty().withMessage('Producto ID inválido'),
    body('depositoOrigenId').isString().trim().notEmpty().withMessage('Depósito origen inválido'),
    body('depositoDestinoId').isString().trim().notEmpty().withMessage('Depósito destino inválido'),
    body('cantidad').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0'),
    validateRequest,
    controller.transferir,
  );

  router.get('/stock/:productoId',
    param('productoId').isUUID().withMessage('Producto ID inválido'),
    validateRequest,
    controller.stockPorProducto,
  );

  return router;
}

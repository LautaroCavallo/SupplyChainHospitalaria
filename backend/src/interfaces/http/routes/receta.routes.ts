import { Router } from 'express';
import { param, body } from 'express-validator';
import { RecetaController } from '../controllers/RecetaController';
import { Container } from '../../../infrastructure/container';
import { validateRequest } from './validation';

export function recetaRoutes(container: Container): Router {
  const router = Router();
  const controller = new RecetaController(
    container.validarReceta,
    container.consumirReceta,
  );

  router.post('/:id/validar',
    param('id').isString().notEmpty(),
    validateRequest,
    controller.validar,
  );

  router.post('/:id/consumir',
    param('id').isString().notEmpty(),
    body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un item'),
    body('items.*.productoId').isUUID().withMessage('Producto ID inválido'),
    body('items.*.cantidad').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0'),
    body('items.*.loteId').optional().isUUID(),
    validateRequest,
    controller.consumir,
  );

  return router;
}

import { Router } from 'express';
import { param, body } from 'express-validator';
import { RecetaController } from '../controllers/RecetaController';
import { Container } from '../../../infrastructure/container';
import { validateRequest } from './validation';
import { requirePermiso } from '../middleware/permisos';

export function recetaRoutes(container: Container): Router {
  const router = Router();
  const controller = new RecetaController(
    container.validarReceta,
    container.consumirReceta,
  );

  router.use(requirePermiso('farmacia:pacientes:read'));

  router.post('/:id/validar',
    param('id').isString().notEmpty(),
    validateRequest,
    controller.validar,
  );

  router.post('/:id/consumir',
    param('id').isString().notEmpty(),
    body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un item'),
    body('items.*.productoId').optional().isUUID().withMessage('Producto ID inválido'),
    body('items.*.medicamento').optional().isString().trim().notEmpty().withMessage('Medicamento requerido'),
    body('items.*.cantidad').optional().isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0'),
    body('items.*.cantConsumo').optional().isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0'),
    body('items.*.loteId').optional().isUUID(),
    body('confirmarAlertas').optional().isBoolean().withMessage('confirmarAlertas debe ser booleano'),
    validateRequest,
    controller.consumir,
  );

  return router;
}

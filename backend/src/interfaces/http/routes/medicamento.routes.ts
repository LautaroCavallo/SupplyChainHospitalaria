import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { Container } from '../../../infrastructure/container';
import { MedicamentoController } from '../controllers/MedicamentoController';
import { validateRequest } from './validation';
import { requirePermiso } from '../middleware/permisos';

export function medicamentoRoutes(container: Container): Router {
  const router = Router();
  const controller = new MedicamentoController(container.inventarioRepository);

  router.use(requirePermiso('farmacia:gestion:read'));

  router.get('/',
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('busqueda').optional({ values: 'falsy' }).isString().trim(),
    query('categoria').optional({ values: 'falsy' }).isString().trim(),
    query('estado').optional({ values: 'falsy' }).isIn(['ACTIVO', 'INACTIVO', 'SUSPENDIDO']),
    validateRequest,
    controller.list,
  );

  router.get('/summary', controller.summary);

  router.post('/',
    requirePermiso('farmacia:gestion:write'),
    body('nombre').isString().trim().notEmpty().withMessage('Nombre requerido'),
    body('categoria').optional().isString().trim(),
    body('presentacion').optional().isString().trim(),
    body('ean').optional({ values: 'falsy' }).isString().trim(),
    body('laboratorio').optional().isString().trim(),
    body('estado').optional().isIn(['ACTIVO', 'INACTIVO', 'SUSPENDIDO']),
    body('precio').optional().isFloat({ min: 0 }).toFloat(),
    body('observaciones').optional().isString().trim(),
    body('stockCritico').optional().isInt({ min: 0 }).toInt(),
    validateRequest,
    controller.create,
  );

  router.put('/:id',
    requirePermiso('farmacia:gestion:write'),
    param('id').isUUID(),
    body('nombre').optional().isString().trim().notEmpty(),
    body('categoria').optional().isString().trim(),
    body('presentacion').optional().isString().trim(),
    body('ean').optional({ values: 'falsy' }).isString().trim(),
    body('laboratorio').optional().isString().trim(),
    body('estado').optional().isIn(['ACTIVO', 'INACTIVO', 'SUSPENDIDO']),
    body('precio').optional().isFloat({ min: 0 }).toFloat(),
    body('observaciones').optional().isString().trim(),
    body('stockCritico').optional().isInt({ min: 0 }).toInt(),
    validateRequest,
    controller.update,
  );

  router.delete('/:id',
    requirePermiso('farmacia:gestion:write'),
    param('id').isUUID(),
    validateRequest,
    controller.delete,
  );

  return router;
}

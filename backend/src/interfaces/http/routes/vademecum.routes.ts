import { Router } from 'express';
import { query, param } from 'express-validator';
import { VademecumController } from '../controllers/VademecumController';
import { Container } from '../../../infrastructure/container';

export function vademecumRoutes(container: Container): Router {
  const router = Router();
  const controller = new VademecumController(
    container.buscarMedicamentos,
    container.obtenerMedicamento,
  );

  router.get('/search',
    query('q').optional().isString().trim().isLength({ min: 2 }).withMessage('La búsqueda debe tener al menos 2 caracteres'),
    controller.search,
  );

  router.get('/:id',
    param('id').isString().notEmpty(),
    controller.getById,
  );

  return router;
}

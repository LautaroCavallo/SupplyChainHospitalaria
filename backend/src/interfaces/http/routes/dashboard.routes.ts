import { Router } from 'express';
import { query } from 'express-validator';
import { Container } from '../../../infrastructure/container';
import { DashboardController } from '../controllers/DashboardController';
import { validateRequest } from './validation';
import { requirePermiso } from '../middleware/permisos';

export function dashboardRoutes(container: Container): Router {
  const router = Router();
  const controller = new DashboardController(
    container.obtenerDashboard,
    container.obtenerActividadReciente,
  );

  router.use(requirePermiso('farmacia:dashboard:read'));

  router.get('/', controller.summary);

  router.get('/actividad-reciente',
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('busqueda').optional({ values: 'falsy' }).isString().trim(),
    query('usuario').optional({ values: 'falsy' }).isString().trim(),
    query('evento').optional({ values: 'falsy' }).isIn(['receta_validada', 'stock_ajustado', 'nueva_recepcion', 'validacion_rechazada', 'otro']),
    query('desde').optional({ values: 'falsy' }).isISO8601().withMessage('Fecha desde inválida'),
    query('hasta').optional({ values: 'falsy' }).isISO8601().withMessage('Fecha hasta inválida'),
    validateRequest,
    controller.actividad,
  );

  return router;
}

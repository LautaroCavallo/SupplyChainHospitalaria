import { Router } from 'express';
import { AlertaController } from '../controllers/AlertaController';
import { Container } from '../../../infrastructure/container';
import { requirePermiso } from '../middleware/permisos';

export function alertaRoutes(container: Container): Router {
  const router = Router();
  const controller = new AlertaController(
    container.detectarStockCritico,
  );

  router.get('/stock-critico', requirePermiso('farmacia:compras:read'), controller.getStockCritico);

  return router;
}

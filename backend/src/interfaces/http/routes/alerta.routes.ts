import { Router } from 'express';
import { AlertaController } from '../controllers/AlertaController';
import { Container } from '../../../infrastructure/container';

export function alertaRoutes(container: Container): Router {
  const router = Router();
  const controller = new AlertaController(
    container.detectarStockCritico,
  );

  router.get('/stock-critico', controller.getStockCritico);

  return router;
}

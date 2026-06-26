import { Router } from 'express';
import { NotificacionController } from '../controllers/NotificacionController';
import { Container } from '../../../infrastructure/container';

export function notificacionRoutes(container: Container): Router {
  const router = Router();
  const controller = new NotificacionController(
    container.notificacionRepository,
    container.inventarioRepository,
    container.loteRepository,
  );

  router.get('/', controller.getAll);
  router.post('/marcar-leidas', controller.marcarLeidas);

  return router;
}

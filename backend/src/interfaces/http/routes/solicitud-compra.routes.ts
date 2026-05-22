import { Router } from 'express';
import { body, query } from 'express-validator';
import { SolicitudCompraController } from '../controllers/SolicitudCompraController';
import { Container } from '../../../infrastructure/container';
import { validateRequest } from './validation';

export function solicitudCompraRoutes(container: Container): Router {
  const router = Router();
  const controller = new SolicitudCompraController(
    container.listarSolicitudesCompra,
    container.crearSolicitudCompra,
  );

  router.get('/',
    query('estado').optional().isIn(['PENDIENTE', 'APROBADA', 'RECHAZADA', 'ENVIADA']),
    validateRequest,
    controller.list,
  );

  router.post('/',
    body('prioridad').optional().isIn(['BAJA', 'NORMAL', 'ALTA', 'URGENTE']),
    body('motivo').optional().isString().trim(),
    body('detalles').isArray({ min: 1 }).withMessage('Debe incluir al menos un detalle'),
    body('detalles.*.productoId').isUUID().withMessage('Producto ID inválido'),
    body('detalles.*.cantidadSolicitada').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0'),
    validateRequest,
    controller.create,
  );

  return router;
}

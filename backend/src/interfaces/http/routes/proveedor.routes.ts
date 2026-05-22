import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { ProveedorController } from '../controllers/ProveedorController';
import { Container } from '../../../infrastructure/container';
import { validateRequest } from './validation';

export function proveedorRoutes(container: Container): Router {
  const router = Router();
  const controller = new ProveedorController(
    container.listarProveedores,
    container.obtenerProveedor,
    container.crearProveedor,
    container.actualizarProveedor,
    container.eliminarProveedor,
  );

  router.get('/',
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('busqueda').optional({ values: 'falsy' }).isString().trim(),
    query('activo').optional({ values: 'falsy' }).isBoolean(),
    validateRequest,
    controller.list,
  );

  router.get('/:id',
    param('id').isUUID(),
    validateRequest,
    controller.getById,
  );

  router.post('/',
    body('razonSocial').isString().trim().notEmpty().withMessage('Razón social es requerida'),
    body('cuit').isString().trim().notEmpty().withMessage('CUIT es requerido'),
    body('direccion').optional().isString().trim(),
    body('telefono').optional().isString().trim(),
    body('email').optional().isEmail().withMessage('Email inválido'),
    body('contacto').optional().isString().trim(),
    validateRequest,
    controller.create,
  );

  router.put('/:id',
    param('id').isUUID(),
    body('razonSocial').optional().isString().trim().notEmpty(),
    body('direccion').optional().isString().trim(),
    body('telefono').optional().isString().trim(),
    body('email').optional().isEmail(),
    body('contacto').optional().isString().trim(),
    body('activo').optional().isBoolean(),
    validateRequest,
    controller.update,
  );

  router.delete('/:id',
    param('id').isUUID(),
    validateRequest,
    controller.delete,
  );

  return router;
}

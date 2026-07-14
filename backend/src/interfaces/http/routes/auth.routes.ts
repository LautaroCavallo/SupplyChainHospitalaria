import { Router } from 'express';
import { body, query } from 'express-validator';
import { Container } from '../../../infrastructure/container';
import { AuthController } from '../controllers/AuthController';
import { LocalAuthService } from '../../../infrastructure/external/core/LocalAuthService';
import { validateRequest } from './validation';

export function authRoutes(container: Container): Router {
  const router = Router();
  const localAuthService = new LocalAuthService();
  const controller = new AuthController(container.coreAuthService, localAuthService);

  router.post('/login',
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isString().notEmpty().withMessage('Contraseña requerida'),
    validateRequest,
    controller.login,
  );

  router.post('/register',
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isString().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('nombre').isString().trim().notEmpty().withMessage('Nombre requerido'),
    body('cargo').optional().isString().trim(),
    body('rol').optional().isString().trim(),
    validateRequest,
    controller.register,
  );

  // Ruta pública: callback SSO. Recibe el ticket emitido por el Core,
  // lo canjea servidor-a-servidor y devuelve { token, user, redirect }.
  router.get('/sso',
    query('ticket').isString().notEmpty().withMessage('ticket requerido'),
    validateRequest,
    controller.ssoCallback,
  );

  return router;
}

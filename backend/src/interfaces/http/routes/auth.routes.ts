import { Router } from 'express';
import { body, query } from 'express-validator';
import { Container } from '../../../infrastructure/container';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from './validation';

export function authRoutes(container: Container): Router {
  const router = Router();
  const controller = new AuthController(container.coreAuthService, container.coreClient);

  router.post('/login',
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isString().notEmpty().withMessage('Contraseña requerida'),
    validateRequest,
    controller.login,
  );

  // Ruta pública: callback SSO. Recibe el ticket emitido por el Core,
  // lo canjea servidor-a-servidor y devuelve { token, user, redirect }.
  router.get('/sso',
    query('ticket').isString().notEmpty().withMessage('ticket requerido'),
    validateRequest,
    controller.ssoCallback,
  );

  // SSO saliente: el usuario logueado en Farmacia pide un ticket para navegar
  // ya autenticado a otro módulo de Health Grid.
  router.get('/sso-ticket', controller.getSsoTicket);

  return router;
}

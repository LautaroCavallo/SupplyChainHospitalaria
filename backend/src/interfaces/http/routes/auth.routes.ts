import { Router } from 'express';
import { body } from 'express-validator';
import { Container } from '../../../infrastructure/container';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from './validation';

export function authRoutes(container: Container): Router {
  const router = Router();
  const controller = new AuthController(container.coreAuthService);

  router.post('/login',
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isString().notEmpty().withMessage('Contraseña requerida'),
    validateRequest,
    controller.login,
  );

  return router;
}

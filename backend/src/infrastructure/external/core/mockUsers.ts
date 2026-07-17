import { CoreUser } from './CoreAuthService';

/**
 * Usuarios de prueba para el modo mock (AUTH_MODE !== 'core', sin Core disponible).
 * Permite probar localmente el gating por permisos de cada rol: entrar con
 * `farmaceutico@healthgrid.dev`, `auditor@healthgrid.dev` o `deposito@healthgrid.dev`
 * (cualquier contraseña) para ver la app como ese rol.
 */
export const MOCK_USERS: Record<string, CoreUser> = {
  'farmaceutico@healthgrid.dev': {
    id: 'mock-farmaceutico',
    nombre: 'Dr. Alejandro V. (mock)',
    email: 'farmaceutico@healthgrid.dev',
    rol: 'FARMACEUTICO',
    permisos: [
      'farmacia:dashboard:read',
      'farmacia:inventario:read',
      'farmacia:inventario:write',
      'farmacia:recepciones:read',
      'farmacia:recepciones:write',
      'farmacia:pacientes:read',
      'farmacia:compras:read',
      'farmacia:compras:write',
      'farmacia:gestion:read',
      'farmacia:gestion:write',
    ],
  },
  'auditor@healthgrid.dev': {
    id: 'mock-auditor',
    nombre: 'Auditora Marta L. (mock)',
    email: 'auditor@healthgrid.dev',
    rol: 'AUDITOR',
    permisos: [
      'farmacia:dashboard:read',
      'farmacia:inventario:read',
      'farmacia:recepciones:read',
      'farmacia:compras:read',
      'farmacia:gestion:read',
    ],
  },
  'deposito@healthgrid.dev': {
    id: 'mock-deposito',
    nombre: 'Op. Depósito J. (mock)',
    email: 'deposito@healthgrid.dev',
    rol: 'DEPOSITO',
    permisos: [
      'farmacia:dashboard:read',
      'farmacia:inventario:read',
      'farmacia:inventario:write',
      'farmacia:recepciones:read',
      'farmacia:recepciones:write',
    ],
  },
};

export const DEFAULT_MOCK_USER: CoreUser = MOCK_USERS['farmaceutico@healthgrid.dev'];

import { Request, Response, NextFunction } from 'express';

function tienePermiso(permisos: string[], requerido: string): boolean {
  return permisos.some((permiso) => {
    if (permiso === requerido) return true;
    if (permiso.endsWith(':*')) {
      const prefijo = permiso.slice(0, -1);
      return requerido.startsWith(prefijo);
    }
    return false;
  });
}

/**
 * Exige que el usuario autenticado tenga al menos uno de los permisos indicados
 * (formato `recurso:accion`, ej. `farmacia:inventario:read`). Soporta wildcards
 * tipo `farmacia:*` como los que usa el modo mock/dev.
 */
export function requirePermiso(...permisos: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const permisosUsuario = req.user?.permisos ?? [];
    const autorizado = permisos.some((permiso) => tienePermiso(permisosUsuario, permiso));

    if (!autorizado) {
      res.status(403).json({ success: false, error: 'No tenés permiso para realizar esta acción' });
      return;
    }

    next();
  };
}

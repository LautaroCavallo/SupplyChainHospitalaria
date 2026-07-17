function getPermisos(): string[] {
  try {
    const userRaw = localStorage.getItem('healthgrid_user');
    const user = userRaw ? JSON.parse(userRaw) : null;
    return Array.isArray(user?.permisos) ? user.permisos : [];
  } catch {
    return [];
  }
}

/**
 * Verifica si el usuario logueado tiene el permiso indicado (formato
 * `recurso:accion`, ej. `farmacia:inventario:read`). Soporta wildcards
 * tipo `farmacia:*`, igual que la validación del backend.
 */
export function hasPermiso(permiso: string): boolean {
  const permisos = getPermisos();
  return permisos.some((p) => {
    if (p === permiso) return true;
    if (p.endsWith(':*')) {
      const prefijo = p.slice(0, -1);
      return permiso.startsWith(prefijo);
    }
    return false;
  });
}

export function hasAlgunPermiso(...permisos: string[]): boolean {
  return permisos.some((permiso) => hasPermiso(permiso));
}

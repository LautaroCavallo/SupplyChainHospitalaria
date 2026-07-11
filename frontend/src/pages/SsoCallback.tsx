import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ssoExchange } from '../api/auth';

/** Solo rutas internas absolutas; descarta URLs externas (open redirect). */
function safeRedirect(path: string | null): string {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) return '/';
  return path;
}

/**
 * Callback de SSO de Health Grid. El usuario aterriza acá desde otro módulo/Core:
 *   /auth/sso?ticket=<opaco>&redirect=/ruta-interna
 * Canjea el ticket (una sola vez, ~60s de vida) por un JWT y arma la sesión.
 */
export default function SsoCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ticket = params.get('ticket');
    const redirect = safeRedirect(params.get('redirect'));
    if (!ticket) {
      setError('El enlace de acceso no incluye un ticket SSO.');
      return;
    }
    ssoExchange(ticket)
      .then((res) => {
        localStorage.setItem('healthgrid_token', res.token);
        localStorage.setItem('healthgrid_user', JSON.stringify(res.user));
        // replace: el ticket no queda en el historial de navegación.
        navigate(redirect, { replace: true });
      })
      .catch(() => setError('No se pudo validar el acceso SSO (ticket inválido o expirado).'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-xl shadow p-8 max-w-sm w-full text-center">
        {error ? (
          <>
            <div className="text-red-500 text-4xl mb-3">⚠️</div>
            <h1 className="text-lg font-semibold text-gray-800 mb-2">Acceso no válido</h1>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <Link to="/login" className="text-teal-600 font-medium hover:underline">
              Ir al inicio de sesión
            </Link>
          </>
        ) : (
          <>
            <div className="animate-spin h-8 w-8 border-3 border-teal-500 border-t-transparent rounded-full mx-auto mb-4" />
            <h1 className="text-lg font-semibold text-gray-800">Validando acceso…</h1>
            <p className="text-sm text-gray-500 mt-1">Iniciando sesión vía Health Grid</p>
          </>
        )}
      </div>
    </div>
  );
}

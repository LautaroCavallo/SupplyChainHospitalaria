import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { exchangeSSOTicket } from '../api/auth';

export default function SsoCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ticket = searchParams.get('ticket');
    const rawRedirect = searchParams.get('redirect') ?? '/';

    // Prevenir open redirect: solo rutas internas absolutas
    const safeRedirect =
      rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') && !rawRedirect.startsWith('/\\')
        ? rawRedirect
        : '/';

    if (!ticket) {
      setError('El enlace de acceso no incluye un ticket SSO.');
      return;
    }

    exchangeSSOTicket(ticket)
      .then((data) => {
        localStorage.setItem('healthgrid_token', data.token);
        localStorage.setItem('healthgrid_user', JSON.stringify(data.user));
        // replace: true para que el ticket no quede en el historial del navegador
        navigate(safeRedirect, { replace: true });
      })
      .catch(() => {
        setError(
          'El ticket SSO es inválido o ha expirado. ' +
          'Volvé al módulo de origen para iniciar sesión nuevamente.',
        );
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0faf4]">
        <div className="w-full max-w-sm rounded-2xl bg-white p-10 shadow-sm text-center">
          <div className="mb-4 flex justify-center text-red-500">
            <AlertCircle className="h-8 w-8" />
          </div>
          <p className="text-sm text-gray-700">{error}</p>
          <a
            href="/login"
            className="mt-6 inline-block text-sm font-medium text-brand underline"
          >
            Ir al login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0faf4]">
      <div className="rounded-2xl bg-white p-10 shadow-sm text-center">
        <div className="mb-4 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
        <p className="text-sm text-gray-500">Iniciando sesión con SSO...</p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel - dark green */}
      <div className="flex w-1/2 flex-col items-center justify-center bg-brand px-12">
        <div className="text-left">
          <div className="mb-6">
            <h1 className="font-serif text-6xl font-bold leading-tight text-white">
              Health<br />Grid
            </h1>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-px w-8 bg-green-400/50" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-green-300/70">
                Sistema de Clínica
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - light green bg */}
      <div className="flex w-1/2 items-center justify-center bg-[#f0faf4] px-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">Acceso al Sistema</h2>
            <p className="mt-1 text-sm text-gray-500">Ingrese sus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@healthgrid.com"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-12 w-full rounded-full bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-light disabled:opacity-60"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

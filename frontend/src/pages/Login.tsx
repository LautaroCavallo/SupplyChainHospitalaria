import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, User, Briefcase } from 'lucide-react';
import { login, register } from '../api/auth';

type Tab = 'login' | 'register';

export default function Login() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('login');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCargo, setRegCargo] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveSession = (token: string, user: object) => {
    localStorage.setItem('healthgrid_token', token);
    localStorage.setItem('healthgrid_user', JSON.stringify(user));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const result = await login(loginEmail, loginPassword);
      saveSession(result.token, result.user);
      navigate('/');
    } catch {
      setError('Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (regPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const result = await register({
        email: regEmail,
        password: regPassword,
        nombre: regNombre,
        cargo: regCargo || undefined,
      });
      saveSession(result.token, result.user);
      navigate('/');
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? 'Error al registrar usuario';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
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

      {/* Right panel */}
      <div className="flex w-1/2 items-center justify-center bg-[#f0faf4] px-12">
        <div className="w-full max-w-md">
          {/* Tabs */}
          <div className="mb-6 flex rounded-xl bg-white p-1 shadow-sm">
            <button
              onClick={() => { setTab('login'); setError(null); }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                tab === 'login' ? 'bg-brand text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => { setTab('register'); setError(null); }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                tab === 'register' ? 'bg-brand text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Registrarse
            </button>
          </div>

          <div className="rounded-2xl bg-white p-10 shadow-sm">
            {tab === 'login' ? (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900">Acceso al Sistema</h2>
                  <p className="mt-1 text-sm text-gray-500">Ingrese sus credenciales para continuar</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="ejemplo@healthgrid.com"
                        required
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
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
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

                  {error && (
                    <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}
                </form>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900">Crear Cuenta</h2>
                  <p className="mt-1 text-sm text-gray-500">Complete los datos para registrarse</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Nombre Completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={regNombre}
                        onChange={(e) => setRegNombre(e.target.value)}
                        placeholder="Dr. Juan Pérez"
                        required
                        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="ejemplo@healthgrid.com"
                        required
                        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Cargo <span className="font-normal normal-case text-gray-400">(opcional)</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={regCargo}
                        onChange={(e) => setRegCargo(e.target.value)}
                        placeholder="Farmacéutico Jefe"
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
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        required
                        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        value={regConfirm}
                        onChange={(e) => setRegConfirm(e.target.value)}
                        placeholder="Repita la contraseña"
                        required
                        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 h-12 w-full rounded-full bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-light disabled:opacity-60"
                  >
                    {loading ? 'Registrando...' : 'Crear Cuenta'}
                  </button>

                  {error && (
                    <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

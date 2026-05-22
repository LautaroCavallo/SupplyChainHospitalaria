import { useState, useEffect } from 'react';
import { Camera, User, Briefcase, Settings, Loader2, CheckCircle2 } from 'lucide-react';
import { getPerfil, actualizarPerfil } from '../api/perfil';
import type { PerfilUsuario } from '../types';
import Badge from '../components/common/Badge';

export default function Perfil() {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getPerfil().then(setPerfil).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!perfil) return;
    try {
      setSaving(true);
      await actualizarPerfil(perfil);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  const update = (field: keyof PerfilUsuario, value: unknown) => {
    setPerfil((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand" />
    </div>
  );

  if (!perfil) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-5xl font-bold text-gray-900">Perfil</h1>
        <p className="mt-2 text-sm text-gray-500">Informacion personal y profesional del usuario</p>
      </div>

      {/* User card */}
      <div className="mb-6 flex items-center gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-100 text-4xl">
            🧑‍⚕️
          </div>
          <button className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white shadow">
            <Camera className="h-3 w-3" />
          </button>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900">Dr. {perfil.nombreCompleto.split(' ')[0]} V.</h2>
            <Badge label="Activo" variant="success" />
          </div>
          <p className="text-sm text-gray-600">{perfil.cargo}</p>
          {perfil.matricula && (
            <p className="text-xs text-gray-400">Matrícula Profesional: {perfil.matricula}</p>
          )}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-6">
        {/* Información Personal */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <User className="h-5 w-5 text-brand" />
            <h3 className="font-semibold text-gray-900">Información Personal</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Nombre Completo</label>
              <input type="text" value={perfil.nombreCompleto} onChange={(e) => update('nombreCompleto', e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Correo Electrónico</label>
              <input type="email" value={perfil.email} onChange={(e) => update('email', e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Teléfono</label>
                <input type="text" value={perfil.telefono ?? ''} onChange={(e) => update('telefono', e.target.value)}
                  className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Documento (ID)</label>
                <input type="text" value={perfil.documento ?? ''} onChange={(e) => update('documento', e.target.value)}
                  className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Información Profesional */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-brand" />
            <h3 className="font-semibold text-gray-900">Información Profesional</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Cargo</label>
              <input type="text" value={perfil.cargo} onChange={(e) => update('cargo', e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Especialidad</label>
              <input type="text" value={perfil.especialidad ?? ''} onChange={(e) => update('especialidad', e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Institución Asociada</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🏥</span>
                <input type="text" value={perfil.institucion ?? ''} onChange={(e) => update('institucion', e.target.value)}
                  className="h-10 w-full rounded-xl border border-gray-200 pl-8 pr-3 text-sm focus:border-brand focus:outline-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuración de la Cuenta */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Settings className="h-5 w-5 text-brand" />
          <h3 className="font-semibold text-gray-900">Configuración de la Cuenta</h3>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="mb-3 text-sm font-medium text-gray-700">Seguridad</h4>
            <button className="flex items-center gap-2 text-sm font-medium text-brand hover:underline">
              🔒 Cambiar contraseña
            </button>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-medium text-gray-700">Preferencias de Notificación</h4>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={perfil.notifAlertasStock}
                  onChange={(e) => update('notifAlertasStock', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand" />
                <span className="text-sm text-gray-700">Recibir alertas de stock farmacéutico</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={perfil.notifNuevosProtocolos}
                  onChange={(e) => update('notifNuevosProtocolos', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand" />
                <span className="text-sm text-gray-700">Notificaciones de nuevos protocolos</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3">
        {success && (
          <div className="flex items-center gap-1.5 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            Cambios guardados
          </div>
        )}
        <button className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancelar
        </button>
        <button onClick={handleSave} disabled={saving}
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-light disabled:opacity-50">
          {saving ? <Loader2 className="mr-1 inline h-4 w-4 animate-spin" /> : null}
          Guardar cambios
        </button>
      </div>
    </div>
  );
}

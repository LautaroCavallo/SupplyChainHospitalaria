import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import {
  getProveedores,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
} from '../api/proveedores';
import type { Proveedor, PaginatedResponse } from '../types';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';
import SearchInput from '../components/common/SearchInput';
import Modal from '../components/common/Modal';

interface ProveedorForm {
  razonSocial: string;
  cuit: string;
  direccion: string;
  telefono: string;
  email: string;
  contacto: string;
}

const emptyForm: ProveedorForm = { razonSocial: '', cuit: '', direccion: '', telefono: '', email: '', contacto: '' };

export default function Proveedores() {
  const [data, setData] = useState<PaginatedResponse<Proveedor> | null>(null);
  const [page, setPage] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProveedorForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<Proveedor | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProveedores({ page, limit: 10, busqueda: busqueda || undefined });
      setData(res);
    } catch {
      setError('Error al cargar los proveedores');
    } finally {
      setLoading(false);
    }
  }, [page, busqueda]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [busqueda]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (p: Proveedor) => {
    setEditingId(p.id);
    setForm({
      razonSocial: p.razonSocial,
      cuit: p.cuit,
      direccion: p.direccion ?? '',
      telefono: p.telefono ?? '',
      email: p.email ?? '',
      contacto: p.contacto ?? '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.razonSocial.trim()) {
      setFormError('La razón social es requerida');
      return;
    }
    if (!form.cuit.trim()) {
      setFormError('El CUIT es requerido');
      return;
    }
    try {
      setSaving(true);
      setFormError(null);
      const payload = {
        razonSocial: form.razonSocial,
        cuit: form.cuit,
        direccion: form.direccion || undefined,
        telefono: form.telefono || undefined,
        email: form.email || undefined,
        contacto: form.contacto || undefined,
      };
      if (editingId) {
        await actualizarProveedor(editingId, payload);
      } else {
        await crearProveedor(payload);
      }
      setModalOpen(false);
      await fetchData();
    } catch {
      setFormError('Error al guardar el proveedor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      setDeleting(true);
      await eliminarProveedor(deleteConfirm.id);
      setDeleteConfirm(null);
      await fetchData();
    } catch {
      setError('Error al eliminar el proveedor');
    } finally {
      setDeleting(false);
    }
  };

  const updateField = (field: keyof ProveedorForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestión de proveedores y distribuidores farmacéuticos
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800"
        >
          <Plus className="h-4 w-4" />
          Nuevo Proveedor
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="max-w-sm">
            <SearchInput
              value={busqueda}
              onChange={setBusqueda}
              placeholder="Buscar por razón social o CUIT..."
            />
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-teal-700" />
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={fetchData} className="rounded-lg bg-teal-700 px-4 py-2 text-sm text-white hover:bg-teal-800">
              Reintentar
            </button>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Razón Social
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    CUIT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.data.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {p.razonSocial}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.cuit}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.telefono ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.email ?? '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.contacto ?? '—'}</td>
                    <td className="px-6 py-4">
                      <Badge
                        label={p.activo ? 'Activo' : 'Inactivo'}
                        variant={p.activo ? 'success' : 'default'}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(p)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data?.data.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">
                      No se encontraron proveedores
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <p className="text-sm text-gray-500">
                Mostrando {data?.data.length ?? 0} de {data?.total ?? 0} proveedores
              </p>
              <Pagination
                page={page}
                totalPages={data?.totalPages ?? 1}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Razón Social *</label>
            <input
              type="text"
              value={form.razonSocial}
              onChange={(e) => updateField('razonSocial', e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">CUIT *</label>
            <input
              type="text"
              value={form.cuit}
              onChange={(e) => updateField('cuit', e.target.value)}
              placeholder="XX-XXXXXXXX-X"
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Dirección</label>
            <input
              type="text"
              value={form.direccion}
              onChange={(e) => updateField('direccion', e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="text"
                value={form.telefono}
                onChange={(e) => updateField('telefono', e.target.value)}
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Contacto</label>
            <input
              type="text"
              value={form.contacto}
              onChange={(e) => updateField('contacto', e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Eliminar Proveedor"
        size="sm"
      >
        <div>
          <p className="text-sm text-gray-600">
            ¿Está seguro que desea eliminar al proveedor{' '}
            <span className="font-semibold">{deleteConfirm?.razonSocial}</span>?
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

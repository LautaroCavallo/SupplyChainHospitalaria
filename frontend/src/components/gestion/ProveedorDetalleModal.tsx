import { Phone, Mail, CreditCard, User, Clock } from 'lucide-react';
import type { Proveedor } from '../../types';
import Badge from '../common/Badge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  proveedor: Proveedor | null;
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function ProveedorDetalleModal({ isOpen, onClose, proveedor }: Props) {
  if (!isOpen || !proveedor) return null;

  const initials = getInitials(proveedor.razonSocial);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-4 border-b border-gray-100 px-7 py-6">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gray-200 text-base font-bold text-gray-700">
            {initials}
          </div>
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl font-bold text-brand">{proveedor.razonSocial}</h2>
            <Badge label={proveedor.activo ? 'Activo' : 'Inactivo'} variant={proveedor.activo ? 'success' : 'default'} />
          </div>
        </div>

        {/* Cards: 3 + 2 layout */}
        <div className="p-7">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Persona de Contacto</p>
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-brand" />
                <p className="text-sm font-semibold text-gray-900">{proveedor.contacto ?? '—'}</p>
              </div>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Teléfono</p>
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-brand" />
                <p className="text-sm font-semibold text-gray-900">{proveedor.telefono ?? '—'}</p>
              </div>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">CUIT</p>
              <div className="flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-brand" />
                <p className="text-sm font-semibold text-gray-900">{proveedor.cuit}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Correo Electrónico</p>
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-brand" />
                <p className="text-sm font-semibold text-gray-900">{proveedor.email ?? '—'}</p>
              </div>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Plazo de Pago</p>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-brand" />
                <p className="text-sm font-semibold text-gray-900">{proveedor.plazoPago ?? '30 días'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

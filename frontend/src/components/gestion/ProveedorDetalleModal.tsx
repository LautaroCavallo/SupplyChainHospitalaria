import { X, Phone, Mail, CreditCard, User, Clock } from 'lucide-react';
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

  const infoCards = [
    { icon: User, label: 'Persona de Contacto', value: proveedor.contacto ?? '—' },
    { icon: Phone, label: 'Teléfono', value: proveedor.telefono ?? '—' },
    { icon: CreditCard, label: 'CUIT', value: proveedor.cuit },
    { icon: Mail, label: 'Correo Electrónico', value: proveedor.email ?? '—' },
    { icon: Clock, label: 'Plazo de Pago', value: proveedor.plazoPago ?? '30 días' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-sm font-bold text-white">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900">{proveedor.razonSocial}</h2>
                <Badge label={proveedor.activo ? 'ACTIVO' : 'INACTIVO'} variant={proveedor.activo ? 'success' : 'default'} />
              </div>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 p-6">
          {infoCards.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border border-gray-100 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Icon className="h-4 w-4 text-brand" />
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
              </div>
              <p className="text-sm font-medium text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t border-gray-100 px-6 py-4">
          <button onClick={onClose} className="rounded-xl bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-light">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

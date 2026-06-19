import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import type { AlertaStockCritico } from '../../types';

interface AlertasCarouselProps {
  alertas: AlertaStockCritico[];
  onCrearSolicitud: (alerta: AlertaStockCritico) => void;
}

export default function AlertasCarousel({ alertas, onCrearSolicitud }: AlertasCarouselProps) {
  const navigate = useNavigate();
  const scrollContainer = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainer.current) {
      // Desplazar un "grupo" igual al ancho visible del contenedor (3 tarjetas)
      const scrollAmount = scrollContainer.current.clientWidth;
      scrollContainer.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const esCritico = (a: AlertaStockCritico) =>
    a.nivel === 'CRITICO' || a.nivel === 'SIN_STOCK' || a.stockActual <= a.stockCritico;

  return (
    <div className="mb-6 rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-3 w-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900">Medicamentos próximos a Stock Crítico</span>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
            {alertas.length} ALERTAS
          </span>
        </div>
        <button
          onClick={() => navigate('/inventario')}
          className="flex items-center gap-1 text-xs font-bold text-brand hover:underline"
        >
          Ver inventario completo →
        </button>
      </div>

      {/* Carrusel */}
      <div className="relative">
        {alertas.length > 3 && (
          <>
            <button
              onClick={() => scroll('left')}
              className="absolute -left-4 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-600 shadow hover:bg-gray-50"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="absolute -right-4 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-600 shadow hover:bg-gray-50"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        <div
          ref={scrollContainer}
          className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden"
          style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {alertas.map((alerta) => {
            const critico = esCritico(alerta);
            return (
              <div
                key={alerta.id}
                className="flex flex-shrink-0 items-center justify-between gap-4 rounded-[2rem] border bg-white p-4 shadow-sm"
                style={{
                  width: 'calc((100% - 2 * 1rem) / 3)',
                  borderColor: critico ? 'rgba(186, 26, 26, 0.2)' : 'rgba(188, 152, 82, 0.2)',
                }}
              >
                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-brand">{alerta.nombre}</p>
                  <p
                    className="truncate text-[10px] uppercase text-gray-500"
                    style={{ letterSpacing: '-0.05em' }}
                  >
                    {alerta.proveedorNombre ?? '—'}
                  </p>

                  {/* Stock / Mínimo */}
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] uppercase text-gray-500">Stock</span>
                      <span className="text-sm font-bold" style={{ color: '#BC9852' }}>
                        {alerta.stockActual}
                      </span>
                    </div>
                    <div className="h-6 w-px" style={{ backgroundColor: 'rgba(192, 201, 194, 0.2)' }} />
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] uppercase text-gray-500">Mínimo</span>
                      <span className="text-sm font-medium text-gray-500">{alerta.stockMinimo}</span>
                    </div>
                  </div>
                </div>

                {/* Botón carrito */}
                <button
                  onClick={() => onCrearSolicitud(alerta)}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-light"
                  title="Crear solicitud"
                >
                  <ShoppingCart className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

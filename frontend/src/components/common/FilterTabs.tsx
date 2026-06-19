import { useState, useRef, useLayoutEffect } from 'react';

interface Tab {
  label: string;
  value: string;
}

interface FilterTabsProps {
  tabs: Tab[];
  active: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'lg';
}

export default function FilterTabs({ tabs, active, onChange, size = 'lg' }: FilterTabsProps) {
  const isSmall = size === 'sm';
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement>>({});
  const [sliderStyle, setSliderStyle] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const [enableTransition, setEnableTransition] = useState(false);

  // Posicionar el slider antes del paint para evitar animación inicial
  useLayoutEffect(() => {
    const activeButton = buttonRefs.current[active];
    const container = containerRef.current;

    if (activeButton && container) {
      setSliderStyle({
        left: activeButton.offsetLeft,
        top: activeButton.offsetTop,
        width: activeButton.offsetWidth,
        height: activeButton.offsetHeight,
      });
    }

    // Habilitar transiciones solo tras el primer posicionamiento (siguiente frame)
    if (!enableTransition) {
      const id = requestAnimationFrame(() => setEnableTransition(true));
      return () => cancelAnimationFrame(id);
    }
  }, [active]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center gap-2 rounded-full"
      style={{
        backgroundColor: '#F8FAFC',
        border: '1px solid rgba(192, 201, 194, 0.2)',
        padding: isSmall ? '2px' : '4px',
        gap: isSmall ? '4px' : '8px',
      }}
    >
      {/* Slider background */}
      <div
        className="absolute rounded-full"
        style={{
          backgroundColor: '#003D2B',
          left: `${sliderStyle?.left ?? 0}px`,
          top: `${sliderStyle?.top ?? 0}px`,
          width: `${sliderStyle?.width ?? 0}px`,
          height: `${sliderStyle?.height ?? 0}px`,
          opacity: sliderStyle ? 1 : 0,
          transition: enableTransition ? 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          pointerEvents: 'none',
        }}
      />

      {/* Buttons */}
      {tabs.map((tab) => (
        <button
          key={tab.value}
          ref={(el) => {
            if (el) buttonRefs.current[tab.value] = el;
          }}
          onClick={() => onChange(tab.value)}
          className="relative rounded-full whitespace-nowrap transition-colors z-10"
          style={{
            color: active === tab.value ? '#FFFFFF' : '#404944',
            fontWeight: active === tab.value ? 700 : 500,
            padding: isSmall ? '4px 12px' : '10px 24px',
            fontSize: isSmall ? '12px' : '14px',
            lineHeight: isSmall ? '1.3' : '1.43',
            transitionDuration: '300ms',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

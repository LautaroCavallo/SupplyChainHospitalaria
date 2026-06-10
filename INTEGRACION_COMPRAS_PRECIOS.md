# Integración Compras — Estrategia de Precios Deterministas (Opción 3)

## Contexto
En el modo mock actual (Opción 2), los precios unitarios se generan aleatoriamente en cada ejecución.
La Opción 3 permite precios consistentes entre ejecuciones del mock usando un hash del nombre del producto.

## Cómo implementarlo

En `backend/src/infrastructure/external/fixtures/ComprasFixtureService.ts`, reemplazar la línea de precio aleatorio:

```typescript
// ACTUAL (Opción 2 - aleatorio)
const precioUnitario = Math.round((Math.random() * 4900 + 100) * 100) / 100;

// OPCIÓN 3 - determinista por nombre de producto
function hashPrice(nombre: string): number {
  let hash = 5381;
  for (let i = 0; i < nombre.length; i++) {
    hash = ((hash << 5) + hash) ^ nombre.charCodeAt(i);
    hash = hash >>> 0; // unsigned 32-bit
  }
  // Mapear a rango [100, 5000]
  return Math.round(((hash % 4900) + 100) * 100) / 100;
}
const precioUnitario = hashPrice(item.nombre);
```

## Ventajas
- El mismo producto siempre tiene el mismo precio en el mock
- Facilita comparar corridas y escribir tests
- No requiere base de datos de precios

## Cuándo activarlo
- Cuando se necesite estabilidad en demos repetidas
- Cuando se escriban tests E2E que validen importes
- Antes de la entrega final si Compras real no está disponible

## Limitaciones
- Los precios siguen siendo ficticios (no representan valores reales)
- El hash puede colisionar (dos productos distintos → mismo precio), aunque es poco probable

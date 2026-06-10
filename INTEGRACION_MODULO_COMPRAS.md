# Integración Módulo 3 (Farmacia) ↔ Módulo 7 (Compras)

## Contexto

Desde **Farmacia (Módulo 3)** generamos Órdenes de Compra sin importes.
Ustedes actúan como **Módulo de Compras**: reciben la OC, realizan la licitación
(fuera de nuestro scope), y nos devuelven la adjudicación con proveedor, precios y plazo.

---

## Lo que necesitamos de ustedes

### 1. URL de su endpoint para recibir la OC

Cuando tengan el endpoint listo, nos pasan la URL y la configuramos en nuestra variable
de entorno `COMPRAS_URL`. Sin cambios de código de nuestra parte.

---

## Contrato de integración

### Envío de OC — Farmacia → Compras

`POST {COMPRAS_URL}`

```json
{
  "ordenCompraId": "uuid",
  "solicitudCompraId": "uuid",
  "prioridad": "BAJA | NORMAL | ALTA | URGENTE",
  "proveedorSugerido": {
    "id": "uuid",
    "razonSocial": "Droguería Ejemplo",
    "cuit": "30-71234567-8"
  },
  "items": [
    {
      "productoId": "uuid",
      "nombre": "Amoxicilina 500mg",
      "cantidad": 50,
      "unidad": "unidad",
      "especificaciones": "Caja x 30"
    }
  ],
  "motivo": "Stock crítico",
  "fechaGeneracion": "2026-06-09T00:00:00.000Z",
  "callbackUrl": "http://nuestro-backend/api/v1/solicitudes-compra/{id}/confirmacion-adjudicacion"
}
```

**Respuesta inmediata esperada (acuse de recibo):**

```json
{
  "exitoso": true,
  "ordenCompraExternaId": "OC-COMPRAS-123",
  "mensaje": "OC recibida",
  "errores": []
}
```

---

### Callback de adjudicación — Compras → Farmacia

Una vez finalizada la licitación, nos llaman al `callbackUrl` que viaja en el payload anterior.

`POST /api/v1/solicitudes-compra/{id}/confirmacion-adjudicacion`

**Si aprueban/adjudican:**

```json
{
  "aprobado": true,
  "referenciaExterna": "OC-COMPRAS-123",
  "proveedorAdjudicado": {
    "razonSocial": "Proveedor Adjudicado SA"
  },
  "itemsAdjudicados": [
    {
      "productoId": "mismo uuid que mandamos",
      "cantidadAprobada": 50,
      "precioUnitario": 1250.75
    }
  ],
  "fechaAprobacion": "2026-06-09T00:00:00.000Z",
  "fechaEntregaEstimada": "2026-06-19T00:00:00.000Z",
  "observaciones": "Adjudicado por licitación pública"
}
```

**Si rechazan:**

```json
{
  "aprobado": false,
  "referenciaExterna": "OC-COMPRAS-123",
  "observaciones": "Sin capital disponible"
}
```

---

## Consideraciones importantes

| Punto | Detalle |
|---|---|
| **Precios** | La OC de Farmacia no incluye precios. Los precios los definen ustedes en la adjudicación. |
| **Proveedor sugerido** | Es opcional. Pueden ignorarlo y adjudicar a otro proveedor. |
| **productoId en items adjudicados** | Necesitamos que devuelvan el mismo `productoId` que mandamos para cruzarlo con nuestro inventario. |
| **Fecha estimada de entrega** | Recomendamos ~10 días desde la aprobación. |
| **Licitación** | El proceso de licitación queda completamente en el scope de Compras. Nosotros solo enviamos y recibimos. |

---

## Estado actual de nuestra implementación

- ✅ Endpoint de envío implementado
- ✅ Endpoint de callback implementado y funcional
- ✅ Mock activo para desarrollo (simula adjudicación automática con precios aleatorios)
- ⏳ Esperando URL del endpoint de Compras para activar integración real

---

## Contacto

Módulo 3 — Farmacia e Insumos Hospitalarios  
Repositorio: https://github.com/LautaroCavallo/SupplyChainHospitalaria  
Swagger: `http://localhost:3001/api/docs` → sección **"Solicitudes de Compra"**

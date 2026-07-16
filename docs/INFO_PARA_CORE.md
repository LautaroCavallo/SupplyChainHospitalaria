# Módulo 3 — Farmacia e Insumos Hospitalarios

**Información para el equipo de Core (Módulo 10)** — para enrutamiento, colas, eventos y permisos.

---

## 1. Nombre del módulo / microservicio

**Farmacia e Insumos Hospitalarios** — Módulo 3.
Identificador: `modulo3-farmacia`

## 2. URLs base de las APIs

| Recurso | URL |
|---|---|
| **Backend (API REST)** | `https://back-modulo3-farmacia-production.up.railway.app/api/v1` |
| Health check | `https://back-modulo3-farmacia-production.up.railway.app/health` |
| Documentación (Swagger) | `https://back-modulo3-farmacia-production.up.railway.app/api/docs` |
| **Frontend** | `https://front-modulo3-farmacia.vercel.app` |

## 3. Con qué otros microservicios nos comunicamos (salientes)

| Módulo | Qué necesitamos / acción | Cómo |
|---|---|---|
| **Core (Mód. 10)** | Autenticación: validamos los JWT que emite Core (JWKS RS256), y usamos `POST /auth/login` y `POST /auth/sso-exchange`. | REST + JWKS (`/.well-known/jwks.json`) |
| **Módulo 7 (Compras / Facturación)** | Le enviamos **órdenes de compra** cuando un insumo llega al punto de reorden. Esperamos el acuse y, luego, la **adjudicación/rechazo** (por callback). | REST **vía API Gateway de Core**: `POST https://gw.healthcare.cantero.ar/api/billing/compras/ordenes-compra` con `Authorization: Bearer <JWT de Core>` (el Gateway agrega la API key de Facturación) — **probado (HTTP 201)** |
| **HCE (Mód. 1)** | Dispensación de recetas: `GET /api/v1/recetas/{id}` (validar + alertas), `PATCH /api/v1/recetas/{id}/dispensar` (marcar dispensada). | REST con JWT de Core — **integrado y probado** |

> **Pedido a Core:** una **cuenta de servicio propia de Farmacia** con los permisos necesarios para autenticarnos (y, si algún flujo va por el bus, `events:log:publish`).

## 4. Qué otros microservicios nos hacen solicitudes (entrantes) — qué ofrecemos

| Quién nos llama | Qué le ofrecemos |
|---|---|
| **Módulo 7 (Compras)** | **Callback de adjudicación** de una orden de compra: `POST /api/v1/solicitudes-compra/{id}/confirmacion-adjudicacion` (nuestro backend expone `https://`; probado end-to-end → solicitud queda `APROBADA`) |
| **Módulos que necesiten stock / dispensación** (HCE, Portal, etc.) | `GET /api/v1/inventario` · `GET /api/v1/inventario/{id}` · `GET /api/v1/inventario/ean/{ean}` (stock) · `GET /api/v1/alertas/stock-critico` (insumos en punto de reorden) · `POST /api/v1/recetas/{id}/validar` y `POST /api/v1/recetas/{id}/consumir` (dispensación) |
| **Usuarios vía SSO** | `GET /auth/sso?ticket=…` (canje de ticket SSO → sesión en Farmacia) |

## Gateway / API key / colas / permisos

- Consumimos **Módulo 7 a través del API Gateway de Core** (`/api/billing`), enviando solo el **JWT de Core**; el Gateway agrega la API key de Facturación.
- **API key de Farmacia (`pharmacy-secret-key`):** entendemos que el Gateway la agrega (`x-api-key`) al reenviarnos solicitudes a nosotros. Queda **pendiente de nuestro lado validar ese header** en los requests que llegan por el Gateway. Confirmar con Core cómo/ cuándo la reenvía.
- **Colas (RabbitMQ):** hoy **no las usamos** — las integraciones (Compras, HCE, Core) son REST. Si más adelante pasamos algún flujo a asíncrono (o para garantizar el procesamiento de mensajes que lleguen durante una caída), pediríamos `modulo3-farmacia.requests` / `.responses`.
- **Necesitamos de Core:** una **cuenta de servicio propia de Farmacia** (hoy usamos credenciales de prueba) con los permisos para autenticarnos vía el Gateway.

---

## Stack técnico (referencia)

- **Backend:** Node.js + TypeScript + Express (Clean Architecture). Base SQLite (Prisma). Desplegado en Railway.
- **Frontend:** React + Vite + TailwindCSS. Desplegado en Vercel.
- **Auth:** JWT RS256 validado localmente contra el JWKS de Core (sin llamar a Core por request).

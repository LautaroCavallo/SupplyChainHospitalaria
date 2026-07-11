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
| **Módulo 7 (Compras / Facturación)** | Le enviamos **órdenes de compra** cuando un insumo llega al punto de reorden. Esperamos el acuse y, luego, la **adjudicación/rechazo** (por callback). | REST: `POST /api/compras/ordenes-compra` con `Authorization: Bearer <JWT de Core>` — **ya probado (HTTP 201)** |
| **HCE (Mód. 1)** | Dispensación de recetas: `GET /api/v1/recetas/{id}` (validar + alertas), `PATCH /api/v1/recetas/{id}/dispensar` (marcar dispensada). | REST con JWT de Core — **integrado y probado** |

> **Pedido a Core:** una **cuenta de servicio propia de Farmacia** con los permisos necesarios para autenticarnos (y, si algún flujo va por el bus, `events:log:publish`).

## 4. Qué otros microservicios nos hacen solicitudes (entrantes) — qué ofrecemos

| Quién nos llama | Qué le ofrecemos |
|---|---|
| **Módulo 7 (Compras)** | **Callback de adjudicación** de una orden de compra: `POST /api/v1/solicitudes-compra/{id}/confirmacion-adjudicacion` |
| **Módulos que necesiten stock / dispensación** (HCE, Portal, etc.) | `GET /api/v1/inventario` · `GET /api/v1/inventario/{id}` · `GET /api/v1/inventario/ean/{ean}` (stock) · `GET /api/v1/alertas/stock-critico` (insumos en punto de reorden) · `POST /api/v1/recetas/{id}/validar` y `POST /api/v1/recetas/{id}/consumir` (dispensación) |
| **Usuarios vía SSO** | `GET /auth/sso?ticket=…` (canje de ticket SSO → sesión en Farmacia) |

## Colas / eventos / permisos

- La integración con **Módulo 7 es REST directo** (no usa el bus de eventos).
- Si Core prefiere enrutarla por **RabbitMQ**, podemos crear las colas `modulo3-farmacia.requests` y `modulo3-farmacia.responses` y los eventos correspondientes.
- **Necesitamos:** cuenta de servicio + permisos asignados por Core para autenticarnos (y publicar en `/events/log` si aplica).

---

## Stack técnico (referencia)

- **Backend:** Node.js + TypeScript + Express (Clean Architecture). Base SQLite (Prisma). Desplegado en Railway.
- **Frontend:** React + Vite + TailwindCSS. Desplegado en Vercel.
- **Auth:** JWT RS256 validado localmente contra el JWKS de Core (sin llamar a Core por request).

# SupplyChainHospitalaria

Controla el stock de medicamentos en farmacias y depósitos.

Sistema de gestión de farmacia e insumos hospitalarios (Health Grid — Módulo 3). Módulo independiente, desacoplado y reutilizable, parte de la arquitectura distribuida **Health Grid**.

## Arquitectura

```
Clean Architecture + Repository Pattern + Adapter Pattern

backend/src/
├── domain/          → Entidades, interfaces de repositorios y servicios
├── application/     → Casos de uso, DTOs, errores de aplicación
├── infrastructure/  → Prisma repos, adapters externos (fixtures/http/core/hce), contenedor DI
└── interfaces/      → Controllers REST, rutas, middleware, Swagger

frontend/src/
├── api/             → Cliente HTTP y funciones de API
├── components/      → Componentes reutilizables (layout, common, compras, gestion, inventario, recepciones)
├── pages/           → Páginas principales
├── utils/           → Utilidades (ordenamiento, etc.)
└── types/           → TypeScript interfaces
```

## Stack Tecnológico

| Componente | Tecnología |
|---|---|
| Backend | Node.js + TypeScript + Express |
| Base de datos | SQLite (Prisma ORM, fácil migración a PostgreSQL) |
| Frontend | React 19 + TypeScript + Vite + TailwindCSS |
| Documentación API | Swagger/OpenAPI 3.0 |
| Iconos | Lucide React |

## Inicio Rápido

### Requisitos
- Node.js >= 18
- npm >= 9

### Instalación

```bash
# Backend
cd backend
npm install
npx prisma migrate dev --name init
npm run prisma:seed        # Datos de ejemplo
npm run dev                # http://localhost:3001

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev                # http://localhost:5173
```

### URLs

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001/api/v1 |
| Swagger Docs | http://localhost:3001/api/docs |
| Health Check | http://localhost:3001/health |

## API Endpoints

> Documentación interactiva completa en Swagger: **http://localhost:3001/api/docs**

### Autenticación
- `POST /api/v1/auth/login` — Login (delegado al Core; `AUTH_MODE=mock` por defecto)

### Dashboard
- `GET /api/v1/dashboard` — Resumen / KPIs del dashboard
- `GET /api/v1/dashboard/actividad-reciente?page=&limit=&busqueda=&usuario=&evento=&desde=&hasta=` — Registro de actividad

### Medicamentos
- `GET /api/v1/medicamentos?page=&limit=&busqueda=&categoria=&estado=` — Listar (sin `estado` devuelve activos e inactivos)
- `GET /api/v1/medicamentos/summary` — Totales (total/activos/inactivos)
- `POST /api/v1/medicamentos` — Crear medicamento
- `PUT /api/v1/medicamentos/:id` — Actualizar medicamento
- `DELETE /api/v1/medicamentos/:id` — Eliminar (baja lógica)

### Vademécum (Fixture Alfabeta)
- `GET /api/v1/vademecum/search?q=amoxicilina` — Buscar medicamentos
- `GET /api/v1/vademecum/:id` — Obtener medicamento por ID

### Proveedores
- `GET /api/v1/proveedores?page=1&limit=20&busqueda=` — Listar proveedores
- `GET /api/v1/proveedores/:id` — Obtener proveedor
- `POST /api/v1/proveedores` — Crear proveedor
- `PUT /api/v1/proveedores/:id` — Actualizar proveedor
- `DELETE /api/v1/proveedores/:id` — Eliminar proveedor (soft delete)

### Inventario
- `GET /api/v1/inventario?page=1&limit=20&busqueda=&categoria=&estado=` — Listar inventario
- `GET /api/v1/inventario/summary` — Resumen de stock (total/bajo stock/sin stock)
- `GET /api/v1/inventario/ean/:ean` — Buscar producto por código EAN
- `GET /api/v1/inventario/:id` — Detalle de producto
- `POST /api/v1/inventario/:id/ajuste` — Ajustar stock (incremento/decremento)
- `GET /api/v1/inventario/:id/movimientos` — Historial de movimientos
- `GET /api/v1/inventario/:id/lotes` — Lotes del producto
- `GET /api/v1/inventario/:id/lotes/:loteId/historial?tipo=&fechaDesde=&fechaHasta=` — Historial de movimientos de un lote

### Recepciones
- `GET /api/v1/recepciones?page=1&limit=20&estado=` — Listar recepciones
- `GET /api/v1/recepciones/:id` — Detalle de recepción
- `POST /api/v1/recepciones` — Crear recepción (BORRADOR)
- `PUT /api/v1/recepciones/:id` — Editar recepción
- `PUT /api/v1/recepciones/:id/confirmar` — Confirmar recepción
- `PUT /api/v1/recepciones/:id/procesar` — Procesar recepción (impacta stock)

### Alertas
- `GET /api/v1/alertas/stock-critico` — Productos con stock bajo/crítico/sin stock

### Solicitudes de Compra
- `GET /api/v1/solicitudes-compra?page=1&limit=10&estado=` — Listar solicitudes (paginado; estado: `BORRADOR`/`PENDIENTE`/`ENVIADA`/`APROBADA`/`RECHAZADA`)
- `GET /api/v1/solicitudes-compra/:id` — Detalle de solicitud
- `POST /api/v1/solicitudes-compra` — Crear solicitud (`estado`: `BORRADOR` o `PENDIENTE`)
- `PUT /api/v1/solicitudes-compra/:id` — Editar un borrador (agregar/modificar/eliminar items; solo estado BORRADOR)
- `DELETE /api/v1/solicitudes-compra/:id` — Eliminar un borrador (solo estado BORRADOR)
- `POST /api/v1/solicitudes-compra/:id/confirmar-borrador` — Confirmar borrador (BORRADOR → PENDIENTE)
- `POST /api/v1/solicitudes-compra/:id/enviar-compras` — Enviar a Compras (PENDIENTE → ENVIADA)
- `POST /api/v1/solicitudes-compra/:id/confirmacion-adjudicacion` — Callback de adjudicación (ENVIADA → APROBADA/RECHAZADA)

### Recetas (Mock)
- `POST /api/v1/recetas/:id/validar` — Validar receta
- `POST /api/v1/recetas/:id/consumir` — Consumir receta (impacta stock)

## Integraciones Externas

El módulo implementa el **Adapter Pattern** para todas las integraciones externas. Cada una tiene una implementación local (fixture) y otra real (HTTP), seleccionable por variable de entorno:

| Integración | Interface | Local (fixture/mock) | Real | Selector |
|---|---|---|---|---|
| Vademécum Alfabeta | `IVademecumService` | `VademecumFixtureService` | — | — |
| Módulo 1: Recetas (HCE) | `IRecetaService` | `RecetaFixtureService` | `HceRecetaService` | `RECETA_MODE` |
| Módulo 7: Compras | `IComprasService` | `ComprasFixtureService` | `HttpComprasService` | `COMPRAS_USE_MOCK` |
| Autenticación (Core) | `CoreAuthService` | modo `mock` | Core API | `AUTH_MODE` |

Para reemplazar una implementación local por la real, se cambia la variable de entorno correspondiente (o la instanciación en `infrastructure/container.ts`).

## Modelo de Datos

```
proveedores ─────┐
                  ├──→ productos_inventario ──→ lotes
                  │         │                    │
recepciones ──────┘         │                    │
  └── recepcion_detalles    └──→ movimientos_stock
                                      │
solicitudes_compra                    │
  └── solicitud_compra_detalles ──────┘
```

### Trazabilidad
- Por **EAN** (código de barras)
- Por **Troquel** (código farmacéutico argentino)
- Por **Lote** (número de lote del laboratorio)
- Por **Fecha de vencimiento** (control de caducidad)

## Lógica de Negocio

### Niveles de Stock
- **NORMAL**: stock > stockMínimo
- **BAJO**: stockCrítico < stock ≤ stockMínimo
- **CRÍTICO**: 0 < stock ≤ stockCrítico
- **SIN_STOCK**: stock = 0

### Flujo de Recepciones
```
BORRADOR → CONFIRMADA → PROCESADA
                            ↓
                     Crea lotes
                     Incrementa stock
                     Registra movimientos INGRESO
```

### Tipos de Movimiento
- `INGRESO` — Recepción de mercadería
- `EGRESO` — Salida general
- `AJUSTE_POSITIVO` — Corrección de inventario (+)
- `AJUSTE_NEGATIVO` — Corrección de inventario (-)
- `CONSUMO_RECETA` — Dispensación por receta médica

## Seguridad (OWASP)

- Validación de inputs con `express-validator`
- Sanitización XSS con `xss`
- Helmet para headers HTTP seguros
- CORS configurado
- DTOs para entrada/salida (protección contra mass assignment)
- Manejo de errores sin exposición de datos sensibles
- Autenticación delegada al Core (`AUTH_MODE`, middleware `auth`), con modo mock para desarrollo
- Logging con Winston (sin datos sensibles)

## Variables de Entorno

```env
DATABASE_URL="file:./dev.db"
PORT=3001
NODE_ENV=development
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:5173

# Integraciones externas
AUTH_MODE=mock                 # mock | core
RECETA_MODE=mock               # mock | hce
COMPRAS_USE_MOCK=true          # true usa fixture, false llama a COMPRAS_URL
COMPRAS_URL=                   # URL del Módulo 7 (Compras)
CORE_API_URL=                  # URL del Core (auth)
HCE_API_URL=                   # URL del Módulo 1 (recetas/HCE)
EXTERNAL_TIMEOUT_MS=8000
```

## Estructura de Archivos

```
SupplyChainHospitalaria/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # Esquema de base de datos
│   │   ├── seed.ts               # Datos de ejemplo
│   │   └── migrations/           # Migraciones SQL
│   ├── src/
│   │   ├── domain/
│   │   │   ├── entities/         # Entidades de dominio
│   │   │   ├── repositories/     # Interfaces de repositorio
│   │   │   └── services/         # Interfaces de servicio externo
│   │   ├── application/
│   │   │   ├── dtos/             # DTOs de entrada/salida
│   │   │   ├── errors/           # Errores de aplicación
│   │   │   └── use-cases/        # Casos de uso (inventario, recepciones, solicitudes, recetas, dashboard, etc.)
│   │   ├── infrastructure/
│   │   │   ├── database/         # Repositorios Prisma
│   │   │   ├── external/         # Adapters externos: fixtures/, compras/, core/, hce/
│   │   │   └── container.ts      # Contenedor DI
│   │   └── interfaces/
│   │       ├── http/
│   │       │   ├── controllers/  # Controladores REST
│   │       │   ├── routes/       # Archivos de rutas (auth, dashboard, medicamentos, inventario, recepciones, solicitudes, recetas, vademécum, proveedores, alertas)
│   │       │   └── middleware/   # auth, errorHandler, sanitize
│   │       └── swagger/          # Configuración OpenAPI
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                  # Módulos de API (auth, dashboard, inventario, medicamentos, compras, recepciones, etc.)
│   │   ├── components/           # Componentes UI
│   │   │   ├── layout/           # Sidebar, Header, Layout
│   │   │   ├── common/           # Badge, Modal, Pagination, FilterTabs, ConfirmModal, SortableTh, etc.
│   │   │   ├── compras/          # NuevaSolicitudModal, VerSolicitudModal, AlertasCarousel
│   │   │   ├── gestion/          # MedicamentoModal, ProveedorFormModal, ProveedorDetalleModal
│   │   │   ├── inventario/       # AjusteStockModal
│   │   │   └── recepciones/      # RecepcionDetalleModal
│   │   ├── pages/                # Páginas (Dashboard, Inventario, Compras, Recepciones, Gestión, etc.)
│   │   ├── utils/                # Utilidades (sort)
│   │   └── types/                # TypeScript interfaces
│   └── package.json
└── README.md
```

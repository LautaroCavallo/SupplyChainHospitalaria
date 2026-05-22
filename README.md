# SupplyChainHospitalaria

Controla el stock de medicamentos en farmacias y depósitos.

Sistema de gestión de farmacia e insumos hospitalarios (Health Grid — Módulo 3). Módulo independiente, desacoplado y reutilizable, parte de la arquitectura distribuida **Health Grid**.

## Arquitectura

```
Clean Architecture + Repository Pattern + Adapter Pattern

backend/src/
├── domain/          → Entidades, interfaces de repositorios y servicios
├── application/     → Casos de uso, DTOs, errores de aplicación
├── infrastructure/  → Prisma repos, mock adapters, contenedor DI
└── interfaces/      → Controllers REST, rutas, middleware, Swagger

frontend/src/
├── api/             → Cliente HTTP y funciones de API
├── components/      → Componentes reutilizables (layout, common, inventario)
├── pages/           → Páginas principales
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
npx prisma db seed        # Datos de ejemplo
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

### Vademécum (Mock Alfabeta)
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
- `GET /api/v1/inventario/:id` — Detalle de producto
- `POST /api/v1/inventario/:id/ajuste` — Ajustar stock (incremento/decremento)
- `GET /api/v1/inventario/:id/movimientos` — Historial de movimientos
- `GET /api/v1/inventario/:id/lotes` — Lotes del producto

### Recepciones
- `GET /api/v1/recepciones?page=1&limit=20&estado=` — Listar recepciones
- `GET /api/v1/recepciones/:id` — Detalle de recepción
- `POST /api/v1/recepciones` — Crear recepción (BORRADOR)
- `PUT /api/v1/recepciones/:id/confirmar` — Confirmar recepción
- `PUT /api/v1/recepciones/:id/procesar` — Procesar recepción (impacta stock)

### Alertas
- `GET /api/v1/alertas/stock-critico` — Productos con stock bajo/crítico/sin stock

### Solicitudes de Compra
- `GET /api/v1/solicitudes-compra` — Listar solicitudes
- `POST /api/v1/solicitudes-compra` — Crear solicitud

### Recetas (Mock)
- `POST /api/v1/recetas/:id/validar` — Validar receta
- `POST /api/v1/recetas/:id/consumir` — Consumir receta (impacta stock)

## Integraciones Mockeadas

El módulo implementa el **Adapter Pattern** para todas las integraciones externas:

| Integración | Interface | Mock | Futuro |
|---|---|---|---|
| Vademécum Alfabeta | `IVademecumService` | `MockVademecumService` | `RealVademecumService` |
| Módulo 1: Recetas | `IRecetaService` | `MockRecetaService` | `HttpRecetaService` |
| Módulo 7: Compras | `IComprasService` | `MockComprasService` | `HttpComprasService` |

Para reemplazar un mock por la implementación real, solo se necesita:
1. Crear la nueva clase que implemente la interface
2. Cambiar la instanciación en `infrastructure/container.ts`

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
- Preparado para autenticación JWT (middleware mock)
- Logging con Winston (sin datos sensibles)

## Variables de Entorno

```env
DATABASE_URL="file:./dev.db"
PORT=3001
NODE_ENV=development
JWT_SECRET=cambiar-en-produccion
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:5173
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
│   │   │   ├── entities/         # 6 entidades de dominio
│   │   │   ├── repositories/     # 6 interfaces de repositorio
│   │   │   └── services/         # 3 interfaces de servicio externo
│   │   ├── application/
│   │   │   ├── dtos/             # DTOs de entrada/salida
│   │   │   ├── errors/           # Errores de aplicación
│   │   │   └── use-cases/        # 22 casos de uso
│   │   ├── infrastructure/
│   │   │   ├── database/         # 7 repositorios Prisma
│   │   │   ├── external/mock/    # 3 servicios mock
│   │   │   └── container.ts      # Contenedor DI
│   │   └── interfaces/
│   │       ├── http/
│   │       │   ├── controllers/  # 7 controladores
│   │       │   ├── routes/       # 8 archivos de rutas
│   │       │   └── middleware/   # 3 middlewares
│   │       └── swagger/          # Configuración OpenAPI
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                  # 5 módulos de API
│   │   ├── components/           # Componentes UI
│   │   │   ├── layout/           # Sidebar, Header, Layout
│   │   │   ├── common/           # Badge, Modal, Pagination, Search
│   │   │   └── inventario/       # AjusteStockModal
│   │   ├── pages/                # 7 páginas
│   │   └── types/                # TypeScript interfaces
│   └── package.json
└── README.md
```

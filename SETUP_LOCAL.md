# Cómo levantar el proyecto localmente — Módulo 3 (Farmacia e Insumos)

Guía paso a paso para correr el módulo en tu máquina. Tiempo estimado: ~10 minutos.

El módulo tiene **3 piezas**:
| Pieza | Qué es | Puerto |
|---|---|---|
| **Backend** | API REST + worker (Node + TypeScript + Express + Prisma/SQLite) | `3001` |
| **Frontend** | React + Vite + TailwindCSS | `5173` |
| **Broker de eventos** | Redpanda (compatible con Kafka), vía Docker | `9092` |

---

## 1. Requisitos

- **Node.js 18 o superior** y **npm** → https://nodejs.org
- **Docker Desktop** (para el broker de eventos) → https://www.docker.com/products/docker-desktop
  - *Opcional:* si no querés usar Docker, ver [Modo sin Docker](#modo-sin-docker) más abajo.
- **Git**

Verificá que estén instalados:
```bash
node -v      # v18+
npm -v
docker -v
```

---

## 2. Clonar el repositorio

```bash
git clone https://github.com/LautaroCavallo/SupplyChainHospitalaria.git
cd SupplyChainHospitalaria
git checkout main
```

---

## 3. Levantar el broker de eventos (Docker)

Desde la **raíz** del proyecto:
```bash
docker compose up -d
```
Esto levanta **Redpanda** (Kafka) en `localhost:9092`. Verificá que esté corriendo:
```bash
docker ps        # debería aparecer el contenedor "scb-kafka"
```

---

## 4. Backend

En una terminal, desde la **raíz**:
```bash
cd backend
npm install
cp .env.example .env          # crea la config local (valores por defecto ya sirven)
npx prisma generate           # genera el cliente de la base
npx prisma migrate deploy     # crea la base SQLite y aplica las migraciones
npm run prisma:seed           # carga datos de ejemplo (correr una sola vez)
npm run dev                   # levanta la API en http://localhost:3001
```

En **otra terminal** (el worker que procesa la cola de eventos):
```bash
cd backend
npm run worker
```

> **Verificación:** abrí http://localhost:3001/health → debe responder `{"status":"ok"}`.
> Docs de la API (Swagger): http://localhost:3001/api/docs

---

## 5. Frontend

En **otra terminal**, desde la **raíz**:
```bash
cd frontend
npm install
npm run dev                   # levanta el front en http://localhost:5173
```

El front usa un proxy interno hacia `localhost:3001`, así que no necesita configuración extra.

---

## 6. Usar la aplicación

Abrí 👉 **http://localhost:5173**

La app pide **login**. En modo local (`AUTH_MODE=mock`) podés entrar con estos usuarios de prueba (**cualquier contraseña sirve**), cada uno con distintos permisos:

| Email | Rol | Acceso |
|---|---|---|
| `farmaceutico@healthgrid.dev` | Farmacéutico | **Completo** (inventario, compras, recepciones, etc.) |
| `auditor@healthgrid.dev` | Auditor | Solo lectura |
| `deposito@healthgrid.dev` | Depósito | Dashboard e inventario |

Para probar todo, entrá con **`farmaceutico@healthgrid.dev`**.

---

## Modo sin Docker

Si no querés instalar Docker, podés correr la app sin el broker de eventos (funciona todo menos el envío de órdenes de compra por eventos):

1. En `backend/.env`, poné:
   ```
   KAFKA_ENABLED=false
   ```
2. Seguí los pasos del backend y frontend, **saltando** el paso 3 (Docker) y el `npm run worker`.

## Modo 100% offline (sin los otros módulos)

Por defecto, el módulo se integra con Core, Compras (Módulo 7) y HCE (Módulo 1) reales, que requieren internet. Para correrlo **autocontenido** (sin depender de esos módulos), en `backend/.env` poné:
```
COMPRAS_USE_MOCK=true
RECETA_MODE=mock
```

---

## Problemas comunes

- **`prisma generate` / cliente no encontrado** → corré `npx prisma generate` de nuevo en `backend/`.
- **El seed falla con "Unique constraint"** → ya se cargó antes; es inofensivo, seguí adelante.
- **El front no trae datos** → verificá que el backend esté corriendo en `:3001` (paso 4).
- **El worker da "Connection timeout" a Kafka** → el broker no está arriba; corré `docker compose up -d` (paso 3) o usá el [Modo sin Docker](#modo-sin-docker).
- **Puerto ocupado** → cambiá `PORT` en `backend/.env` (y el proxy en `frontend/vite.config.ts` si movés el backend).

---

## Resumen de comandos (todo junto)

```bash
git clone https://github.com/LautaroCavallo/SupplyChainHospitalaria.git
cd SupplyChainHospitalaria && git checkout main

docker compose up -d                                   # broker

cd backend && npm install && cp .env.example .env
npx prisma generate && npx prisma migrate deploy && npm run prisma:seed
npm run dev            # terminal 1
npm run worker         # terminal 2 (otra ventana, en backend/)

cd ../frontend && npm install && npm run dev           # terminal 3
```
Abrí http://localhost:5173 y logueate con `farmaceutico@healthgrid.dev`.

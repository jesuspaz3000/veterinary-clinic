# VetGest — Sistema de Gestión Veterinaria

ERP web para clínicas veterinarias, desarrollado como proyecto personal full-stack. Centraliza en un solo sistema el control de citas, historiales clínicos, vacunación, desparasitación, cirugías, hospitalización, inventario, ventas/facturación y personal (veterinarios, groomers, administrativos), todo bajo un esquema de roles y permisos granular (RBAC).

- **Demo en vivo:** [veterinaria.yisusdynamics.cloud](https://veterinaria.yisusdynamics.cloud/) (acceso bajo solicitud de credenciales)
- **Repositorio:** este mismo repo

---

## Índice

- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
  - [Vista general](#vista-general)
  - [Backend](#backend-por-capas)
  - [Frontend](#frontend-por-features)
  - [Base de datos](#base-de-datos)
- [Seguridad y control de acceso](#seguridad-y-control-de-acceso)
- [Funcionalidades principales](#funcionalidades-principales)
- [Estructura de carpetas](#estructura-de-carpetas)
- [Cómo ejecutar el proyecto](#cómo-ejecutar-el-proyecto)
  - [Con Docker (recomendado)](#opción-1-docker-recomendado)
  - [Manual / desarrollo local](#opción-2-manual--desarrollo-local)
- [Despliegue en producción](#despliegue-en-producción)

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Java 21, Spring Boot 4, Spring Security, Spring Data JPA (Hibernate) |
| Auth | JWT (access + refresh token) con `jjwt`, cookies `HttpOnly`, blacklist de tokens en Redis |
| Base de datos | PostgreSQL 18 |
| Caché / sesiones | Redis 7 |
| Documentación API | springdoc-openapi (Swagger UI) |
| Generación de PDF | OpenPDF (recibos de venta) |
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| UI | Material UI (MUI) v9 |
| Estado global | Zustand |
| HTTP client | Axios (con interceptor de refresh automático) |
| Infraestructura | Docker, Docker Compose, Nginx (reverse proxy), Let's Encrypt (Certbot) |

---

## Arquitectura

### Vista general

El proyecto es un monorepo con dos aplicaciones independientes (`backend/` y `frontend/`) que se comunican por HTTP/REST, más Postgres y Redis como servicios de infraestructura. En producción, Nginx actúa como reverse proxy sobre un único dominio: enruta `/api/*` al backend y el resto al frontend, evitando así tener que lidiar con CORS entre subdominios distintos.

```
                        ┌─────────────────────┐
   Navegador  ───────▶  │        Nginx         │  (TLS, un solo dominio)
                        └──────────┬───────────┘
                    /api/*         │         resto de rutas
                 ┌──────────────┐  │  ┌──────────────────┐
                 │   Backend    │◀─┴─▶│     Frontend      │
                 │ Spring Boot  │     │  Next.js (SSR)    │
                 │  (puerto     │     │   (puerto 3000)   │
                 │   8080)      │     └──────────────────┘
                 └──────┬───────┘
                 ┌──────┴───────┐
                 │              │
          ┌──────▼─────┐ ┌──────▼─────┐
          │ PostgreSQL │ │   Redis    │
          │  (datos)   │ │ (blacklist │
          │            │ │  de JWT)   │
          └────────────┘ └────────────┘
```

### Backend (por capas)

El diseño del esquema de base de datos se hizo primero en [`vetgest_schema.dbml`](vetgest_schema.dbml) (40 tablas modeladas con [dbdiagram.io](https://dbdiagram.io)), y a partir de ahí se construyeron las entidades JPA. El backend está organizado **por módulo de dominio**, y cada módulo replica internamente la misma arquitectura en capas:

```
backend/src/main/java/com/veterinaria/backend/
├── <modulo>/                  # ej: pet, appointment, sales, vaccination...
│   ├── controller/            # Endpoints REST (@RestController, @PreAuthorize)
│   ├── dto/                   # Request/Response DTOs (entrada y salida de la API)
│   ├── mapper/                # Entidad <-> DTO
│   ├── model/                 # Entidades JPA
│   ├── repository/            # Spring Data JPA repositories
│   └── service/
│       ├── <Modulo>Service.java       # Interfaz
│       └── Impl/<Modulo>ServiceImpl.java  # Reglas de negocio
│
├── common/                    # Código transversal reutilizado por todos los módulos
│   ├── constants/              # Nombres de roles/permisos, etc.
│   ├── dto/                    # DTOs genéricos (paginación, respuestas de error)
│   ├── exception/               # Excepciones de negocio + manejador global (@ControllerAdvice)
│   ├── storage/                 # Abstracción de almacenamiento de archivos (fotos, avatars)
│   └── util/
│
└── config/                    # Configuración de la aplicación
    ├── security/                # Spring Security, filtro JWT, entry point de errores 401
    ├── cors/                    # Orígenes permitidos (parametrizado por variable de entorno)
    ├── application/              # Beans generales
    ├── bootstrap/                 # Seed inicial (rol SUPERADMIN + usuario admin)
    ├── fileupload/                 # Límites y ruta de subida de archivos
    ├── jackson/                    # Configuración de serialización JSON
    └── openapi/                    # Configuración de Swagger UI
```

Módulos de dominio implementados: `auth`, `user`, `role`, `owner`, `pet` (incluye fotos), `veterinarian`, `grooming`, `administrative`, `specialty`, `schedule`, `appointment`, `medicalrecord`, `clinicalhistory`, `vaccination`, `deworming`, `surgery`, `hospitalization`, `product` (catálogo + inventario), `sales` (facturación, pagos, notas de crédito, PDF) y `dashboard` (KPIs y métricas).

Cada endpoint valida el acceso a nivel de método con `@PreAuthorize` contra permisos granulares (ej. `PETS_READ`, `SALES_CREATE`), no solo contra el rol.

### Frontend (por features)

El frontend sigue una arquitectura **feature-based** (organizado por dominio de negocio, no por tipo de archivo), usando Next.js App Router para el enrutamiento:

```
frontend/src/
├── app/                        # Next.js App Router — solo páginas y layouts
│   ├── (dashboard)/              # Rutas protegidas: pets, appointments, sales, etc.
│   ├── login/
│   └── layout.tsx
│
├── features/                   # Un directorio por dominio de negocio
│   └── <feature>/                # ej: pets, appointments, sales, vaccinations...
│       ├── components/             # Tablas, diálogos de crear/editar/eliminar, formularios
│       ├── hooks/                  # Data-fetching y estado local del feature
│       ├── service/                 # Llamadas a la API (Axios) específicas del feature
│       └── type/                    # Tipos TypeScript del dominio
│
├── shared/                     # Reutilizable entre features
│   ├── components/                # CustomTable, WeeklyCalendar, layout del dashboard...
│   ├── config/                     # Definición de permisos (PERMISSIONS)
│   ├── constants/
│   ├── services/
│   └── types/
│
├── store/                       # Estado global (Zustand) — sesión, usuario, permisos
├── lib/                          # Cliente Axios (baseURL, refresh automático de token)
└── providers/                     # Theme de MUI (modo claro/oscuro)
```

Todos los módulos de listado (tablas) comparten el mismo componente `CustomTable`, que renderiza automáticamente como tabla en pantallas grandes y como tarjetas en móvil (con un único toggle por CSS, sin `useMediaQuery`, para evitar problemas de hidratación entre servidor y cliente).

### Base de datos

Esquema relacional en PostgreSQL, diseñado en [`vetgest_schema.dbml`](vetgest_schema.dbml) / [`vetgest_schema.dbdiagram`](vetgest_schema.dbdiagram) (importable en [dbdiagram.io](https://dbdiagram.io) para verlo como diagrama). Cubre, entre otras: usuarios/roles/permisos, personal (veterinarios, groomers, administrativos) con especialidades y horarios, dueños y mascotas (con historial de fotos), catálogo de productos con lotes e inventario, citas, historia clínica unificada por mascota (con documentos y prescripciones), vacunación, desparasitación, cirugías, hospitalización (con evoluciones), y facturación (comprobantes, pagos parciales, notas de crédito, ítems ligados a lotes de inventario).

La mayoría de entidades usa eliminación lógica (`is_active` / `status`) en lugar de borrado físico, para conservar el historial clínico y de auditoría.

---

## Seguridad y control de acceso

- **Autenticación:** JWT de acceso (vida corta) + refresh token (vida más larga) guardado en una cookie `HttpOnly`. El frontend renueva el access token automáticamente vía un interceptor de Axios cuando recibe un `401`.
- **Invalidación de sesión:** los refresh tokens usados/rotados se registran en **Redis** como blacklist, y además cada usuario tiene un `token_version` que se incrementa al cambiar la contraseña, invalidando de inmediato cualquier JWT emitido antes.
- **Autorización (RBAC):** roles (`SUPERADMIN`, `ADMIN`, `VETERINARIAN`, `GROOMING`, `ADMINISTRATIVE`, y los que se creen dinámicamente) compuestos por permisos granulares por módulo (`<MODULO>_READ/CREATE/UPDATE/DELETE`), verificados a nivel de método con `@PreAuthorize` en cada endpoint y reflejados también en la UI (botones/rutas ocultos según permisos del usuario logueado).
- **Contraseñas:** hash con BCrypt.
- **Otros:** CORS restringido a los orígenes configurados por variable de entorno, y cookies de sesión con flags `Secure`/`SameSite` configurables según el entorno (HTTP local vs HTTPS en producción).

---

## Funcionalidades principales

- **Citas:** agenda semanal visual por veterinario, con reglas de transición de estado y validación de choques de horario.
- **Mascotas y dueños:** ficha de mascota con galería de fotos e historial clínico unificado (consultas, vacunas, desparasitaciones, cirugías, hospitalizaciones) en una sola línea de tiempo.
- **Vacunación y desparasitación:** con descuento automático de stock del producto/lote aplicado y validación de vía de administración (ej. solo presentaciones inyectables al vacunar).
- **Cirugías:** validación de disponibilidad de cirujano/asistente (evita doble-booking y asignar la misma persona a ambos roles).
- **Hospitalización:** control de ocupación de jaulas, evoluciones clínicas con línea de tiempo, y bloqueo de doble admisión de una misma mascota.
- **Inventario:** productos con variantes/presentaciones, lotes con fecha de vencimiento y movimientos de stock trazables.
- **Ventas / Facturación:** carrito tipo POS, boletas/facturas/tickets, pagos parciales, notas de crédito, bloqueo pesimista contra sobreventa concurrente, y generación de recibos en PDF.
- **Horarios:** gestión de disponibilidad de veterinarios y personal de grooming.
- **Personal:** módulos independientes para veterinarios, grooming y personal administrativo, cada uno con sus propias especialidades/áreas/cargos.
- **Dashboard:** KPIs y gráficos (citas del día, ingresos, stock bajo, etc.).
- **Roles y permisos:** administración de roles personalizados y asignación de permisos por módulo.
- **Perfil propio:** cada usuario puede editar sus datos, avatar y contraseña.

---

## Estructura de carpetas

```
veterinaria/
├── backend/                  # API REST — Spring Boot
├── frontend/                 # App web — Next.js
├── docker-compose.yml        # Orquesta backend + frontend + Postgres + Redis
├── .env.example               # Variables de entorno necesarias para Docker
├── vetgest_schema.dbml         # Esquema de base de datos (fuente)
└── vetgest_schema.dbdiagram     # Mismo esquema, formato dbdiagram.io
```

---

## Cómo ejecutar el proyecto

### Opción 1: Docker (recomendado)

Requiere Docker y Docker Compose.

```bash
cp .env.example .env
# edita .env: contraseñas, JWT_SECRET (openssl rand -hex 32), credenciales del superadmin, etc.

docker compose up -d --build
```

Esto levanta 4 contenedores: `postgres`, `redis`, `backend` (puerto `8081` por defecto) y `frontend` (puerto `3002` por defecto). Ver logs con `docker compose logs -f backend` / `frontend`. Todas las variables disponibles están documentadas en [`.env.example`](.env.example).

### Opción 2: Manual / desarrollo local

Requiere Java 21, Node 20+, PostgreSQL y Redis corriendo localmente.

**Backend:**
```bash
cd backend
# crea un archivo .env con DB_PASSWORD, JWT_SECRET, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD
./mvnw spring-boot:run
```
La API queda en `http://localhost:8080/api`, con Swagger UI en `http://localhost:8080/api/swagger-ui.html`.

**Frontend:**
```bash
cd frontend
# crea un archivo .env.local con:
# NEXT_PUBLIC_APP_URL=http://localhost:8080/api
npm install
npm run dev
```
La app queda en `http://localhost:3000`.

---

## Despliegue en producción

El despliegue de referencia usa Docker Compose detrás de Nginx como reverse proxy (un solo dominio, `/api/*` al backend y el resto al frontend) con certificado TLS de Let's Encrypt vía Certbot. El `Dockerfile` del backend usa una imagen basada en Debian (no Alpine) porque la generación de PDF con OpenPDF requiere `fontconfig` para renderizar texto correctamente. El `Dockerfile` del frontend usa el modo `standalone` de Next.js para una imagen final más liviana.

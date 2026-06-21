# 🍕 Food Orders — Sistema de gestión de pedidos de comida rápida

Sistema completo de pedidos para un local de comida rápida (pizzas, hamburguesas, papas fritas, bebidas de la línea Coca-Cola) implementado con **Arquitectura Limpia**, **TDD** y **Visual TDD** (Storybook).

Monorepo con tres paquetes:

- **`domain/`** — dominio puro (entidades, value objects, casos de uso, interfaces de repos y servicios). 0 dependencias de framework.
- **`apps/backend/`** — API REST con Express + Prisma + PostgreSQL. Solo es un *adapter* del dominio.
- **`apps/frontend/`** — SPA con Vite + React + Storybook. Consume la API.

Todo orquestado con **Docker Compose**.

---

## 📁 Estructura del proyecto

```
pedidos_comida/
├── package.json              # workspaces (Yarn v4 / compatible con npm workspaces)
├── tsconfig.base.json
├── docker-compose.yml
├── .env.example
├── domain/                   # ── PAQUETE: DOMINIO (sin dependencias de framework)
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── src/
│       ├── errors/               # DomainError + subtipos (Validation, NotFound, etc.)
│       ├── value-objects/        # Money, Email
│       ├── entities/             # User, Product, Cart, Order (con sus reglas)
│       ├── repositories/         # Interfaces de persistencia
│       ├── services/             # Interfaces de PasswordHasher, TokenService, IdGenerator, Clock
│       ├── use-cases/            # Casos de uso (auth, products, cart, orders)
│       ├── __test-helpers__/     # Fakes/in-memory para tests del dominio
│       └── index.ts              # Barrel de exportación
└── apps/
    ├── backend/                # ── EXPRESS + PRISMA
    │   ├── package.json
    │   ├── prisma/schema.prisma
    │   ├── prisma/seed.ts
    │   ├── Dockerfile
    │   └── src/
    │       ├── config.ts
    │       ├── container.ts      # Composition root: inyecta adapters en casos de uso
    │       ├── server.ts         # App Express con middlewares y routers
    │       ├── index.ts          # Bootstrap del server
    │       ├── http/             # presenters, controllers, middlewares
    │       └── infrastructure/   # PrismaXRepository, BcryptPasswordHasher, JwtTokenService, ...
    └── frontend/               # ── VITE + REACT + STORYBOOK
        ├── package.json
        ├── vite.config.ts
        ├── Dockerfile
        ├── nginx.conf
        ├── .storybook/           # Configuración de Storybook
        └── src/
            ├── api/              # Cliente HTTP tipado (DTOs + fetcher)
            ├── services/         # Capa de aplicación: lógica de cliente (cart/orders/products) sobre el cliente HTTP
            ├── auth/             # AuthContext (login/registro/logout en localStorage)
            ├── components/       # Button, Money, ProductCard, CartItemRow, OrderCard, Navbar (con .stories.tsx)
            ├── pages/            # Catalog, Login, Register, Cart, Orders, OrderDetail, AdminProducts
            ├── App.tsx           # Router + guards por rol
            └── main.tsx
```

---

## 🧠 Modelo de dominio

### Entidades

| Entidad | Reglas clave |
|---|---|
| **User** | email único, password hash, rol ∈ {CUSTOMER, STAFF, ADMIN}. Métodos `canManageProducts()`, `canUpdateOrderStatus()`, `canViewAllOrders()`. |
| **Product** | precio > 0, categoría ∈ {PIZZA, BURGER, FRIES, DRINK}, `available` flag. Inmutable: `update()`/`changeAvailability()` devuelven nuevas instancias. |
| **Cart** | pertenece a un usuario, contiene items. `addItem`/`removeItem`/`updateQuantity`/`clear`/`total`. Sumar dos veces el mismo producto suma cantidades. |
| **Order** | snapshot de items (con precio congelado), `status` con **transiciones controladas**. |

### Value Objects

- **Money** — `(amountInCents, currency)`. Inmutable. Operaciones `add`/`subtract`/`multiply` solo entre misma moneda. No permite negativos.
- **Email** — normaliza (lowercase + trim), valida con regex.

### Máquina de estados de Order

```
PENDING ──► CONFIRMED ──► PREPARING ──► READY ──► DELIVERED
   │            │
   └──► CANCELLED
   │            │
   └────────────┘
```

- El **cliente** puede cancelar mientras esté en `PENDING` o `CONFIRMED`.
- **STAFF** y **ADMIN** avanzan el estado.
- Transiciones inválidas lanzan `ValidationError`.

### Servicios y repositorios

Solo se definen **interfaces** en el dominio. Los adapters viven en `apps/backend/src/infrastructure/`:

| Interfaz (dominio) | Implementación (backend) |
|---|---|
| `UserRepository`, `ProductRepository`, `CartRepository`, `OrderRepository` | `PrismaXRepository` |
| `PasswordHasher` | `BcryptPasswordHasher` |
| `TokenService` | `JwtTokenService` |
| `IdGenerator` | `UuidIdGenerator` |
| `Clock` | `SystemClock` |

Para los tests del dominio, se usan implementaciones en memoria + fakes que viven en `domain/src/__test-helpers__/`.

---

## ⚙️ Funcionalidades implementadas

### Autenticación y autorización
- `RegisterUserUseCase` — registra usuario (rol por defecto `CUSTOMER`), valida email y password ≥ 8.
- `LoginUserUseCase` — devuelve `User` + token JWT.
- Rol `ADMIN`: CRUD de productos.
- Rol `STAFF`/`ADMIN`: avanzar estados de pedidos, ver todos los pedidos.
- Rol `CUSTOMER`: ver/operar su carrito, sus pedidos, cancelar mientras estén PENDING/CONFIRMED.

### Gestión de productos (ADMIN)
- `CreateProductUseCase`, `UpdateProductUseCase`, `DeleteProductUseCase`.
- `ListProductsUseCase` — los CUSTOMER solo ven los `available: true`; ADMIN ve todo.
- `GetProductUseCase`.

### Carrito
- `AddToCartUseCase` — rechaza productos no disponibles, valida cantidad positiva.
- `UpdateCartItemQuantityUseCase` — cantidad 0 = quitar item.
- `RemoveFromCartUseCase`, `GetCartUseCase`, `ClearCartUseCase`.

### Pedidos
- `CheckoutUseCase` — re-valida que cada producto siga disponible al cerrar el pedido. Hace snapshot de los precios. Limpia el carrito.
- `ListOrdersUseCase` — filtrado por rol.
- `GetOrderUseCase` — un CUSTOMER solo accede a sus pedidos.
- `UpdateOrderStatusUseCase` — solo STAFF/ADMIN.
- `CancelOrderUseCase` — el dueño puede cancelar si está en PENDING/CONFIRMED; STAFF/ADMIN pueden cancelar siempre.

---

## 🌐 API REST

Base URL: `http://localhost:3001`

| Método | Ruta | Auth | Quién |
|---|---|---|---|
| POST | `/api/auth/register` | — | público |
| POST | `/api/auth/login` | — | público |
| GET | `/api/auth/me` | Bearer | autenticado |
| GET | `/api/products` | opcional | público (CUSTOMER ve solo disponibles) |
| GET | `/api/products/:id` | — | público |
| POST | `/api/products` | Bearer | ADMIN |
| PATCH | `/api/products/:id` | Bearer | ADMIN |
| DELETE | `/api/products/:id` | Bearer | ADMIN |
| GET | `/api/cart` | Bearer | autenticado |
| POST | `/api/cart/items` `{productId, quantity}` | Bearer | autenticado |
| PATCH | `/api/cart/items/:productId` `{quantity}` | Bearer | autenticado |
| DELETE | `/api/cart/items/:productId` | Bearer | autenticado |
| DELETE | `/api/cart` | Bearer | autenticado |
| POST | `/api/orders/checkout` | Bearer | autenticado |
| GET | `/api/orders` | Bearer | dueño / STAFF / ADMIN |
| GET | `/api/orders/:id` | Bearer | dueño / STAFF / ADMIN |
| PATCH | `/api/orders/:id/status` `{status}` | Bearer | STAFF / ADMIN |
| POST | `/api/orders/:id/cancel` | Bearer | dueño (si aplica) / STAFF / ADMIN |

Códigos de error mapeados desde el dominio:

| Error dominio | HTTP |
|---|---|
| `ValidationError` | 400 |
| `AuthenticationError` | 401 |
| `AuthorizationError` | 403 |
| `NotFoundError` | 404 |
| `ConflictError` | 409 |

Formato uniforme: `{ "error": { "code": "VALIDATION_ERROR", "message": "…" } }`.

---

## 🚀 Cómo correr el proyecto

### Opción A — Todo con Docker Compose (recomendado)

```bash
cp .env.example .env       # ajustar JWT_SECRET y credenciales
docker compose up --build
```

- **Frontend**: http://localhost:8080
- **Backend**: http://localhost:3001
- **Postgres**: localhost:5432

Al primer arranque el backend ejecuta `prisma db push` y un seed con un admin (`admin@food.local` / `admin1234`) y productos de ejemplo.

### Opción B — Local sin Docker

Requisitos: Node 20+, una Postgres corriendo (o usá SQLite — ver más abajo).

```bash
# instalar dependencias
npm install --workspaces --include-workspace-root
#  ó: yarn install  (si tenés Yarn 4 vía corepack)

# 1) Dominio: build + tests
cd domain
npx tsc
npx jest                 # 91 tests pasan

# 2) Backend
cd ../apps/backend
cp .env.example .env     # ajustar DATABASE_URL, JWT_SECRET
npx prisma db push
npx ts-node prisma/seed.ts
npm run dev              # http://localhost:3001

# 3) Frontend (en otra terminal)
cd ../frontend
cp .env.example .env
npm run dev              # http://localhost:5173

# 4) Storybook (opcional, otra terminal)
npm run storybook        # http://localhost:6006
```

### Tests

```bash
# desde la raíz: corre los tests de todos los workspaces (dominio + frontend)
npm test --workspaces

# solo dominio (Jest):
cd domain && npx jest

# solo frontend (Vitest):
npm run test --workspace @food-orders/frontend
# en watch: npm run test:watch --workspace @food-orders/frontend
```

---

## 🧪 TDD aplicado

El **dominio se desarrolló íntegramente con TDD**. Cada Value Object, entidad y caso de uso tiene su archivo `.test.ts` al lado:

```
src/value-objects/money.test.ts        — 12 tests (creación, aritmética, igualdad)
src/value-objects/email.test.ts        —  7 tests
src/entities/user.test.ts              — 11 tests (roles, validaciones)
src/entities/product.test.ts           —  7 tests
src/entities/cart.test.ts              — 10 tests
src/entities/order.test.ts             — 17 tests (incluye matriz de transiciones)
src/use-cases/auth/register-user.test.ts
src/use-cases/auth/login-user.test.ts
src/use-cases/products/create-product.test.ts
src/use-cases/products/update-product.test.ts
src/use-cases/products/list-products.test.ts
src/use-cases/cart/add-to-cart.test.ts
src/use-cases/orders/checkout.test.ts
src/use-cases/orders/update-order-status.test.ts
```

→ **91 tests / 14 suites — todos pasan.**

Los tests usan **fakes en memoria** (no mocks) que viven en `__test-helpers__/`. Eso permite asertar contra el estado real del repo y no contra "X fue llamado con Y", lo cual mantiene los tests robustos frente a refactors internos.

### TDD en el frontend (Vitest + React Testing Library)

El frontend tiene su propia suite de tests unitarios y de integración, sobre **Vitest + React Testing Library + jsdom**:

```
src/api/client.test.ts               — adjunta el JWT, lanza ApiError, query strings, 204 (fetch mockeado)
src/auth/AuthContext.test.tsx        — login/register/logout + restauración de sesión desde localStorage
src/services/cartService.test.ts     — regla "cantidad 0 = quitar", defaults, unwrapping
src/services/ordersService.test.ts   — filtrado de cocina, avance de estado, checkout
src/services/productsService.test.ts — mapeo de categoría "ALL", listado admin, toggle de disponibilidad
src/components/Money.test.tsx        — formateo de moneda y conversión de centavos
src/components/Button.test.tsx       — variantes, tamaños, onClick, estado disabled
src/components/CartItemRow.test.tsx  — controles de cantidad, quitar, modo solo-lectura
src/components/ProductCard.test.tsx  — disponible/no disponible, callback onAdd
src/components/OrderCard.test.tsx    — etiqueta de estado, avance de estados, cancelar
```

→ **50 tests / 10 suites — todos pasan.**

La capa de API se testea **mockeando `fetch`** (sin backend real); los **servicios** y el `AuthContext` se prueban aislados mockeando el cliente de API, verificando comportamiento (estado y persistencia) y no llamadas internas.

---

## 🎨 Visual TDD con Storybook

Cada componente UI vive en `apps/frontend/src/components/X.tsx` y tiene su `X.stories.tsx` al lado. Componentes diseñados aisladamente antes de integrarlos en páginas:

- `Button` — variantes `primary`/`secondary`/`danger`, tamaños sm/md/lg, estado `disabled`.
- `Money` — formateo localizado con `Intl.NumberFormat`.
- `ProductCard` — distintas categorías + estado no disponible + modo solo lectura.
- `CartItemRow` — modo editable vs. modo solo lectura.
- `OrderCard` — los 6 estados, con acciones de staff (avanzar) y de cliente (cancelar).

```bash
cd apps/frontend
npm run storybook        # http://localhost:6006
```

---

## 🐳 Docker Compose

`docker-compose.yml` define tres servicios:

- **db** — `postgres:16-alpine` con volumen persistente `db-data`.
- **backend** — multi-stage build: instala deps, compila dominio + backend, genera Prisma client. Al iniciar corre `prisma db push` y el seed.
- **frontend** — multi-stage: build con Vite, sirve los estáticos desde Nginx en puerto 80 (publicado en 8080). El `nginx.conf` hace fallback a `index.html` para soportar las rutas del SPA.

El `VITE_API_URL` se inyecta en build-time vía `args` del Dockerfile (los `import.meta.env` de Vite se evalúan al compilar, no en runtime).

---

## 🌍 Hosting en un servidor — qué tener en cuenta

### 1. Dominio y certificados HTTPS

Compose por sí solo expone HTTP en los puertos publicados. En producción:

- Apuntar un dominio (ej. `foodorders.example.com`) al servidor.
- Usar **Let's Encrypt** con un cliente automatizado (`certbot` o el contenedor `nginxproxy/acme-companion` o **Traefik** con su resolver ACME).
- Renovación automática cada 60–90 días (cron / hook del reverse proxy).
- **HSTS** + redirección 301 de HTTP → HTTPS en el reverse proxy.

### 2. Reverse proxy

Un **reverse proxy** (Nginx, Traefik, Caddy) es el punto de entrada público: recibe el tráfico en 80/443 y lo enruta a los servicios internos. Sirve para:

- Terminación TLS (un solo lugar maneja certificados).
- Routing por host/path: `foodorders.example.com` → frontend; `api.foodorders.example.com` o `/api` → backend.
- Compresión (gzip/brotli), cache de estáticos.
- Rate limiting básico.
- Cabeceras de seguridad (`X-Frame-Options`, `Content-Security-Policy`, etc.).
- Health checks y blue/green deploys.

Con **Traefik**, el routing se define con labels en el `docker-compose.yml`; con **Nginx**, con un archivo de configuración aparte. **Caddy** es la opción más simple (HTTPS automático con una línea).

### 3. Secretos

Nunca commitear `.env`. Opciones para producción:

- **Variables del entorno** del host (sirve para despliegues simples; el `docker-compose.yml` ya las consume con `${VAR}`).
- **Docker secrets** (`docker compose` los soporta vía `secrets:` y los monta como archivos en `/run/secrets/<nombre>` — más seguro que envs porque no aparecen en `docker inspect`).
- **Vaults externos**: HashiCorp Vault, AWS Secrets Manager, Doppler, 1Password Secrets Automation. La app pide el secreto al boot o se inyecta como env por el orquestador.
- Rotar `JWT_SECRET`, password de Postgres y credenciales del admin inicial.
- Restringir el puerto 5432 (no publicarlo a internet — solo accesible en la red interna de Docker).

### 4. Otras cosas a considerar

- **Backups** del volumen `db-data` (snapshot diario / `pg_dump` programado).
- **Migrations versionadas** con `prisma migrate` en lugar de `db push` (en este proyecto usamos `db push` por simplicidad).
- **Logging y métricas**: salida estructurada JSON, agregador (Loki, ELK, Datadog).
- **CORS_ORIGIN** apuntando al dominio público real, no a `*`.
- **Hardening del JWT**: `JWT_SECRET` largo y aleatorio (≥ 256 bits), expiración corta + refresh tokens si querés algo más serio.
- **CSP** en el frontend (headers de Nginx).
- Imagen del backend correriendo como usuario no-root (agregar `USER node` en el Dockerfile).

---

## 🔁 Reflexión sobre el proceso

### ¿En qué ayudó la Arquitectura Limpia?

El **dominio se podría probar entero sin levantar Postgres ni Express**: 91 tests corren en ~5s. Esto permitió iterar el diseño de las reglas de negocio (cuándo se puede cancelar un pedido, qué transiciones son válidas, qué precio queda congelado en el pedido) **antes** de elegir base de datos o framework HTTP.

Cuando llegó el momento de elegir Prisma + Postgres + Express, fue mecánico: cada interfaz del dominio tiene un adapter en `infrastructure/`. Si mañana queremos cambiar a Fastify, MongoDB o un repositorio que escriba en S3, solo tocamos los adapters — el dominio y los casos de uso no se enteran.

### ¿En qué ayudó el TDD?

Detectó dos cosas que originalmente no había modelado bien:

1. **Snapshots de precio en `Order`**: el primer diseño guardaba `productId` y leía precio del repositorio. El test "checkout falla si el producto cambia de precio" me hizo dar cuenta de que el pedido tiene que **congelar** el precio al momento del checkout. Por eso `OrderItem` lleva `unitPrice` propio.

2. **Disponibilidad re-validada en checkout**: agregar al carrito un producto que después el admin marca como no disponible. El test obliga a re-chequear antes de crear el pedido.

### Cosas que me costaron / aprendí

- **No leakear detalles de infraestructura en el dominio**: tuve que resistir el reflejo de poner `await prisma.*` directamente en un caso de uso. La forma "limpia" es definir la interfaz `XRepository` en el dominio y dejar que el composition root inyecte la implementación.
- **Carrito + Pedido como entidades distintas**: al principio pensaba en "una sola cosa con estado". Separarlos hizo que las transiciones queden mucho más claras, y permitió que el pedido sea inmutable después del checkout (snapshot).
- **Tests con fakes vs. mocks**: usar fakes en memoria que realmente persisten datos hace que los tests sean tests de comportamiento, no de "llamó al método X". Refactorizar el dominio entero no rompió ningún test.

### Lo que faltaba cuando creí que había terminado

Cuando ya estaban todos los casos de uso, escribiendo los controllers del backend me di cuenta de que faltaba el `RemoveFromCartUseCase` y que `UpdateCartItemQuantityUseCase` con cantidad 0 debía eliminar el item (lo agregué). También faltaba diferenciar permisos para **cancelar**: el dueño puede en estados tempranos, el staff puede siempre. Eso se modeló como una sola regla en `CancelOrderUseCase` que combina `order.canBeCancelledByCustomer()` con `actor.canUpdateOrderStatus()`.

---

## 📚 Stack

| Capa | Tecnología |
|---|---|
| Lenguaje | TypeScript 5 |
| Tests (dominio) | Jest + ts-jest |
| Tests (frontend) | Vitest + React Testing Library + jsdom |
| Backend | Express, Prisma 5, PostgreSQL 16, JWT, bcryptjs |
| Frontend | Vite 5, React 18, React Router 6, Storybook 7 |
| Container | Docker + Docker Compose |
| Manejador | Yarn 4 (compatible con npm workspaces) |

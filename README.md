# Cordillera

Sistema de gestión para **Ferretería Industrial Cordillera**: facturas, órdenes,
categorías, precios y avisos. Reemplaza el usuario compartido por accesos por
persona y avisa cuando algo necesita revisión en lugar de adivinar.

**Principio central:** si el sistema no puede resolver algo con certeza, **avisa
en vez de adivinar**. Lo dudoso va a **Revisión**.

**Demo en producción:** [https://fic-admin.vercel.app/](https://fic-admin.vercel.app/)

---

## Alcance

Problemas del PDF cubiertos: **1, 2, 5, 6, 7, 8 y 10**. Enfoque, criterios y
mapa completo del enunciado: [`docs/criterios-y-decisiones.md`](docs/criterios-y-decisiones.md).

---

## Roles

| Rol | Usuario de ejemplo | Acceso en el menú |
| --- | --- | --- |
| **Admin** | `admin@cordillera.com` | Todo lo entregado + usuarios + ajustes |
| **Compras** | `marcela@cordillera.com` | Facturas, órdenes, categorías, precios, revisión |
| **Ventas** | `julian@cordillera.com` | Resumen, precios y categorías (consulta) |

Los permisos se aplican en la base de datos (RLS), no solo en la interfaz.

Clave de acceso (demo y local): **`cordillera2026`**

| Email | Rol |
| --- | --- |
| `admin@cordillera.com` | Admin |
| `marcela@cordillera.com` | Compras |
| `julian@cordillera.com` | Ventas |

---

## Arrancar en local

**Requisitos:** Node 20+, proyecto Supabase.

```bash
npm install
cp .env.local.example .env.local
```

Completar `.env.local` con las claves del proyecto Supabase. Opcionales:
`AI_GATEWAY_API_KEY` (OCR), `PORTAL_*` (precios; valores de prueba en
`.env.local.example`).

### Base de datos

1. Crear un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecutar las migraciones de `supabase/` **en orden numérico**
   (`001` → `017`). Cada archivo es idempotente en su dominio; el orden importa.
3. Copiar **Project URL**, **anon key** y **service role key** al `.env.local`.
4. En **Storage**, crear buckets privados `facturas` y `ordenes` (adjuntos de
   facturas y órdenes).
5. Ejecutar el seed (sincroniza usuarios demo; agrega `-- --with-data` en base vacía):

```bash
npm run seed
# npm run seed -- --with-data   # datos de ejemplo (solo si no hay proveedores)
npm run dev
```

Detalle de tablas, buckets y variables: [`docs/arquitectura.md`](docs/arquitectura.md).

Desarrollo local: [http://localhost:3000](http://localhost:3000)

**Scripts:** `npm run build` · `npm run test` · `npm run lint` · `npm run typecheck`

---

## Stack

Next.js 16 · TypeScript · Supabase · Tailwind · shadcn/ui · React Query · Vercel
Cron (precios)

---

## Documentación

**Documentación técnica de la prueba** (criterio, decisiones y abordaje por
problema del PDF): [`docs/criterios-y-decisiones.md`](docs/criterios-y-decisiones.md)
+ [`docs/arquitectura.md`](docs/arquitectura.md) + [`docs/bitacora/`](docs/bitacora/).

Índice completo en [`docs/README.md`](docs/README.md).

| Documento | Para qué |
| --- | --- |
| [`docs/criterios-y-decisiones.md`](docs/criterios-y-decisiones.md) | Por qué se construyó así; mapa de los 12 problemas |
| [`docs/arquitectura.md`](docs/arquitectura.md) | Cómo está construido |
| [`docs/bitacora/`](docs/bitacora/) | Qué se fue entregando, feature a feature |

# Cordillera

Sistema de gestión para **Ferretería Industrial Cordillera**: facturas, órdenes,
categorías, precios y avisos. Reemplaza el usuario compartido por accesos por
persona y avisa cuando algo necesita revisión en lugar de adivinar.

**Principio central:** si el sistema no puede resolver algo con certeza, **avisa
en vez de adivinar**. Lo dudoso va a **Revisión**.

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

---

## Arrancar en local

**Requisitos:** Node 20+, proyecto Supabase.

```bash
npm install
cp .env.local.example .env.local
```

Variables mínimas: Supabase. Opcionales: `AI_GATEWAY_API_KEY` (OCR),
`PORTAL_URL` / `PORTAL_USER` / `PORTAL_PASSWORD` (precios).

```bash
npm run seed
npm run dev
```

[http://localhost:3000](http://localhost:3000) — clave **`cordillera2026`**

| Email | Rol |
| --- | --- |
| `admin@cordillera.com` | Admin |
| `marcela@cordillera.com` | Compras |
| `julian@cordillera.com` | Ventas |

**Scripts:** `npm run build` · `npm run test` · `npm run lint` · `npm run typecheck`

---

## Stack

Next.js 16 · TypeScript · Supabase · Tailwind · shadcn/ui · React Query · Vercel
Cron (precios)

---

## Documentación

Índice completo en [`docs/README.md`](docs/README.md).

| Documento | Para qué |
| --- | --- |
| [`docs/arquitectura.md`](docs/arquitectura.md) | Cómo está construido |
| [`docs/criterios-y-decisiones.md`](docs/criterios-y-decisiones.md) | Por qué se construyó así |
| [`docs/bitacora/`](docs/bitacora/) | Qué se fue entregando, por feature |

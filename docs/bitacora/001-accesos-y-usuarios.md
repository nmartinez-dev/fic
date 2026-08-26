# 001 — Accesos y usuarios

**Problema del PDF:** #10 — *Los accesos (roles)*  
**Estado:** implementado

Hoy cada persona entra con su propia cuenta. Marcela ve lo de compras, Julián lo
de ventas, y quien administra el sistema ve todo y puede dar de alta o quitar
accesos.

## Qué quedó hecho

### Cada uno entra solo a lo que le toca

- **Admin** — ve todas las secciones y puede gestionar usuarios.
- **Compras** (Marcela) — proveedores, facturas, órdenes, rubros, vencimientos, avisos.
- **Ventas** (Julián) — ventas y su dashboard.

Si alguien intenta entrar a una sección que no le corresponde, el sistema lo
redirige. Eso vale en la pantalla y también en los datos: la base no deja filtrar
lo que no le toca.

### Gestión de usuarios (solo admin)

Desde **Usuarios** el admin puede:

- Ver quién tiene cuenta y con qué rol.
- Crear usuarios nuevos (email, nombre, rol y contraseña inicial).
- Editar nombre, rol o contraseña.
- Eliminar cuentas (excepto la propia mientras está logueado).

Puede haber más de un admin.

### Inicio de sesión y cuenta personal

- Entrada con email y contraseña.
- Cualquier usuario puede **cambiar su contraseña** desde el menú de la esquina.
- **Cerrar sesión** pide confirmación antes de salir.
- En los campos de contraseña hay un ojito para ver lo que escribís.

### Cuentas de prueba

| Email | Rol | Clave |
|-------|-----|-------|
| `admin@cordillera.com` | Admin | `cordillera2026` |
| `marcela@cordillera.com` | Compras | `cordillera2026` |
| `julian@cordillera.com` | Ventas | `cordillera2026` |

## Mejoras que se podrían sumar después

### Accesos

- [ ] “Olvidé mi contraseña” por email.
- [ ] Obligar a cambiar la clave la primera vez que entra alguien nuevo.
- [ ] Invitar por mail en lugar de que el admin invente la contraseña.
- [ ] Que cada uno edite su nombre (y el mail, con confirmación).
- [ ] Registro de quién creó o modificó usuarios.
- [ ] Cargar muchos usuarios de una (por ejemplo desde Excel).
- [ ] Ver en qué dispositivos hay sesión abierta y cerrarlas a distancia.

### Seguridad

- [ ] Verificación en dos pasos (código en el celular).
- [ ] Reglas de contraseña más estrictas, configurables.
- [ ] Limitar intentos fallidos de login.

### Comodidad

- [ ] Buscar y paginar usuarios si la lista crece.
- [ ] Más feedback visual al guardar cambios (que se note al toque que se aplicó).

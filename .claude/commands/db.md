# /db

Maneja la base de datos de MiAgente: crear migraciones de Prisma, revisar estado/drift, inspeccionar datos y administrar los branches de Neon. La BD está bajo control de **Prisma Migrations** (baselined con `0_init`).

**Regla número uno:** nunca corras una migración, `reset` o `db push` contra **producción** desde local. Verifica siempre a qué base estás conectado antes de escribir.

---

## Paso 0 — Verifica a qué base estás conectado (SIEMPRE primero)

```bash
bunx prisma migrate status 2>&1 | grep Datasource
```

- `ep-fancy-violet-...` → branch **`development`** ✅ seguro para migrar.
- `ep-proud-unit-...`  → branch **`production`** ⛔ DETENTE. No migres aquí desde local.

El `.env` local debe apuntar al branch `development` en **ambas** vars (`DATABASE_URL` *y* `DIRECT_URL` — las migraciones usan `DIRECT_URL`). Si no coinciden o apuntan a prod, corrígelo antes de seguir (las URLs de cada branch se obtienen con `neonctl connection-string`, ver más abajo).

---

## Crear una migración (cambio de schema)

1. Edita `prisma/schema.prisma`. Respeta las convenciones del proyecto:
   - precio = `Decimal(15,2)`; `onDelete: Cascade` en relaciones de `User`.
   - Para tipos de propiedad usa el enum existente: `apartment | house | office | commercial | lot | warehouse`.

2. Genera y aplica la migración contra **dev**:
   ```bash
   bunx prisma migrate dev --name descripcion_en_snake_case
   ```
   Esto: crea `prisma/migrations/{timestamp}_descripcion/migration.sql`, lo aplica al branch dev, y regenera el client. Nombre en `snake_case`, descriptivo (`add_user_phone`, `add_property_status`).

3. Revisa el SQL generado (`prisma/migrations/.../migration.sql`) antes de commitear — confirma que el `ALTER`/`CREATE` es lo que esperabas y no hay un `DROP` accidental que pierda datos.

4. **Commitea la migración junto con el cambio de `schema.prisma`** en el mismo PR (usa `/create-pr`). Nunca mergees un cambio de schema sin su migración.

> En cada deploy de Vercel corre `prisma migrate deploy` automáticamente (está en el `build`), así que la migración se aplica sola: a **dev** en preview deploys y a **prod** en el deploy de producción. No la apliques a prod a mano.

---

## Prohibido

- **`prisma db push`** — rompe el historial de migraciones. La BD ya está baselined; todo cambio va por `migrate dev`.
- **`migrate reset` / `migrate deploy` / `migrate dev` contra prod** desde local. `reset` borra datos.
- Editar a mano una migración ya aplicada/mergeada. Si te equivocaste, crea una migración nueva que corrija.

---

## Comandos útiles

```bash
bunx prisma migrate status     # ¿qué migraciones están aplicadas? ¿hay pendientes?
bunx prisma studio             # GUI para inspeccionar/editar datos (abre en el browser)
bunx prisma generate           # regenera el client tras editar el schema sin migrar
```

**Detectar drift** (la BD no coincide con `schema.prisma`):
```bash
bunx prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma \
  --exit-code
# exit 0 = sin diferencias; exit 2 = hay drift (imprime el SQL de la diferencia)
```

---

## Administrar branches de Neon

Proyecto Neon: `inmobiliaria` (`late-shape-55166232`). `neonctl` se autentica por OAuth en el navegador (no hay `NEON_API_KEY`); si pide auth, deja que abra el navegador.

```bash
# Listar branches (production = primary, development = dev persistente)
bunx neonctl branches list --project-id late-shape-55166232

# Connection strings de un branch (pooled = DATABASE_URL, sin --pooled = DIRECT_URL)
bunx neonctl connection-string development --project-id late-shape-55166232 --pooled
bunx neonctl connection-string development --project-id late-shape-55166232

# Refrescar el branch dev con datos/esquema actuales de prod: borra y recrea sin TTL
bunx neonctl branches delete development --project-id late-shape-55166232
bunx neonctl branches create --project-id late-shape-55166232 --name development --parent production
bunx neonctl branches set-expiration <branch-id> --project-id late-shape-55166232   # sin --expires-at = quita el TTL (lo vuelve persistente)
```

> Al crear un branch nuevo de dev, **actualiza el `.env` local** con sus nuevos connection strings (el endpoint cambia). Si cambian las credenciales de dev, actualiza también las vars de Vercel en scope *Preview + Development*.

---

## Baseline (referencia — solo si la BD pierde el historial)

Si alguna vez `migrate deploy` falla con **P3005** ("schema is not empty") en una base sin tabla `_prisma_migrations` (p. ej. creada con `db push`):

```bash
# 1. Generar init desde el estado REAL de la base (introspección, no el datamodel)
mkdir -p prisma/migrations/0_init
bunx prisma migrate diff --from-empty \
  --to-schema-datasource prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql
# 2. Marcar init como aplicada SIN ejecutarla
bunx prisma migrate resolve --applied 0_init
# 3. Aplicar las migraciones posteriores normalmente
bunx prisma migrate deploy
```

Asegúrate de que exista `prisma/migrations/migration_lock.toml` con `provider = "postgresql"`.

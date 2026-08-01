# /db

Manages Conexory's database: creating Prisma migrations, checking status/drift, inspecting data, and administering Neon branches. The DB is under **Prisma Migrations** control (baselined with `0_init`).

**Rule number one:** never run a migration, `reset` or `db push` against **production** from local. Always verify which database you're connected to before writing.

---

## Step 0 — Verify which database you're connected to (ALWAYS first)

```bash
bunx prisma migrate status 2>&1 | grep Datasource
```

- `ep-fancy-violet-...` → **`development`** branch ✅ safe to migrate.
- `ep-proud-unit-...`  → **`production`** branch ⛔ STOP. Don't migrate here from local.

The local `.env` must point at the `development` branch in **both** vars (`DATABASE_URL` *and* `DIRECT_URL` — migrations use `DIRECT_URL`). If they don't match or point at prod, fix it before continuing (get each branch's URLs with `neonctl connection-string`, see below).

---

## Creating a migration (schema change)

1. Edit `prisma/schema.prisma`. Follow the project's conventions:
   - price = `Decimal(15,2)`; `onDelete: Cascade` on `User` relations.
   - For property types use the existing enum: `apartment | house | office | commercial | lot | warehouse`.

2. Generate and apply the migration against **dev**:
   ```bash
   bunx prisma migrate dev --name description_in_snake_case
   ```
   This: creates `prisma/migrations/{timestamp}_description/migration.sql`, applies it to the dev branch, and regenerates the client. Name in `snake_case`, descriptive (`add_user_phone`, `add_property_status`).

3. Review the generated SQL (`prisma/migrations/.../migration.sql`) before committing — confirm the `ALTER`/`CREATE` is what you expected and there's no accidental `DROP` that would lose data.

4. **Commit the migration together with the `schema.prisma` change** in the same PR (use `/create-pr`). Never merge a schema change without its migration.

> On every Vercel deploy, `prisma migrate deploy` runs automatically (it's in `build`), so the migration applies itself: to **dev** on preview deploys and to **prod** on the production deploy. Don't apply it to prod by hand.

---

## Forbidden

- **`prisma db push`** — breaks the migration history. The DB is already baselined; every change goes through `migrate dev`.
- **`migrate reset` / `migrate deploy` / `migrate dev` against prod** from local. `reset` deletes data.
- Manually editing an already-applied/merged migration. If you made a mistake, create a new migration that corrects it.

---

## Useful commands

```bash
bunx prisma migrate status     # which migrations are applied? any pending?
bunx prisma studio             # GUI to inspect/edit data (opens in the browser)
bunx prisma generate            # regenerates the client after editing the schema without migrating
```

**Detecting drift** (the DB doesn't match `schema.prisma`):
```bash
bunx prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma \
  --exit-code
# exit 0 = no differences; exit 2 = there's drift (prints the diff's SQL)
```

---

## Administering Neon branches

Neon project: `conexory` (`late-shape-55166232`). `neonctl` authenticates via OAuth in the browser (there's no `NEON_API_KEY`); if it asks for auth, let it open the browser.

```bash
# List branches (production = primary, development = persistent dev)
bunx neonctl branches list --project-id late-shape-55166232

# Connection strings for a branch (pooled = DATABASE_URL, without --pooled = DIRECT_URL)
bunx neonctl connection-string development --project-id late-shape-55166232 --pooled
bunx neonctl connection-string development --project-id late-shape-55166232

# Refresh the dev branch with prod's current data/schema: delete and recreate with no TTL
bunx neonctl branches delete development --project-id late-shape-55166232
bunx neonctl branches create --project-id late-shape-55166232 --name development --parent production
bunx neonctl branches set-expiration <branch-id> --project-id late-shape-55166232   # no --expires-at = removes the TTL (makes it persistent)
```

> When creating a new dev branch, **update the local `.env`** with its new connection strings (the endpoint changes). If dev's credentials change, also update the Vercel vars in the *Preview + Development* scope.

---

## Baseline (reference — only if the DB loses its history)

If `migrate deploy` ever fails with **P3005** ("schema is not empty") on a database with no `_prisma_migrations` table (e.g. created with `db push`):

```bash
# 1. Generate init from the database's REAL state (introspection, not the datamodel)
mkdir -p prisma/migrations/0_init
bunx prisma migrate diff --from-empty \
  --to-schema-datasource prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql
# 2. Mark init as applied WITHOUT running it
bunx prisma migrate resolve --applied 0_init
# 3. Apply the later migrations normally
bunx prisma migrate deploy
```

Make sure `prisma/migrations/migration_lock.toml` exists with `provider = "postgresql"`.

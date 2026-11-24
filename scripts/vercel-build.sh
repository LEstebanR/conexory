#!/bin/sh
# Vercel build command. Migrations run here, before `next build`, so a failed
# migration fails the deployment and the previous one keeps serving traffic.
# Production always migrates its own database. Previews share the dev database,
# so they only migrate when prisma/migrations changed since the last deployment
# of the branch; otherwise every preview build would race on the same schema.
set -eu

export CHECKPOINT_DISABLE=1
export PATH="$PWD/node_modules/.bin:$PATH"

should_migrate() {
  if [ "${VERCEL_ENV:-}" = "production" ]; then
    echo "Production deployment: running migrations."
    return 0
  fi

  BASE="${VERCEL_GIT_PREVIOUS_SHA:-}"
  if [ -z "$BASE" ] || ! git cat-file -e "$BASE^{commit}" 2>/dev/null; then
    echo "No previous deployment commit to compare against: running migrations."
    return 0
  fi

  if git diff --quiet "$BASE" HEAD -- prisma/migrations; then
    echo "prisma/migrations unchanged since $BASE: skipping migrations."
    return 1
  fi

  echo "prisma/migrations changed since $BASE: running migrations."
  return 0
}

if should_migrate; then
  prisma migrate deploy
fi

next build

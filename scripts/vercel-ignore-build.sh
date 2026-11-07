#!/bin/sh
# Vercel "Ignored Build Step": exit 0 skips the deployment, any other code builds.
# Production always builds. Previews are skipped only when every changed file is
# a test, Markdown, blog content, E2E or CI config. If git can't diff (shallow
# clone, first commit), the non-zero exit means the preview still builds.

if [ "$VERCEL_ENV" = "production" ]; then
  echo "Production deployment: building."
  exit 1
fi

BASE="${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}"

git diff --quiet "$BASE" HEAD -- . \
  ':(exclude)*.test.ts' \
  ':(exclude)*.test.tsx' \
  ':(exclude)*.md' \
  ':(exclude)content' \
  ':(exclude)e2e' \
  ':(exclude).github'
status=$?

if [ "$status" -eq 0 ]; then
  echo "Only tests, docs or CI changed since $BASE: skipping preview."
else
  echo "Deployable files changed since $BASE: building preview."
fi
exit "$status"

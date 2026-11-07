#!/bin/sh
# Vercel "Ignored Build Step": exit 0 skips the deployment, exit 1 builds.
# Any other exit code fails the deployment, so every non-skip path exits 1.
# Production always builds. Previews are skipped only when every changed file is
# a test, Markdown, blog content, E2E or CI config.

if [ "$VERCEL_ENV" = "production" ]; then
  echo "Production deployment: building."
  exit 1
fi

# Without a previous deployment to compare against (first push of a branch, or
# a force-push that removed that commit) the push may hold several commits we
# can't see, so build.
BASE="$VERCEL_GIT_PREVIOUS_SHA"
if [ -z "$BASE" ] || ! git cat-file -e "$BASE^{commit}" 2>/dev/null; then
  echo "No previous deployment commit to compare against: building preview."
  exit 1
fi

if git diff --quiet "$BASE" HEAD -- . \
  ':(exclude)*.test.ts' \
  ':(exclude)*.test.tsx' \
  ':(exclude)*.md' \
  ':(exclude)content' \
  ':(exclude)e2e' \
  ':(exclude).github'; then
  echo "Only tests, docs or CI changed since $BASE: skipping preview."
  exit 0
fi

echo "Deployable files changed since $BASE: building preview."
exit 1

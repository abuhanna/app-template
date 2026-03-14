#!/bin/bash
set -e

echo "╔═══════════════════════════════════╗"
echo "║  AppTemplate Publish Workflow     ║"
echo "╚═══════════════════════════════════╝"

cd create-apptemplate

# 1. Check current version
CURRENT=$(node -p "require('./package.json').version")
echo ""
echo "Current version: $CURRENT"

# 2. Check if already published
if npm view @abuhannaa/create-apptemplate@$CURRENT version 2>/dev/null; then
  echo "⚠  Version $CURRENT already exists on npm."
  echo ""
  echo "Bumping version based on commits..."
  npm run release
  NEW_VERSION=$(node -p "require('./package.json').version")
  echo "New version: $NEW_VERSION"
else
  echo "✅ Version $CURRENT is unpublished — proceeding."
  NEW_VERSION=$CURRENT
fi

# 3. Run pre-publish checks
echo ""
echo "Running pre-publish validation..."
cd ..
npm run prepublish-check
cd create-apptemplate

# 4. Build
echo ""
echo "Building..."
npm run build

# 5. Final confirmation
echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║  Ready to publish v$NEW_VERSION               "
echo "╠═══════════════════════════════════════════════╣"
echo "║  Package: @abuhannaa/create-apptemplate       "
echo "║  Registry: https://registry.npmjs.org         "
echo "╚═══════════════════════════════════════════════╝"
echo ""
read -p "Publish now? (y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  npm publish --access public
  echo ""
  echo "✅ Published v$NEW_VERSION"
  echo ""
  echo "Post-publish steps:"
  echo "  git push origin main --follow-tags"
else
  echo "Aborted."
fi

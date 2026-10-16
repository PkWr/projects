#!/bin/bash
# Publish text edits from Obsidian to the website.
# Usage:  bash publish.sh            (or: bash publish.sh "what changed")
#
# Copies each project's note from the Obsidian "Project Pages" folder into the
# matching folder here as content.md, then commits and pushes to GitHub.
#   Project Pages/Home - About.md      ->  content.md
#   Project Pages/<project>/<any>.md   ->  <project>/content.md   (if that project folder exists here)

set -e
VAULT="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/2026-PkWr/Projects/Project Pages"
cd "$(dirname "$0")"

if [ ! -d "$VAULT" ]; then
  echo "Can't find the Obsidian folder:"; echo "  $VAULT"; exit 1
fi

copied=0
if [ -f "$VAULT/Home - About.md" ]; then
  cp "$VAULT/Home - About.md" content.md && echo "  home  <- Home - About.md" && copied=$((copied+1))
fi
for dir in "$VAULT"/*/; do
  name="$(basename "$dir")"
  [ "$name" = "_template" ] && continue
  [ -d "$name" ] || continue                      # only projects that exist on the site
  note="$(ls "$dir"*.md 2>/dev/null | head -n 1)"
  [ -n "$note" ] || continue
  cp "$note" "$name/content.md" && echo "  $name  <- $(basename "$note")" && copied=$((copied+1))
done
# themes: Project Pages/themes/<theme>/<any>.md -> themes/<theme>/content.md
for dir in "$VAULT"/themes/*/; do
  [ -d "$dir" ] || continue
  name="$(basename "$dir")"
  [ -d "themes/$name" ] || continue
  note="$(ls "$dir"*.md 2>/dev/null | head -n 1)"
  [ -n "$note" ] || continue
  cp "$note" "themes/$name/content.md" && echo "  themes/$name  <- $(basename "$note")" && copied=$((copied+1))
done
echo "Copied $copied note(s)."

git add -A
if git diff --cached --quiet; then
  echo "No changes to publish."
else
  git commit -m "${1:-Update text from Obsidian}"
  git push
  echo "Published. Live in a minute or two: https://pkwr.github.io/projects/"
fi

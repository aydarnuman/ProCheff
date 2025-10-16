#!/bin/bash

# ProCheff Markdown Auto-Fixer
echo "🔧 Fixing markdown lint errors..."

for file in *.md docs/**/*.md; do
    if [[ -f "$file" ]]; then
        echo "Processing: $file"
        
        # Add trailing newline if missing
        [ -n "$(tail -c1 "$file")" ] && echo "" >> "$file"
        
        # Fix heading spacing issues (basic)
        sed -i '' 's/^#\([^#]\)/# \1/g' "$file"
        
        # Add language to code blocks (bash as default)
        sed -i '' 's/^```$/```bash/g' "$file"
        
        echo "✅ Fixed: $file"
    fi
done

echo "🎉 Markdown lint fixes completed!"

#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$REPO_DIR/.env"
VSCODE_SETTINGS="$REPO_DIR/.vscode/settings.json"

echo "🔑 ProCheff Auto Key Manager başlatılıyor..."
mkdir -p "$REPO_DIR/.vscode"

touch "$ENV_FILE"

create_key_if_missing() {
  local key_name=$1
  if grep -q "^${key_name}=" "$ENV_FILE" 2>/dev/null; then
    echo "✅ $key_name zaten mevcut"
  else
    new_key="autogen-$(openssl rand -hex 16)"
    echo "$key_name=$new_key" >> "$ENV_FILE"
    echo "🆕 $key_name oluşturuldu"
  fi
}

create_key_if_missing "ANTHROPIC_API_KEY"
create_key_if_missing "OPENAI_API_KEY"
create_key_if_missing "GITHUB_TOKEN"

chmod 600 "$ENV_FILE"

# VSCode ortam değişkenleri
cat > "$VSCODE_SETTINGS" <<EOF2
{
  "terminal.integrated.env.osx": {
    "ANTHROPIC_API_KEY": "$(grep ANTHROPIC_API_KEY "$ENV_FILE" | cut -d= -f2)",
    "OPENAI_API_KEY": "$(grep OPENAI_API_KEY "$ENV_FILE" | cut -d= -f2)",
    "GITHUB_TOKEN": "$(grep GITHUB_TOKEN "$ENV_FILE" | cut -d= -f2)"
  }
}
EOF2

echo "🧩 VSCode ortam değişkenleri güncellendi."

# GitHub CLI varsa secrets güncelle
if command -v gh >/dev/null 2>&1; then
  echo "🔁 GitHub secrets güncelleniyor..."
  source "$ENV_FILE"
  gh secret set ANTHROPIC_API_KEY -b"$ANTHROPIC_API_KEY" --repo aydarnuman/ProCheff || true
  gh secret set OPENAI_API_KEY -b"$OPENAI_API_KEY" --repo aydarnuman/ProCheff || true
  gh secret set GITHUB_TOKEN -b"$GITHUB_TOKEN" --repo aydarnuman/ProCheff || true
  echo "✅ GitHub secrets senkronize edildi."
else
  echo "⚠️ gh CLI yüklü değil, GitHub secrets güncellenmedi."
fi

echo "🎉 Auto Key Manager tamamlandı!"

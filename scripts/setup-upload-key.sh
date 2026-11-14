#!/usr/bin/env bash
# Run locally on a trusted computer, NOT inside GitHub Actions.
# Prerequisites: Java keytool, GitHub CLI (gh auth login), base64.
set -euo pipefail
umask 077
command -v keytool >/dev/null || { echo "Install JDK keytool first."; exit 1; }
command -v gh >/dev/null || { echo "Install GitHub CLI first."; exit 1; }
gh auth status >/dev/null
repo="P1024P535/baedalwang-game"
keystore="${1:-$HOME/baedalwang-upload.jks}"
if [[ -e "$keystore" ]]; then
  echo "Keystore already exists; refusing to overwrite: $keystore" >&2
  exit 1
fi
echo "Creating a new upload key at $keystore"
echo "Back up this file and both passwords securely. Never commit or share them."
keytool -genkeypair -v -keystore "$keystore" -storetype PKCS12 \
  -alias baedalwang-upload -keyalg RSA -keysize 3072 -validity 10000
echo "Uploading the keystore as an encrypted GitHub Actions secret..."
base64 < "$keystore" | tr -d '\n' | gh secret set BAEDALWANG_KEYSTORE_BASE64 --repo "$repo"
printf '%s' 'baedalwang-upload' | gh secret set BAEDALWANG_KEY_ALIAS --repo "$repo"
read -r -s -p "Keystore password: " storepass; echo
printf '%s' "$storepass" | gh secret set BAEDALWANG_STORE_PASSWORD --repo "$repo"
read -r -s -p "Key password (often same for PKCS12): " keypass; echo
printf '%s' "$keypass" | gh secret set BAEDALWANG_KEY_PASSWORD --repo "$repo"
unset storepass keypass
echo "All four signing secrets submitted. Verify the workflow and retain the keystore backup."

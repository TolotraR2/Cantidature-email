#!/bin/bash

echo "🚀 Démarrage de Job Auto Apply..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js n'est pas installé"
  exit 1
fi

# Vérifier les dépendances
echo "📦 Vérification des dépendances..."
npm --prefix backend install 2>/dev/null || true
npm --prefix frontend install 2>/dev/null || true

# Vérifier .env
if [ ! -f backend/.env ]; then
  echo "⚠️ Créer backend/.env à partir de backend/.env.example"
  cp backend/.env.example backend/.env
  echo "✋ Édite backend/.env avec tes paramètres Gmail!"
fi

echo ""
echo "🎯 Démarrage en mode développement..."
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
echo ""
echo "Appuie Ctrl+C pour arrêter"
echo ""

npm run dev

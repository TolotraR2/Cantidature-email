#!/bin/bash

echo "🚀 Installation de Job Auto Apply..."

# Installation globale si nécessaire
if ! command -v node &> /dev/null; then
  echo "❌ Node.js n'est pas installé"
  exit 1
fi

# Installation des dépendances
npm install

echo "✅ Installation terminée!"
echo ""
echo "📝 Prochaines étapes:"
echo "1. Configurer .env dans le dossier backend"
echo "2. Lancer: npm run dev"
echo "3. Ouvrir: http://localhost:3000"

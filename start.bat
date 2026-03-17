@echo off
setlocal enabledelayedexpansion

echo 🚀 Démarrage de Job Auto Apply...
echo.

REM Vérifier Node.js
where /q node
if errorlevel 1 (
  echo ❌ Node.js n'est pas installé ou n'est pas accessible
  pause
  exit /b 1
)

REM Vérifier .env
if not exist backend\.env (
  echo 📋 Création de backend\.env...
  type backend\.env.example > backend\.env
  echo ⚠️ Édite backend\.env avec tes paramètres Gmail!
  pause
)

REM Démarrage
echo.
echo 🎯 Démarrage en mode développement...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
echo Appuie Ctrl+C pour arrêter
echo.

call npm run dev

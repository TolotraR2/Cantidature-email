@echo off
echo Installation de Job Auto Apply...

where /q node
if errorlevel 1 (
  echo Node.js n'est pas installé ou n'est pas dans le PATH
  exit /b 1
)

echo Installation des dépendances...
call npm install

echo.
echo Installation terminée!
echo.
echo Prochaines étapes:
echo 1. Configure .env dans le dossier backend
echo 2. Lance: npm run dev
echo 3. Ouvre: http://localhost:3000
echo.
pause

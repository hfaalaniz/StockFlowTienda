@echo off
:: ============================================================
:: StockFlow Tienda - Servidor de desarrollo local
:: Doble click para iniciar, o ejecutar desde cmd: dev.bat
:: ============================================================

:: Fijar directorio de trabajo al directorio donde está este .bat
cd /d "%~dp0"

SET "NODE_EXE=C:\Program Files\nodejs\node.exe"
SET "VITE_JS=%~dp0node_modules\vite\bin\vite.js"

IF NOT EXIST "%NODE_EXE%" (
    echo ERROR: No se encontro node.exe en %NODE_EXE%
    echo Instala Node.js desde https://nodejs.org
    pause
    exit /b 1
)

IF NOT EXIST "%VITE_JS%" (
    echo ERROR: No se encontraron las dependencias.
    echo Ejecuta primero en PowerShell: npm install --ignore-scripts
    pause
    exit /b 1
)

echo.
echo  StockFlow Tienda ^| Servidor de desarrollo
echo  URL: http://localhost:5174
echo  Presiona Ctrl+C para detener.
echo.
"%NODE_EXE%" "%VITE_JS%"
pause

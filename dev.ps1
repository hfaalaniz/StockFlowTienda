# Script de desarrollo para StockFlow Tienda
# Ejecutar con: powershell -ExecutionPolicy Bypass -File dev.ps1

$nodePath = "C:\Program Files\nodejs"
$env:PATH = "$nodePath;" + [System.Environment]::GetEnvironmentVariable("PATH", "User") + ";$nodePath\node_modules\npm\bin"

Write-Host "Iniciando StockFlow Tienda en http://localhost:5174 ..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
& "$nodePath\node.exe" ".\node_modules\vite\bin\vite.js"

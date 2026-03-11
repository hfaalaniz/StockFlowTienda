# EJECUTAR COMO ADMINISTRADOR
# Corrige el PATH del sistema y agrega Node.js correctamente
#
# Abrir PowerShell como Administrador y ejecutar:
#   Set-ExecutionPolicy Bypass -Scope Process
#   & "C:\stockflow\tienda\fix-path-admin.ps1"

$nodePath = "C:\Program Files\nodejs"
$currentPath = [System.Environment]::GetEnvironmentVariable("PATH", "Machine")

# Verificar si el PATH tiene literales %PATH% (el bug)
if ($currentPath -like "*%PATH%*") {
    Write-Host "DETECTADO: PATH del sistema contiene '%PATH%' literal. Corrigiendo..." -ForegroundColor Red

    # Limpiar el PATH quitando el literal %PATH% y duplicados
    $cleanParts = $currentPath -split ";" | Where-Object {
        $_ -notmatch "^%PATH%$" -and $_.Trim() -ne ""
    } | Select-Object -Unique

    # Asegurarse de que nodejs esté al inicio
    $cleanParts = @($nodePath) + ($cleanParts | Where-Object { $_ -ne $nodePath })
    $newPath = $cleanParts -join ";"

    [System.Environment]::SetEnvironmentVariable("PATH", $newPath, "Machine")
    Write-Host "PATH del sistema corregido exitosamente." -ForegroundColor Green
} else {
    # Solo agregar nodejs si no está
    if ($currentPath -notlike "*$nodePath*") {
        $newPath = "$nodePath;" + $currentPath
        [System.Environment]::SetEnvironmentVariable("PATH", $newPath, "Machine")
        Write-Host "Node.js agregado al PATH del sistema." -ForegroundColor Green
    } else {
        Write-Host "Node.js ya está en el PATH del sistema. No se necesitan cambios." -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Cerrar y reabrir PowerShell/cmd para que los cambios surtan efecto." -ForegroundColor Yellow
Write-Host "Luego podrás usar: npm run dev  (desde C:\stockflow\tienda\)" -ForegroundColor Yellow

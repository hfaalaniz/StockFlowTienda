[System.Environment]::SetEnvironmentVariable("PATH", "C:\Program Files\nodejs;" + [System.Environment]::GetEnvironmentVariable("PATH", "Process"), "Process")
Set-Location "C:\stockflow\tienda"
& npm install

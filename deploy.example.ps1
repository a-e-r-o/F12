# Deploy F12 vers le Raspberry Pi via SSH.
#
# Copie ce fichier en deploy.ps1 (ignoré par git) et ajuste $PiHost / $RemotePath.
#
# Stratégie : build local → tar+gzip → scp → extraction distante.
# Plus rapide qu'un scp -r (une seule round-trip réseau, compressé)
# et plus robuste que le piping natif PowerShell entre exes.
#
# Usage :
#   .\deploy.ps1                       # build + deploy
#   .\deploy.ps1 -SkipBuild            # deploy uniquement (build/ doit exister)
#   .\deploy.ps1 -PiHost user@10.0.0.5 # hôte alternatif

param(
    [string]$PiHost = "user@192.168.1.10",
    [string]$RemotePath = "/srv/f12",
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not $SkipBuild) {
    Write-Host "==> bun run build" -ForegroundColor Cyan
    bun run build
    if ($LASTEXITCODE -ne 0) { throw "Build a échoué" }
}

if (-not (Test-Path "build")) {
    throw "Dossier build/ introuvable - lance 'bun run build' avant ou retire -SkipBuild"
}

$buildEntries = Get-ChildItem -Path "build" -Force
if ($buildEntries.Count -eq 0) {
    throw "Dossier build/ vide"
}

$tar = New-TemporaryFile
$tarPath = $tar.FullName

try {
    Write-Host "==> Création du tarball ($($buildEntries.Count) entrées racine)" -ForegroundColor Cyan
    tar -czf $tarPath -C build .
    if ($LASTEXITCODE -ne 0) { throw "tar a échoué" }

    $size = [math]::Round((Get-Item $tarPath).Length / 1KB, 1)
    Write-Host "    → $size Ko compressés" -ForegroundColor DarkGray

    Write-Host "==> Upload vers ${PiHost}:${RemotePath}" -ForegroundColor Cyan
    scp $tarPath "${PiHost}:/tmp/f12-deploy.tar.gz"
    if ($LASTEXITCODE -ne 0) { throw "scp a échoué" }

    Write-Host "==> Extraction distante + cleanup" -ForegroundColor Cyan
    ssh $PiHost "set -e; rm -rf '$RemotePath'/* '$RemotePath'/.[!.]* 2>/dev/null; tar -xzf /tmp/f12-deploy.tar.gz -C '$RemotePath'; rm /tmp/f12-deploy.tar.gz"
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "Hint: si tu vois 'Permission denied' ci-dessus, le dossier distant n'appartient pas a l'user de deploy." -ForegroundColor Yellow
        Write-Host "      Lance cote Pi : sudo chown -R $($PiHost.Split('@')[0]):$($PiHost.Split('@')[0]) $RemotePath" -ForegroundColor Yellow
        Write-Host ""
        throw "Extraction distante a échoué"
    }

    Write-Host "==> Done. https://f12.suns.red" -ForegroundColor Green
}
finally {
    Remove-Item $tarPath -ErrorAction SilentlyContinue
}

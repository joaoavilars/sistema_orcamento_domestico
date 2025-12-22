param (
    [Parameter(Mandatory = $true)]
    [string]$BackupFile
)

# Configuration
$DB_USER = "admin"
$DB_NAME = "orcamento_db"

# Check if file exists
if (-not (Test-Path $BackupFile)) {
    Write-Host "Error: Backup file not found: $BackupFile" -ForegroundColor Red
    Exit 1
}

# Container name (try to detect or fallback)
$containerName = docker compose ps -q db 2>$null
if (-not $containerName) {
    $containerName = "sistema_orcamento_domestico-db-1"
}

Write-Host "=======================================================" -ForegroundColor Yellow
Write-Host "WARNING: This will OVERWRITE the current database data!" -ForegroundColor Red
Write-Host "Target Container: $containerName"
Write-Host "Backup File: $BackupFile"
Write-Host "=======================================================" -ForegroundColor Yellow

$confirmation = Read-Host "Are you sure you want to proceed? (y/N)"
if ($confirmation -notmatch "^[Yy]$") {
    Write-Host "Restore cancelled."
    Exit 1
}

Write-Host "Step 1: Cleaning current database (Resetting public schema)..." -ForegroundColor Cyan
# Disable TTY (-T) to avoid "the input device is not a TTY" errors in some envs, though less critical in PS pipe
docker compose exec -T db psql -U $DB_USER -d $DB_NAME -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database cleaned successfully." -ForegroundColor Green
}
else {
    Write-Host "Error cleaning database. Aborting." -ForegroundColor Red
    Exit 1
}

Write-Host "Step 2: Restoring data from backup..." -ForegroundColor Cyan
# Pipe content to docker exec
Get-Content $BackupFile | docker compose exec -T db psql -U $DB_USER -d $DB_NAME

if ($LASTEXITCODE -eq 0) {
    Write-Host "Restore completed successfully!" -ForegroundColor Green
}
else {
    Write-Host "Error during restore process." -ForegroundColor Red
    Exit 1
}

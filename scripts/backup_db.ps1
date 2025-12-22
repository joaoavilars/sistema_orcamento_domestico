$currentDate = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = "backup_$currentDate.sql"

# Check if docker is available
if (!(Get-Command "docker" -ErrorAction SilentlyContinue)) {
    Write-Host "Docker command not found. Please ensure Docker is installed and in your PATH." -ForegroundColor Red
    Exit 1
}

Write-Host "Starting backup for Sistema Orcamento Domestico..." -ForegroundColor Cyan

# Execute backup command inside the container
# docker compose exec -T db pg_dump -U postgres sistema_orcamento > $backupFile
# Note: Using 'docker compose' assuming modern version. If older, might need 'docker-compose'.
# Adjusting to generic docker exec if compose service name finding is tricky, but compose is safer for service names.

# We will try to find the container name automatically or use docker compose
$containerName = docker compose ps -q db
if (-not $containerName) {
    Write-Host "Could not find running 'db' service via docker compose. Trying default name..." -ForegroundColor Yellow
    # Fallback attempt if folder name varies, usually "folder_db_1"
    $containerName = "sistema_orcamento_domestico-db-1"
}

Write-Host "Dumping database from container..."
docker compose exec -T db pg_dump -U postgres sistema_orcamento > $backupFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "Backup created successfully: $backupFile" -ForegroundColor Green
} else {
    Write-Host "Backup failed. Please check if the container is running and database credentials are correct." -ForegroundColor Red
    Remove-Item $backupFile -ErrorAction SilentlyContinue
}

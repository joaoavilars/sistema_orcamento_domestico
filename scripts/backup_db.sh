#!/bin/bash

# Configuration
# Directory to store backups (defaults to current directory)
BACKUP_DIR=$(pwd)
# Container name (try to detect or fallback)
CONTAINER_NAME=$(docker compose ps -q db 2>/dev/null || echo "sistema_orcamento_domestico-db-1")
# Database user
DB_USER="postgres"
# Database name
DB_NAME="sistema_orcamento"

# Current date for filename
CURRENT_DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/backup_$CURRENT_DATE.sql"

# Check if docker is available
if ! command -v docker &> /dev/null; then
    echo "Error: docker command not found."
    exit 1
fi

echo "Starting backup for Sistema Orcamento Domestico..."
echo "Target Container: $CONTAINER_NAME"
echo "Target File: $BACKUP_FILE"

# Execute backup
if docker compose exec -T db pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"; then
    echo "Backup created successfully: $BACKUP_FILE"
    
    # Optional: Delete backups older than 30 days
    # find "$BACKUP_DIR" -name "backup_*.sql" -mtime +30 -delete
else
    echo "Backup failed!"
    rm -f "$BACKUP_FILE"
    exit 1
fi

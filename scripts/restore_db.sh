#!/bin/bash

# Configuration
# Container name (try to detect or fallback)
CONTAINER_NAME=$(docker compose ps -q db 2>/dev/null || echo "sistema_orcamento_domestico-db-1")
# Database user
DB_USER="postgres"
# Database name
DB_NAME="sistema_orcamento"

# Input file
BACKUP_FILE=$1

# Check arguments
if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <path_to_backup_file.sql>"
    exit 1
fi

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "======================================================="
echo "WARNING: This will OVERWRITE the current database data!"
echo "Target Container: $CONTAINER_NAME"
echo "Backup File: $BACKUP_FILE"
echo "======================================================="
read -p "Are you sure you want to proceed? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled."
    exit 1
fi

echo "Step 1: Cleaning current database (Resetting public schema)..."
# This drops all tables in the public schema to ensure a clean restore
if docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"; then
    echo "Database cleaned successfully."
else
    echo "Error cleaning database. Aborting."
    exit 1
fi

echo "Step 2: Restoring data from backup..."
# We use cat to pipe the file content into the docker container
if cat "$BACKUP_FILE" | docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME"; then
    echo "Restore completed successfully!"
else
    echo "Error during restore process."
    exit 1
fi

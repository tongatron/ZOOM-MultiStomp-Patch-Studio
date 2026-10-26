#!/bin/sh
# Daily backup of the "My patches" sync data (run from the user crontab on the server, see README).
# Keeps one compressed archive per day for 30 days. Same disk as the data: it protects against
# mistakes and bad merges, not against losing the disk.
set -eu
DATA_DIR="${DATA_DIR:-/srv/apps/zoom-ms60b-data}"
BACKUP_DIR="${BACKUP_DIR:-/srv/apps/zoom-ms60b-backups}"
KEEP_DAYS="${KEEP_DAYS:-30}"

mkdir -p "$BACKUP_DIR"
archive="$BACKUP_DIR/sync-$(date +%F).tar.gz"
tar -czf "$archive.tmp" -C "$(dirname "$DATA_DIR")" "$(basename "$DATA_DIR")"
mv "$archive.tmp" "$archive"
find "$BACKUP_DIR" -name 'sync-*.tar.gz' -mtime +"$KEEP_DAYS" -delete

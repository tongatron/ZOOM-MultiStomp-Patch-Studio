#!/bin/sh
# Daily backup of the accounts database (run from the user crontab on the server, see README).
# Keeps one compressed archive per day for 30 days, readable only by its owner. Same disk as the data: it protects
# against mistakes and bad merges, not against losing the disk.
set -eu
APP_DIR="${APP_DIR:-$(dirname "$0")}"
DATA_DIR="${DATA_DIR:-/srv/apps/zoom-ms60b-data}"
BACKUP_DIR="${BACKUP_DIR:-/srv/apps/zoom-ms60b-backups}"
KEEP_DAYS="${KEEP_DAYS:-30}"
NODE="${NODE:-node}"

umask 077
mkdir -p "$BACKUP_DIR"
stage="$(mktemp -d)"
trap 'rm -rf "$stage"' EXIT
"$NODE" --disable-warning=ExperimentalWarning "$APP_DIR/db-backup.mjs" "$DATA_DIR/studio.db" "$stage/studio.db"
archive="$BACKUP_DIR/data-$(date +%F).tar.gz"
tar -czf "$archive.tmp" -C "$stage" studio.db
mv "$archive.tmp" "$archive"
# sync-*.tar.gz: archives of the old anonymous sync data, from before the accounts
find "$BACKUP_DIR" \( -name 'data-*.tar.gz' -o -name 'sync-*.tar.gz' \) -mtime +"$KEEP_DAYS" -delete
echo "$(date '+%F %T') backup written to $archive"

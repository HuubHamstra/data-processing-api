# MySQL Connection Details
DB_USER="root"
DB_PASSWORD="DataProcessing1@"
DB_NAME="hbomin"

# Backup File to Restore
BACKUP_FILE="/path/to/backup/directory/hbomin_backup_yyyymmdd_hhmmss.sql.gz"

# Decompress Backup
gunzip -c $BACKUP_FILE > /tmp/$DB_NAME_restore.sql

# Restore Database
mysql -u$DB_USER -p$DB_PASSWORD $DB_NAME < /tmp/$DB_NAME_restore.sql

echo "Database restored from: $BACKUP_FILE"

# MySQL Verbinding details
DB_USER="root"
DB_PASSWORD="DataProcessing1@"
DB_NAME="hbomin"

# Directory
BACKUP_DIR="/path/to/backup/directory"

# Timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Maak de backup
mysqldump -u$DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/$DB_NAME_backup_$TIMESTAMP.sql

# Compress backup
gzip $BACKUP_DIR/$DB_NAME_backup_$TIMESTAMP.sql

echo "Backup completed: $BACKUP_DIR/$DB_NAME_backup_$TIMESTAMP.sql.gz"
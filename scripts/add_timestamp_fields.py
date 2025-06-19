"""
Migration script to add timestamp and audit fields to existing tables.
This script adds the following fields:
- users.created_at (datetime, nullable - existing users remain NULL)
- players.updated_at (datetime, existing players get current timestamp)
- players.last_modified_by (integer, foreign key to users.id, nullable)

Note: For users.created_at, existing users will have NULL values to preserve 
data integrity. Only new users will get automatic timestamps.
"""

import os
import sys

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.config.logging_config import logger
from app.config.settings import Settings

def run_migration():
    """Run the migration to add timestamp fields"""
    try:
        # Get database URL from settings
        database_url = Settings().database_url
        logger.info(f"Running timestamp and audit migration on database: {database_url}")
        
        # Create engine
        engine = create_engine(database_url)
        
        with engine.begin() as connection:
            migrations_applied = []
            
            # Check if users.created_at exists
            result = connection.execute(text("PRAGMA table_info(users)"))
            user_columns = [row[1] for row in result.fetchall()]
            if 'created_at' not in user_columns:
                # Add created_at to users table (without default value due to SQLite limitation)
                sql = "ALTER TABLE users ADD COLUMN created_at DATETIME"
                logger.info(f"Executing: {sql}")
                connection.execute(text(sql))
                
                # Do NOT update existing users - leave created_at as NULL for existing records
                # Only new users will get created_at set automatically by the model default
                existing_users = connection.execute(text("SELECT COUNT(*) FROM users")).scalar()
                
                migrations_applied.append(f"Added created_at to users table ({existing_users} existing users kept as NULL)")
            else:
                logger.info("users.created_at already exists")
            
            # Check if players.updated_at exists
            result = connection.execute(text("PRAGMA table_info(players)"))
            player_columns = [row[1] for row in result.fetchall()]
            if 'updated_at' not in player_columns:
                # Add updated_at to players table (without default value due to SQLite limitation)
                sql = "ALTER TABLE players ADD COLUMN updated_at DATETIME"
                logger.info(f"Executing: {sql}")
                connection.execute(text(sql))
                
                # Update existing players with current timestamp
                update_sql = "UPDATE players SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL"
                result = connection.execute(text(update_sql))
                updated_players = result.rowcount
                
                migrations_applied.append(f"Added updated_at to players table ({updated_players} rows updated)")
            else:
                logger.info("players.updated_at already exists")
            
            # Check if players.last_modified_by exists
            if 'last_modified_by' not in player_columns:
                # Add last_modified_by to players table
                sql = "ALTER TABLE players ADD COLUMN last_modified_by INTEGER REFERENCES users(id)"
                logger.info(f"Executing: {sql}")
                connection.execute(text(sql))
                
                # Set last_modified_by to the player's creator (user_id) for existing players
                update_sql = "UPDATE players SET last_modified_by = user_id WHERE last_modified_by IS NULL"
                result = connection.execute(text(update_sql))
                updated_players_audit = result.rowcount
                
                migrations_applied.append(f"Added last_modified_by to players table ({updated_players_audit} rows updated)")
            else:
                logger.info("players.last_modified_by already exists")
                logger.info("players.last_modified_by already exists")
            
            if not migrations_applied:
                logger.info("All timestamp and audit fields already exist. No migration needed.")
                return True
            
            logger.info("Migration completed successfully!")
            for migration in migrations_applied:
                logger.info(f"✅ {migration}")
            
            return True
            
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        return False

if __name__ == "__main__":
    print("Running timestamp fields migration...")
    success = run_migration()
    if success:
        print("✅ Migration completed successfully!")
    else:
        print("❌ Migration failed. Check logs for details.")
        sys.exit(1)

"""
Migration script to add email confirmation fields to existing users table.
This script adds the following fields:
- email_confirmed (integer, default 0) - Values: 0=unconfirmed, 1=confirmed, -1=legacy unconfirmed
- email_confirmation_token (string, nullable)
- email_confirmation_expires (datetime, nullable)
"""

import os
import sys

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.config.logging_config import logger

def run_migration():
    """Run the migration to add email confirmation fields"""
    try:
        # Get database URL from environment
        database_url = os.getenv("DATABASE_URL", "sqlite:///./test.db")
        logger.info(f"Running migration on database: {database_url}")
        
        # Create engine
        engine = create_engine(database_url)
        
        with engine.begin() as connection:
            # Check if columns already exist
            result = connection.execute(text("PRAGMA table_info(users)"))
            columns = [row[1] for row in result.fetchall()]
            migrations_needed = []
            
            if 'email_confirmed' not in columns:
                migrations_needed.append("ADD COLUMN email_confirmed INTEGER DEFAULT 0 NOT NULL")
            
            if 'email_confirmation_token' not in columns:
                migrations_needed.append("ADD COLUMN email_confirmation_token TEXT")
            
            if 'email_confirmation_expires' not in columns:
                migrations_needed.append("ADD COLUMN email_confirmation_expires DATETIME")
            
            if not migrations_needed:
                logger.info("All email confirmation fields already exist. No migration needed.")
                return True
            
            # Apply migrations
            for migration in migrations_needed:
                sql = f"ALTER TABLE users {migration}"
                logger.info(f"Executing: {sql}")
                connection.execute(text(sql))
            
            # Set email_confirmed = 1 for existing users who already have email
            # This assumes existing users with emails are already "verified"
            # Values: 0 = unconfirmed, 1 = confirmed, -1 = legacy unconfirmed
            update_sql = """
                UPDATE users 
                SET email_confirmed = 1 
                WHERE email IS NOT NULL AND email != '' AND email_confirmed = 0
            """
            result = connection.execute(text(update_sql))
            updated_rows = result.rowcount
            
            logger.info(f"Migration completed successfully!")
            logger.info(f"Updated {updated_rows} existing users to have confirmed emails")
            
            return True
            
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        return False

if __name__ == "__main__":
    print("Running email confirmation fields migration...")
    success = run_migration()
    if success:
        print("✅ Migration completed successfully!")
    else:
        print("❌ Migration failed. Check logs for details.")
        sys.exit(1)
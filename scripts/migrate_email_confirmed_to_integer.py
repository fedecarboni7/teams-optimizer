#!/usr/bin/env python3
"""
Migration script to convert email_confirmed column from Boolean to Integer.

This script:
1. Creates a backup of the current database
2. Adds a new email_confirmed_int column
3. Migrates data: True -> 1, False -> 0
4. Drops the old boolean column
5. Renames the new column to email_confirmed

Values:
- 0: New user with unconfirmed email (requires confirmation to login)
- -1: Legacy user with unconfirmed email (can login without confirmation)
- 1: Confirmed email (any user type)
"""

import os
import sys

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.config.logging_config import logger


def run_migration():
    """Run the migration to convert email_confirmed from Boolean to Integer."""
    try:
        # Get database URL from environment
        database_url = os.getenv("DATABASE_URL", "sqlite:///./test.db")
        logger.info(f"Running email_confirmed migration on database: {database_url}")
        
        # Create engine
        engine = create_engine(database_url)
        
        with engine.begin() as connection:
            # Check if migration is needed
            result = connection.execute(text("PRAGMA table_info(users)"))
            columns = {row[1]: row[2] for row in result.fetchall()}
            
            if 'email_confirmed' not in columns:
                logger.error("email_confirmed column not found!")
                return False
            
            # Check if email_confirmed is already INTEGER
            if 'INTEGER' in columns['email_confirmed'].upper():
                logger.info("email_confirmed column is already INTEGER. No migration needed.")
                return True
            
            logger.info("🔄 Starting migration of email_confirmed column...")
            
            # Step 1: Add new integer column
            logger.info("📝 Adding new email_confirmed_int column...")
            connection.execute(text("""
                ALTER TABLE users 
                ADD COLUMN email_confirmed_int INTEGER DEFAULT 0
            """))
            
            # Step 2: Migrate data from boolean to integer
            logger.info("🔄 Migrating data from Boolean to Integer...")
            connection.execute(text("""
                UPDATE users 
                SET email_confirmed_int = CASE 
                    WHEN email_confirmed = 1 THEN 1  -- Confirmed emails stay as 1
                    WHEN email_confirmed = 0 AND email IS NOT NULL THEN 0  -- Unconfirmed emails become 0 (new users)
                    ELSE 0  -- Default case
                END
            """))
            
            # Step 3: Verify the migration
            logger.info("🔍 Verifying migration...")
            result = connection.execute(text("""
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN email_confirmed_int = 1 THEN 1 ELSE 0 END) as confirmed,
                    SUM(CASE WHEN email_confirmed_int = 0 THEN 1 ELSE 0 END) as unconfirmed_new,
                    SUM(CASE WHEN email_confirmed_int = -1 THEN 1 ELSE 0 END) as unconfirmed_legacy
                FROM users
            """)).fetchone()
            
            logger.info(f"📊 Migration results:")
            logger.info(f"   Total users: {result.total}")
            logger.info(f"   Confirmed emails (1): {result.confirmed}")
            logger.info(f"   Unconfirmed new users (0): {result.unconfirmed_new}")
            logger.info(f"   Unconfirmed legacy users (-1): {result.unconfirmed_legacy}")
            
            # Step 4: Create new table with correct structure
            logger.info("🏗️  Creating new table structure...")
            connection.execute(text("""
                CREATE TABLE users_new (
                    id INTEGER PRIMARY KEY,
                    username VARCHAR UNIQUE NOT NULL,
                    password VARCHAR NOT NULL,
                    email VARCHAR UNIQUE,
                    email_confirmed INTEGER DEFAULT 0 NOT NULL,
                    email_confirmation_token VARCHAR,
                    email_confirmation_expires DATETIME
                )
            """))
            
            # Step 5: Copy data to new table
            logger.info("📋 Copying data to new table...")
            connection.execute(text("""
                INSERT INTO users_new (id, username, password, email, email_confirmed, email_confirmation_token, email_confirmation_expires)
                SELECT id, username, password, email, email_confirmed_int, email_confirmation_token, email_confirmation_expires
                FROM users
            """))
            
            # Step 6: Drop old table and rename new one
            logger.info("🔄 Replacing old table...")
            connection.execute(text("DROP TABLE users"))
            connection.execute(text("ALTER TABLE users_new RENAME TO users"))
            
            # Step 7: Recreate indexes
            logger.info("🔗 Recreating indexes...")
            connection.execute(text("CREATE UNIQUE INDEX ix_users_username ON users (username)"))
            connection.execute(text("CREATE UNIQUE INDEX ix_users_email ON users (email)"))
            connection.execute(text("CREATE INDEX ix_users_id ON users (id)"))
            
            logger.info("✅ Migration completed successfully!")
            logger.info("📝 Important notes:")
            logger.info("   - All existing users with unconfirmed emails are now marked as '0' (new users)")
            logger.info("   - They will need to confirm their email to login")
            logger.info("   - When legacy users add emails, they'll be marked as '-1' (can login without confirmation)")
            
            return True
            
    except Exception as e:
        logger.error(f"❌ Migration failed: {str(e)}")
        return False


def verify_migration():
    """Verify the migration was successful."""
    try:
        # Get database URL from environment
        database_url = os.getenv("DATABASE_URL", "sqlite:///./test.db")
        engine = create_engine(database_url)
        
        with engine.begin() as connection:
            # Check if the column exists and is integer
            result = connection.execute(text("PRAGMA table_info(users)")).fetchall()
            
            email_confirmed_info = None
            for column in result:
                if column[1] == 'email_confirmed':  # column[1] is the name
                    email_confirmed_info = column
                    break
            
            if email_confirmed_info:
                logger.info(f"✅ Column 'email_confirmed' found with type: {email_confirmed_info[2]}")
                
                # Check data distribution
                result = connection.execute(text("""
                    SELECT 
                        email_confirmed,
                        COUNT(*) as count,
                        GROUP_CONCAT(username, ', ') as usernames
                    FROM users 
                    GROUP BY email_confirmed
                    ORDER BY email_confirmed
                """)).fetchall()
                
                logger.info("📊 Current data distribution:")
                for row in result:
                    value_meaning = {
                        -1: "Legacy users (unconfirmed)",
                        0: "New users (unconfirmed)", 
                        1: "Confirmed users"
                    }.get(row[0], "Unknown")
                    
                    usernames = row[2][:50] + "..." if len(row[2]) > 50 else row[2]
                    logger.info(f"   {row[0]} ({value_meaning}): {row[1]} users - {usernames}")
                    
            else:
                logger.error("❌ Column 'email_confirmed' not found!")
                
    except Exception as e:
        logger.error(f"❌ Verification failed: {str(e)}")


if __name__ == "__main__":
    print("🚀 Email Confirmed Column Migration Script")
    print("=" * 50)
    
    # Ask for confirmation
    response = input("⚠️  This will modify your database. Continue? (y/N): ")
    if response.lower() != 'y':
        print("❌ Migration cancelled.")
        sys.exit(0)
    
    # Run migration
    success = run_migration()
    
    if success:
        print("\n🔍 Verifying migration...")
        verify_migration()
        print("\n✅ Migration completed!")
    else:
        print("\n❌ Migration failed. Check the backup file.")
        sys.exit(1)

"""
Migration script to add email field to User table and create PasswordResetToken table.
This script ensures backward compatibility with existing users.
"""

import sys
import os

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.db.models import Base
from app.config.logging_config import logger

def run_migration():
    """Run the database migration"""
    try:
        # Load environment variables
        from dotenv import load_dotenv
        load_dotenv()
        
        DATABASE_URL = os.getenv("DATABASE_URL")
        if not DATABASE_URL:
            raise ValueError("DATABASE_URL not found in environment variables")
        
        logger.info(f"Connecting to database: {DATABASE_URL}")
        engine = create_engine(DATABASE_URL, connect_args={'check_same_thread': False})
        
        # Check if we need to add the email column to existing users table
        with engine.connect() as conn:
            # Check if the email column exists
            try:
                result = conn.execute(text("PRAGMA table_info(users)"))
                columns = [row[1] for row in result.fetchall()]
                
                if 'email' not in columns:
                    logger.info("Adding email column to users table...")
                    conn.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR"))
                    conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users (email)"))
                    conn.commit()
                    logger.info("Email column added successfully")
                else:
                    logger.info("Email column already exists")
            except Exception as e:
                logger.info(f"Users table might not exist yet: {e}")
        
        # Create all tables (this will create PasswordResetToken and any other new tables)
        logger.info("Creating/updating all tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database migration completed successfully")
        
        return True
        
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        return False

if __name__ == "__main__":
    success = run_migration()
    if success:
        print("✅ Database migration completed successfully")
        sys.exit(0)
    else:
        print("❌ Database migration failed")
        sys.exit(1)

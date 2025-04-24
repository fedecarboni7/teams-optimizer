import os
import tempfile
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.db.database import engine
from app.db.models import User
from app.utils.auth import get_current_user
from app.utils.security import verify_admin_user
from app.config.logging_config import logger

router = APIRouter()

@router.post("/import-sql/")
async def import_sql(
    current_user: User = Depends(get_current_user),
    file: UploadFile = File(...)
    ):
    verify_admin_user(current_user, detail="Unauthorized: /docs")
    
    # Create a temporary file with proper OS path
    temp_fd, temp_path = tempfile.mkstemp(suffix=".sql")
    try:
        # Write uploaded content to the temporary file
        with os.fdopen(temp_fd, "wb") as f:
            f.write(await file.read())
        
        # Read the SQL script from the temporary file
        with open(temp_path, "r", encoding='utf-8') as sql_file:
            sql_script = sql_file.read()
            
        # Get the raw SQLite connection and use executescript
        raw_conn = engine.raw_connection()
        try:
            raw_conn.executescript(sql_script)
            raw_conn.commit()
        finally:
            raw_conn.close()
            
        return {"message": "Base de datos importada exitosamente"}
    except Exception as e:
        logger.error(f"Error executing SQL script: {e}")
        raise HTTPException(status_code=500, detail=f"Error importing database: {str(e)}")
    finally:
        # Clean up the temporary file (even if there's an error)
        if os.path.exists(temp_path):
            os.remove(temp_path)
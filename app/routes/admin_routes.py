from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.database_utils import get_db_structure
from app.utils import llm_service
from app.utils.security import verify_admin_user, verify_token

router = APIRouter()

def validate_sql_query(sql_query: str) -> str:
    if not llm_service.is_safe_query(sql_query):
        raise HTTPException(
            status_code=400,
            detail=f"Generated query is not safe: {sql_query}"
        )
    
    # Corregir la consulta SQL
    sql_query = sql_query.replace("```sql", "").replace("```", "").strip()
    return sql_query

class SQLQueryInput(BaseModel):
    query_description: str

class SQLQueryOutput(BaseModel):
    query: str
    result: str

@router.post("/generate-sql-query", response_model=SQLQueryOutput)
async def generate_and_execute_sql_query(
    input: SQLQueryInput,
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token)
):
    verify_admin_user(current_user, HTTPException(status_code=401, detail="Unauthorized"))

    # Obtener la estructura de la base de datos
    db_structure = get_db_structure(db)
    
    # Generar la consulta SQL usando el LLM
    sql_query = llm_service.generate_sql_query(input.query_description, db_structure)
    
    # Validar y sanitizar la consulta SQL
    sql_query = validate_sql_query(sql_query)

    # Ejecutar la consulta
    try:
        result = db.execute(text(sql_query))
        return SQLQueryOutput(query=sql_query, result=str(result.scalar()))
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error executing query: {str(e)}"
        )
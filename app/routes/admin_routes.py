from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.database_utils import get_db_structure
from app.utils import llm_service

router = APIRouter()

@router.post("/generate-sql-query")
async def generate_and_execute_sql_query(
    query_description: str,
    db: Session = Depends(get_db)
):
    # Obtener la estructura de la base de datos
    db_structure = get_db_structure(db)
    
    # Generar la consulta SQL usando el LLM
    sql_query = llm_service.generate_sql_query(query_description, db_structure)
    
    # Validar y sanitizar la consulta SQL
    if not llm_service.is_safe_query(sql_query):
        return {"Generated query is not safe": sql_query}
    
    # Corregir la consulta SQL
    sql_query = sql_query.replace("```sql", "").replace("```", "").strip()

    # Ejecutar la consulta
    try:
        result = db.execute(text(sql_query))
        return {"query": sql_query, "result": result.scalar()}
    except Exception as e:
        return {"query": sql_query, "Error executing query:": str(e)}
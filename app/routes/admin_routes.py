import os
import tempfile
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, Request
from fastapi.responses import HTMLResponse
from sqlalchemy import text

from app.config.config import templates
from app.db.database import engine, get_db
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

@router.get("/dashboard", response_class=HTMLResponse, include_in_schema=False)
async def admin_dashboard(
    request: Request,
    db = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_admin_user(current_user, detail="Unauthorized access.")
    
    try:
        # Consultas para estadísticas completas
        with db.connection() as conn:
            # Estadísticas básicas
            total_users = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
            users_with_players = conn.execute(text("SELECT COUNT(DISTINCT user_id) FROM players")).scalar()
            users_in_clubs = conn.execute(text("SELECT COUNT(DISTINCT user_id) FROM club_users")).scalar()
            total_clubs = conn.execute(text("SELECT COUNT(*) FROM clubs")).scalar()
            total_players = conn.execute(text("SELECT COUNT(*) FROM players")).scalar()
            
            # Datos de jugadores por club
            clubs_data = conn.execute(
                text("""
                    SELECT c.id, c.name, COUNT(p.id) as players_count
                    FROM clubs c
                    LEFT JOIN players p ON c.id = p.club_id
                    GROUP BY c.id, c.name
                    ORDER BY players_count DESC
                """)
            ).fetchall()
            
            clubs_data = [
                {"id": club.id, "name": club.name, "players_count": club.players_count}
                for club in clubs_data
            ]
            
            # Clubes creados recientemente (último mes)
            recent_clubs = conn.execute(
                text("""
                    SELECT COUNT(*) FROM clubs 
                    WHERE creation_date >= date('now', '-1 month')
                """)
            ).scalar()
            
            # Promedio de jugadores por club
            avg_players_per_club = conn.execute(
                text("""
                    SELECT AVG(player_count) 
                    FROM (
                        SELECT COUNT(*) as player_count 
                        FROM players 
                        WHERE club_id IS NOT NULL
                        GROUP BY club_id
                    )
                """)
            ).scalar() or 0
            avg_players_per_club = round(avg_players_per_club, 1) if avg_players_per_club else 0
            
            # Promedio de jugadores por usuario (solo usuarios activos)
            avg_players_per_user = round(total_players / users_with_players, 1) if users_with_players > 0 else 0
            
            # Calcular usuarios activos (que han creado jugadores O están en clubes)
            active_users = conn.execute(
                text("""
                    SELECT COUNT(DISTINCT user_id) FROM (
                        SELECT user_id FROM players
                        UNION
                        SELECT user_id FROM club_users
                    )
                """)
            ).scalar()
            
        # Tasas de engagement
        engagement_rate = round((active_users / total_users) * 100, 1) if total_users > 0 else 0
        player_creation_rate = round((users_with_players / total_users) * 100, 1) if total_users > 0 else 0
        club_participation_rate = round((users_in_clubs / total_users) * 100, 1) if total_users > 0 else 0
        
        # Preparar datos para la plantilla
        stats = {
            "total_users": total_users,
            "users_with_players": users_with_players,
            "users_in_clubs": users_in_clubs,
            "total_clubs": total_clubs,
            "total_players": total_players,
            "active_users": active_users,
            "engagement_rate": engagement_rate,
            "player_creation_rate": player_creation_rate,
            "club_participation_rate": club_participation_rate,
            "recent_clubs": recent_clubs,
            "avg_players_per_club": avg_players_per_club,
            "avg_players_per_user": avg_players_per_user
        }
        
        return templates.TemplateResponse(
            request=request,
            name="admin_dashboard.html",
            context={
                "stats": stats,
                "clubs_data": clubs_data
            }
        )
    except Exception as e:
        logger.error(f"Error loading admin dashboard: {e}")
        raise HTTPException(status_code=500, detail=f"Error loading dashboard: {str(e)}")

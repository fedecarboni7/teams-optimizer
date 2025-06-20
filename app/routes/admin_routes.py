from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from sqlalchemy import text

from app.config.config import templates
from app.db.database import get_db
from app.db.models import User
from app.utils.auth import get_current_user
from app.utils.security import verify_admin_user
from app.config.logging_config import logger

router = APIRouter()

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

            # Promedio de jugadores por usuario (solo usuarios activos)
            avg_players_per_user = round(total_players / users_with_players, 1) if users_with_players > 0 else 0
            
            # Promedio de usuarios por club
            avg_users_per_club = conn.execute(
                text("""
                    SELECT AVG(user_count) 
                    FROM (
                        SELECT COUNT(*) as user_count 
                        FROM club_users 
                        GROUP BY club_id
                    )
                """)
            ).scalar() or 0
            avg_users_per_club = round(avg_users_per_club, 1) if avg_users_per_club else 0
            
            # Usuarios nuevos en diferentes períodos
            new_users_24h = conn.execute(
                text("""
                    SELECT COUNT(*) FROM users 
                    WHERE created_at >= datetime('now', '-1 day')
                """)
            ).scalar()
            
            new_users_week = conn.execute(
                text("""
                    SELECT COUNT(*) FROM users 
                    WHERE created_at >= datetime('now', '-7 days')
                """)
            ).scalar()
            
            new_users_month = conn.execute(
                text("""
                    SELECT COUNT(*) FROM users 
                    WHERE created_at >= datetime('now', '-1 month')
                """)
            ).scalar()

            # Clubes nuevos en diferentes períodos
            new_clubs_24h = conn.execute(
                text("""
                    SELECT COUNT(*) FROM clubs 
                    WHERE creation_date >= datetime('now', '-1 day')
                """)
            ).scalar()

            new_clubs_week = conn.execute(
                text("""
                    SELECT COUNT(*) FROM clubs 
                    WHERE creation_date >= datetime('now', '-7 days')
                """)
            ).scalar()

            new_clubs_month = conn.execute(
                text("""
                    SELECT COUNT(*) FROM clubs 
                    WHERE creation_date >= datetime('now', '-1 month')
                """)
            ).scalar()

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
            "active_users": active_users,
            "engagement_rate": engagement_rate,
            "player_creation_rate": player_creation_rate,
            "club_participation_rate": club_participation_rate,
            "new_clubs_24h": new_clubs_24h,
            "new_clubs_week": new_clubs_week,
            "new_clubs_month": new_clubs_month,
            "avg_players_per_user": avg_players_per_user,
            "avg_users_per_club": avg_users_per_club,
            "new_users_24h": new_users_24h,
            "new_users_week": new_users_week,
            "new_users_month": new_users_month
        }
        
        return templates.TemplateResponse(
            request=request,
            name="admin_dashboard.html",
            context={
                "stats": stats
            }
        )
    except Exception as e:
        logger.error(f"Error loading admin dashboard: {e}")
        raise HTTPException(status_code=500, detail=f"Error loading dashboard: {str(e)}")

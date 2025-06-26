"""
Script para migrar datos de players (escala 1-5) a players_v2 (escala 1-10)
Multiplica cada puntuación por 2 para convertir de escala 1-5 a 1-10
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.models import Base, Player, PlayerV2
from app.config.settings import Settings

def migrate_players_to_v2():
    """Migra todos los jugadores de la tabla players a players_v2 con escala 1-10"""
    
    # Configurar base de datos
    settings = Settings()
    engine = create_engine(settings.database_url)
    
    # Crear las tablas nuevas si no existen
    Base.metadata.create_all(bind=engine)
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Obtener todos los jugadores de la tabla original
        players = db.query(Player).all()
        print(f"Encontrados {len(players)} jugadores para migrar")
        
        migrated_count = 0
        
        for player in players:
            # Verificar si ya existe en players_v2
            existing_v2 = db.query(PlayerV2).filter(PlayerV2.id == player.id).first()
            if existing_v2:
                print(f"Jugador {player.name} (ID: {player.id}) ya migrado, saltando...")
                continue
            
            # Crear nuevo jugador en players_v2 con puntuaciones multiplicadas por 2
            player_v2 = PlayerV2(
                name=player.name,
                velocidad=min(player.velocidad * 2, 10) if player.velocidad else 2,
                resistencia=min(player.resistencia * 2, 10) if player.resistencia else 2,
                control=min(player.control * 2, 10) if player.control else 2,
                pases=min(player.pases * 2, 10) if player.pases else 2,
                tiro=min(player.tiro * 2, 10) if player.tiro else 2,
                defensa=min(player.defensa * 2, 10) if player.defensa else 2,
                habilidad_arquero=min(player.habilidad_arquero * 2, 10) if player.habilidad_arquero else 2,
                fuerza_cuerpo=min(player.fuerza_cuerpo * 2, 10) if player.fuerza_cuerpo else 2,
                vision=min(player.vision * 2, 10) if player.vision else 2,
                user_id=player.user_id,
                club_id=player.club_id,
                updated_at=player.updated_at,
                last_modified_by=player.last_modified_by
            )
            
            db.add(player_v2)
            migrated_count += 1
            print(f"Migrando jugador: {player.name} (ID: {player.id})")
        
        # Commit de los jugadores
        db.commit()
        print(f"✅ Migrados {migrated_count} jugadores a players_v2")

        print("🎉 Migración completada exitosamente!")
        
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🔄 Iniciando migración de players a escala 1-10...")
    migrate_players_to_v2()

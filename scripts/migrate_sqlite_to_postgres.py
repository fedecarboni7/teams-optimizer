"""
Script para migrar datos de SQLite a PostgreSQL sin pérdida de datos.

Uso:
    python scripts/migrate_sqlite_to_postgres.py

Variables de entorno requeridas:
    SQLITE_DATABASE_URL: URL de la base de datos SQLite (ej: sqlite:///./teams_optimizer.db)
    POSTGRES_DATABASE_URL: URL de la base de datos PostgreSQL de Railway
"""

import os
import sys
from datetime import datetime

from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker

# Agregar el directorio raíz al path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.models import (
    Base, User, Player, PlayerV2, SkillVote, SkillVoteV2,
    Club, ClubUser, ClubInvitation, PasswordResetToken
)


def get_table_row_count(engine, table_name):
    """Obtiene el número de filas de una tabla"""
    with engine.connect() as conn:
        result = conn.execute(f"SELECT COUNT(*) FROM {table_name}")
        return result.scalar()


def migrate_data():
    """Migra todos los datos de SQLite a PostgreSQL"""
    
    # Obtener URLs de las bases de datos
    sqlite_url = os.getenv("SQLITE_DATABASE_URL", "sqlite:///./teams_optimizer.db")
    postgres_url = os.getenv("POSTGRES_DATABASE_URL")
    
    if not postgres_url:
        print("❌ Error: POSTGRES_DATABASE_URL no está configurada")
        print("Configúrala en tu archivo .env o como variable de entorno")
        sys.exit(1)
    
    print(f"🔄 Iniciando migración de datos...")
    print(f"  Origen (SQLite): {sqlite_url}")
    print(f"  Destino (PostgreSQL): {postgres_url[:50]}...")
    print()
    
    # Ajustar URL para usar psycopg3 si es PostgreSQL
    if postgres_url.startswith('postgresql://'):
        postgres_url = postgres_url.replace('postgresql://', 'postgresql+psycopg://', 1)
        print(f"  Usando dialecto psycopg3 (psycopg versión 3)")
        print()
    
    # Crear engines
    sqlite_engine = create_engine(sqlite_url)
    postgres_engine = create_engine(postgres_url)
    
    # Verificar que SQLite existe y tiene datos
    inspector = inspect(sqlite_engine)
    if not inspector.get_table_names():
        print("❌ Error: No se encontraron tablas en SQLite")
        sys.exit(1)
    
    # Crear todas las tablas en PostgreSQL
    print("📋 Creando estructura de tablas en PostgreSQL...")
    Base.metadata.create_all(postgres_engine)
    print("✅ Estructura creada")
    print()
    
    # Crear sesiones
    SqliteSession = sessionmaker(bind=sqlite_engine)
    PostgresSession = sessionmaker(bind=postgres_engine)
    
    sqlite_session = SqliteSession()
    postgres_session = PostgresSession()
    
    # Orden de migración (respetando foreign keys)
    migration_order = [
        (User, "users"),
        (Club, "clubs"),
        (ClubUser, "club_users"),
        (Player, "players"),
        (PlayerV2, "players_v2"),
        (SkillVote, "skill_votes"),
        (SkillVoteV2, "skill_votes_v2"),
        (ClubInvitation, "club_invitations"),
        (PasswordResetToken, "password_reset_tokens"),
    ]
    
    migration_stats = {}
    
    try:
        for model, table_name in migration_order:
            # Verificar si la tabla existe en SQLite
            if table_name not in inspector.get_table_names():
                print(f"⚠️  Tabla {table_name} no existe en SQLite, omitiendo...")
                continue
            
            print(f"🔄 Migrando {table_name}...", end=" ", flush=True)
            
            # Leer todos los registros de SQLite
            records = sqlite_session.query(model).all()
            
            if not records:
                print(f"(0 registros)")
                migration_stats[table_name] = 0
                continue
            
            # Insertar en PostgreSQL
            migrated_count = 0
            for record in records:
                # Crear diccionario con los datos del registro
                record_dict = {}
                for column in model.__table__.columns:
                    value = getattr(record, column.name)
                    record_dict[column.name] = value
                
                # Crear nuevo objeto en PostgreSQL
                new_record = model(**record_dict)
                postgres_session.add(new_record)
                migrated_count += 1
            
            # Commit después de cada tabla
            postgres_session.commit()
            print(f"✅ ({migrated_count} registros)")
            migration_stats[table_name] = migrated_count
        
        print()
        print("=" * 60)
        print("✅ Migración completada exitosamente!")
        print("=" * 60)
        print()
        print("📊 Resumen de migración:")
        for table_name, count in migration_stats.items():
            print(f"  • {table_name:<30} {count:>6} registros")
        print()
        print(f"📅 Fecha de migración: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Verificar integridad
        print("🔍 Verificando integridad de datos...")
        verification_passed = True
        for model, table_name in migration_order:
            if table_name not in migration_stats:
                continue
            
            sqlite_count = sqlite_session.query(model).count()
            postgres_count = postgres_session.query(model).count()
            
            if sqlite_count != postgres_count:
                print(f"  ❌ {table_name}: SQLite={sqlite_count}, PostgreSQL={postgres_count}")
                verification_passed = False
            else:
                print(f"  ✅ {table_name}: {postgres_count} registros")
        
        print()
        if verification_passed:
            print("✅ Verificación de integridad exitosa!")
            print()
            print("🎉 ¡Tu aplicación está lista para usar PostgreSQL!")
            print()
            print("📝 Próximos pasos:")
            print("  1. Actualiza DATABASE_URL en Railway con la URL de PostgreSQL")
            print("  2. Despliega tu aplicación")
            print("  3. Verifica que todo funcione correctamente")
            print("  4. (Opcional) Haz un backup de tu SQLite antes de eliminarlo")
        else:
            print("⚠️  Hay diferencias en los conteos. Revisa los datos antes de continuar.")
        
    except Exception as e:
        print(f"\n❌ Error durante la migración: {e}")
        postgres_session.rollback()
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        sqlite_session.close()
        postgres_session.close()


if __name__ == "__main__":
    migrate_data()

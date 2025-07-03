import os
import sys

from app.config.config import create_app
from app.config.settings import Settings
from app.routes.player_routes import router as player_router
from app.routes.auth_routes import router as auth_router
from app.routes.main_routes import router as main_router
from app.routes.clubs_routes import router as clubs_router
from app.routes.public_routes import router as public_router
from app.routes.admin_routes import router as admin_router

# Check if migration should be run
if Settings().run_db_migration:
    print("🔄 Running database migration...")
    try:
        # Add scripts directory to path
        scripts_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "scripts")
        sys.path.insert(0, scripts_path)
        
        from migrate_to_v2_scale import run_migration
        
        success = run_migration()
        if success:
            print("✅ Database migration completed successfully")
        else:
            print("❌ Database migration failed")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Error running migration: {e}")
        sys.exit(1)

app = create_app()

app.include_router(player_router, tags=["player"])
app.include_router(auth_router, tags=["auth"])
app.include_router(main_router, tags=["main"])
app.include_router(clubs_router, tags=["clubs"])
app.include_router(public_router, tags=["public"])
app.include_router(admin_router, tags=["admin"])

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

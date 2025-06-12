import os
import sys

from app.config.config import create_app
from app.routes.player_routes import router as player_router
from app.routes.auth_routes import router as auth_router
from app.routes.main_routes import router as main_router
from app.routes.clubs_routes import router as clubs_router
from app.routes.public_routes import router as public_router
from app.routes.admin_routes import router as admin_router

# Check if email confirmed migration should be run
if os.getenv("RUN_EMAIL_MIGRATION") == "true":
    print("🔄 Running email confirmed migration...")
    try:
        # Add scripts directory to path
        scripts_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "scripts")
        sys.path.insert(0, scripts_path)
        
        from migrate_email_confirmed_to_integer import run_migration as run_email_migration
        
        success = run_email_migration()
        if success:
            print("✅ Email confirmed migration completed successfully")
        else:
            print("❌ Email confirmed migration failed")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Error running email migration: {e}")
        sys.exit(1)
    finally:
        # Remove the environment variable to prevent running migration again
        if "RUN_EMAIL_MIGRATION" in os.environ:
            del os.environ["RUN_EMAIL_MIGRATION"]

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

from app.config.config import create_app
from app.routes.player_routes import router as player_router
from app.routes.auth_routes import router as auth_router
from app.routes.admin_routes import router as admin_router

app = create_app()

app.include_router(player_router)
app.include_router(auth_router)
app.include_router(admin_router)
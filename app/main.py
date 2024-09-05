from app.config.config import create_app
from app.routes.player_routes import router as player_router
from app.routes.auth_routes import router as auth_router
from app.routes.main_routes import router as main_router

app = create_app()

app.include_router(player_router)
app.include_router(auth_router)
app.include_router(main_router)
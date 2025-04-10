from app.config.config import create_app
from app.routes.player_routes import router as player_router
from app.routes.auth_routes import router as auth_router
from app.routes.main_routes import router as main_router
from app.routes.clubs_routes import router as clubs_router
from app.routes.public_routes import router as public_router

app = create_app()

app.include_router(player_router, tags=["player"])
app.include_router(auth_router, tags=["auth"])
app.include_router(main_router, tags=["main"])
app.include_router(clubs_router, tags=["clubs"])
app.include_router(public_router, tags=["public"])

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

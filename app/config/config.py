import os

from fastapi import Depends, FastAPI, Request
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.sessions import SessionMiddleware

from app.config.logging_config import configure_logging
from app.config.settings import Settings
from app.db.models import User
from app.utils.auth import get_current_user
from app.utils.security import verify_admin_user

templates = Jinja2Templates(directory="templates")

def create_app() -> FastAPI:
    # Configuración de logging
    configure_logging()

    secret_key = Settings().secret_key

    app = FastAPI(title="Armar Equipos", docs_url=None, redoc_url=None, openapi_url=None)

    app.add_middleware(SessionMiddleware, secret_key=secret_key)
    
    app.mount("/static", StaticFiles(directory="static"), name="static")

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        if exc.status_code in [405]:  # Not Found y Method Not Allowed
            return RedirectResponse(url="/home")
        
        if exc.status_code == 404:
            return templates.TemplateResponse(request=request, name="404.html", status_code=404, context={"error": exc.detail})

        if exc.status_code == 500:
            return templates.TemplateResponse(request=request, name="500.html", status_code=500)

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.status_code,
                "detail": exc.detail
            }
        )
    
    @app.get("/docs", include_in_schema=False)
    async def get_documentation(current_user: User = Depends(get_current_user)):
        verify_admin_user(current_user, detail="Unauthorized: /docs")
        return get_swagger_ui_html(openapi_url="/openapi.json", title="docs")

    @app.get("/openapi.json", include_in_schema=False)
    async def openapi(current_user: User = Depends(get_current_user)):
        verify_admin_user(current_user, detail="Unauthorized: /openapi.json")
        return app.openapi()

    @app.middleware("http")
    async def redirect_to_new_domain(request: Request, call_next):
        # Redirigir de armarequipos.lat a armarequipos.up.railway.app
        # TODO: Eliminar este middleware después del 7 de enero 2026 (ya no tendremos el dominio .lat)
        old_domain = "armarequipos.lat"
        new_domain = "armarequipos.up.railway.app"
        
        if request.url.hostname and old_domain in request.url.hostname:
            new_url = str(request.url).replace(old_domain, new_domain)
            return RedirectResponse(url=new_url, status_code=301)
        return await call_next(request)

    return app
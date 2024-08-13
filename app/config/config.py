import os
import time

from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.sessions import SessionMiddleware

from app.config.logging_config import configure_logging, logger

templates = Jinja2Templates(directory="templates")

def create_app() -> FastAPI:
    app = FastAPI(docs_url=None, redoc_url=None)

    # Configuración de logging
    configure_logging()

    secret_key = os.getenv("SECRET_KEY")
    app.add_middleware(SessionMiddleware, secret_key=secret_key)
    
    app.mount("/static", StaticFiles(directory="static"), name="static")

    @app.middleware("http")
    async def measure_execution_time(request: Request, call_next):
        ignore_paths = ["/static", "/favicon.ico", "/sm/"]
        
        if not any(request.url.path.startswith(prefix) for prefix in ignore_paths):
            start_time = time.time()
            response = await call_next(request)
            process_time = time.time() - start_time
            logger.debug(f"{process_time:.4f} seconds to process request: {request.method} {request.url.path}")
            return response
        else:
            return await call_next(request)

    @app.exception_handler(500)
    async def internal_server_error_handler(request: Request, exc: Exception):
        """
        Maneja los errores del servidor y muestra una página de error personalizada.
        """
        return templates.TemplateResponse(request=request, name="500.html", status_code=500)


    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        if exc.status_code in [404, 405]:  # Not Found y Method Not Allowed
            return RedirectResponse(url="/")
        raise exc

    return app
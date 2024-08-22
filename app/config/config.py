from datetime import datetime
import os
import traceback

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import pytz
from sqlalchemy.orm import Session
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.sessions import SessionMiddleware

from app.config.logging_config import configure_logging
from app.db.database import SessionLocal
from app.db.models import ErrorLog


templates = Jinja2Templates(directory="templates")

def get_buenos_aires_time():
    return datetime.now(pytz.timezone('America/Argentina/Buenos_Aires'))

def create_app() -> FastAPI:
    app = FastAPI(title="Armar Equipos")

    # Configuración de logging
    configure_logging()

    secret_key = os.getenv("SECRET_KEY")
    app.add_middleware(SessionMiddleware, secret_key=secret_key)
    
    app.mount("/static", StaticFiles(directory="static"), name="static")

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        session_id = request.cookies.get("session_id")
        user_id = request.session.get("user_id")
        db: Session = SessionLocal()
        try:
            error_log = ErrorLog(
                user_id=user_id,
                session_id=session_id,
                error_code=exc.status_code,
                error_message=str(exc.detail),
                stack_trace=traceback.format_exc(),
                created_at=get_buenos_aires_time()
            )
            db.add(error_log)
            db.commit()
        finally:
            db.close()
        if exc.status_code in [404, 405]:  # Not Found y Method Not Allowed
            return RedirectResponse(url="/")
        elif exc.status_code == 500 and "Error executing query" not in str(exc.detail):
            return templates.TemplateResponse(request=request, name="500.html", status_code=500)

        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )

    return app
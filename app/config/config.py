from datetime import datetime
import os
import traceback
import uuid

from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import pytz
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.sessions import SessionMiddleware

from app.config.logging_config import configure_logging
from app.db.database import SessionLocal
from app.db.models import ErrorLog, UserSession

templates = Jinja2Templates(directory="templates")

def get_buenos_aires_time():
    return datetime.now(pytz.timezone('America/Argentina/Buenos_Aires'))

def create_app() -> FastAPI:
    app = FastAPI(docs_url="/admin", redoc_url=None)

    # Configuración de logging
    configure_logging()

    secret_key = os.getenv("SECRET_KEY")
    app.add_middleware(SessionMiddleware, secret_key=secret_key)
    
    app.mount("/static", StaticFiles(directory="static"), name="static")

    @app.middleware("http")
    async def session_middleware(request: Request, call_next):
        session_id = request.cookies.get("session_id")
        if not session_id:
            session_id = str(uuid.uuid4())
            response = await call_next(request)
            response.set_cookie(key="session_id", value=session_id)
        else:
            response = await call_next(request)

        # Registrar o actualizar la sesión en la base de datos
        db = SessionLocal()
        user_id = request.session.get("user_id")
        session = db.query(UserSession).filter(UserSession.session_id == session_id).first()
        if not session:
            new_session = UserSession(user_id=user_id, session_id=session_id, created_at=get_buenos_aires_time(), last_activity=get_buenos_aires_time())
            db.add(new_session)
        else:
            session.last_activity = get_buenos_aires_time()
        db.commit()
        db.close()

        return response

    @app.exception_handler(500)
    async def internal_server_error_handler(request: Request, exc: Exception):
        db = SessionLocal()
        session_id = request.cookies.get("session_id")
        user_id = request.session.get("user_id")
        error_log = ErrorLog(
            user_id=user_id,
            session_id=session_id,
            error_message=str(exc),
            stack_trace=traceback.format_exc(),
            created_at=get_buenos_aires_time()
        )
        db.add(error_log)
        db.commit()
        db.close()
        return templates.TemplateResponse(request=request, name="500.html", status_code=500)


    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        if exc.status_code in [404, 405]:  # Not Found y Method Not Allowed
            return RedirectResponse(url="/")
        raise exc

    return app
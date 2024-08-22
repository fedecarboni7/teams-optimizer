from datetime import datetime, timedelta, timezone
import os

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import jwt


SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Token inválido")
        return username
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")
    
def verify_admin_user(current_user: str, http_exc: HTTPException):
    if current_user not in ["admin", "fedecarboni7"]:
        raise http_exc

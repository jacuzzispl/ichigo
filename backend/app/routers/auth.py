from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pwdlib import PasswordHash
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta, timezone
from database import get_db
from ..models import User
from ..schemas import TokenResponse, RegisterRequest
import jwt
from jwt.exceptions import InvalidTokenError
import os
from typing import Annotated

router = APIRouter()


SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

password_hash = PasswordHash.recommended()
DUMMY_HASH = password_hash.hash("dummypassword")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class TokenData(BaseModel):
    user_id: int | None


def verify_password(password: str, db_password: str) -> bool:
    return password_hash.verify(password, db_password)

def get_password_hash(password: str) -> str:
    return password_hash.hash(password)

async def get_user(username: str, session: AsyncSession) -> User | None:
    #check if the username exists

    query = await session.execute(select(User).where(User.username == username))
    user = query.scalar_one_or_none()

    return user if user else None

async def authenticate_user(username: str, password: str, session: AsyncSession) -> User | bool:
    user = await get_user(username=username, session=session)
    if not user:
        verify_password(password, DUMMY_HASH)
        return False
    if not verify_password(password, user.password_hash):
        return False
    return user


async def create_access_token(data: dict, expires_delta: timedelta | None = None):
    payload = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + timedelta(minutes=expires_delta)
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload["exp"] = expire
    encoded_jwt = jwt.encode(payload, key=SECRET_KEY, algorithm=ALGORITHM) 

    return encoded_jwt

async def get_current_user(session: AsyncSession, token: str):

    credentials_exception = HTTPException(
        status_code=401,
        detail="Credentials Exception"
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            print(user_id)
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except InvalidTokenError:
        raise credentials_exception
    result = await session.scalars(select(User).where(User.id == token_data.user_id))
    user = result.one_or_none()
    print(user)
    if not user:
        raise credentials_exception
    return user

@router.post("/token", response_model=TokenResponse)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                                  session: Annotated[AsyncSession, Depends(get_db)]) -> TokenResponse:
    
    user = await authenticate_user(username=form_data.username, password=form_data.password, session=session)
    if not user:
        raise HTTPException(status_code=401, detail="Wrong email or password")
    return TokenResponse(
        access_token= await create_access_token(data={"sub": str(user.id)}),
        token_type="bearer"
    )

@router.post("/register", response_model=TokenResponse)
async def register(session: Annotated[AsyncSession, Depends(get_db)], registration_data: RegisterRequest) -> TokenResponse:
    query = await session.execute(select(User).where(User.email==registration_data.email))
    existing_user = query.scalar_one_or_none()
    if existing_user:

        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email= registration_data.email,
        password_hash = password_hash.hash(registration_data.password),
        created_at=datetime.now(timezone.utc)
    )

    session.add(user)
    await session.commit()
    await session.refresh(user)

    return TokenResponse(
        access_token= await create_access_token(data={"sub": str(user.id)}),
        token_type="bearer"
    )





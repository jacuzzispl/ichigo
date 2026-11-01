from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from typing import Annotated, List
from app.models import UserKanjiEntry, Kanji
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
import os
from utils.db import check_if_first_review
from scripts.seed_study_kanji import seed_study_kanji

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
SECRET_KEY = os.getenv("SECRET_KEY")

@router.get("/study")
async def get_study_kanji(session: Annotated[AsyncSession, Depends(get_db)],
                           token = Depends(oauth2_scheme)):
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload["sub"]

        if user_id is None:
            return HTTPException(status_code=401, detail="Could not find user")
        
        await check_if_first_review(int(user_id), 1, session)
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired. Sign in again.")
    except:
        raise HTTPException(status_code=401)
    

    kanji_to_study = await session.execute(select(UserKanjiEntry).where(UserKanjiEntry.status == "Not Learned",
                                                                        UserKanjiEntry.user_id == int(user_id)).limit(5))
    
    setStudy = kanji_to_study.scalars().all()

    return [i.kanji for i in setStudy]




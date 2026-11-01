from typing import Annotated
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends, APIRouter
from app.database import get_db
from app.routers.auth import get_current_user, oauth2_scheme
from app.models.UserKanji import UserKanjiEntry
from app.models.Kanji import Kanji
from app.schemas.kanji import KanjiCard

from datetime import datetime, timezone

router = APIRouter()


@router.get("/due", response_model=list[KanjiCard])
async def get_due_kanji(session: Annotated[AsyncSession, Depends(get_db)],
                        token: Annotated[str, Depends(oauth2_scheme)],
                        limit: int = 30):

    user = await get_current_user(session, token)
    now = datetime.now(timezone.utc)
    result = await session.execute(select(UserKanjiEntry)
                                   .where(UserKanjiEntry.id == user.id,UserKanjiEntry.next_review_at <= now)
                                                                .order_by(UserKanjiEntry.next_review_at)
                                                                .limit(limit)
                                                                )
    return result.scalars().all()

@router.get("/studied", response_model=list[KanjiCard])
async def get_studied_kanji(session: Annotated[AsyncSession, Depends(get_db)],
                        token: Annotated[str, Depends(oauth2_scheme)]):
    user = await get_current_user(session, token)
    result = await session.execute(select(UserKanjiEntry).where(UserKanjiEntry.user_id == user.id, UserKanjiEntry.status != "Not Learned"))
    
    return [uk.kanji for uk in result.scalars().all()]
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db   
from app.routers.auth import get_current_user, oauth2_scheme
from app.models.ReviewLog import Review
from app.models.Users import User
from app.models.UserKanji import UserKanjiEntry
from app.schemas.lessons import (
    KanjiResultOut,
    LessonCompletePayload,
    LessonCompleteResponse,
)
from app.services.srs import SrsState, quality_from_answers, sm2
from typing import Annotated

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.post("/complete")
async def complete_lesson(
    session : Annotated[AsyncSession, Depends(get_db)], token: Annotated[str, Depends(oauth2_scheme)], results: LessonCompletePayload
):
    user = await get_current_user(session=session, token=token)
    kanji_ids = [r.kanji_id for r in results.results]
    if len(set(kanji_ids)) != len(kanji_ids):
        raise HTTPException(status_code=400, detail="Duplicate kanji_id in results")

    # One query for all of this user's SRS rows involved in the session
    print(type(user.id))
    rows = await session.execute(
        select(UserKanjiEntry).where(
            UserKanjiEntry.user_id == int(user.id),
            UserKanjiEntry.kanji_id.in_(kanji_ids),
        )
    )
    states = {uk.kanji_id: uk for uk in rows.scalars().all()}

    missing = set(kanji_ids) - states.keys()
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Kanji not in your collection: {sorted(missing)}",
        )

    now = datetime.now(timezone.utc)
    out: list[KanjiResultOut] = []

    for result in results.results:
        uk = states[result.kanji_id]
        q, m_wrong, r_wrong, med_ms = quality_from_answers(result.answers)

        before = SrsState(uk.repetitions, uk.ease_factor, uk.interval_days)
        after = sm2(q, before)

        session.add(
            Review(
                user_id=user.id,
                kanji_id=result.kanji_id,
                reviewed_at=now,
                quality=q,
                meaning_incorrect=m_wrong,
                reading_incorrect=r_wrong,
                response_ms=med_ms,
                ease_factor_before=before.ease_factor,
                ease_factor_after=after.ease_factor,
                interval_before=before.interval_days,
                interval_after=after.interval_days,
            )
        )

        uk.repetitions = after.repetitions
        uk.ease_factor = after.ease_factor
        uk.interval_days = after.interval_days
        uk.next_review_at = now + timedelta(days=after.interval_days)

        out.append(
            KanjiResultOut(
                kanji_id=result.kanji_id,
                quality=q,
                interval_days=after.interval_days,
                next_review_at=uk.next_review_at,
            )
        )

    print("submission received")
    await session.commit()
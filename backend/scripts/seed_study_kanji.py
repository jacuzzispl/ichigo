from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Kanji, UserKanjiEntry
from app.database import SessionLocal
import asyncio

async def seed_study_kanji(user_id: int , level: int) -> None:
    #get all the kanji from db by their jlpt level
    async with SessionLocal() as session:
        query = await session.execute(select(Kanji).where(Kanji.jlpt_level == level))
        result = query.scalars()
    for kanji in result:
        kanji_for_study = UserKanjiEntry(user_id=user_id,
                                          kanji_id=kanji.id,
                                            status="Not Learned"
                                            )
        session.add(kanji_for_study)
    
    await session.commit()


if __name__ == "__main__":
    asyncio.run(seed_study_kanji(1, 1))
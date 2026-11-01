from sqlalchemy import inspect, select, func, text, exists
from fastapi import HTTPException
from app.models.UserKanji import UserKanjiEntry
from sqlalchemy.orm import Session 
from sqlalchemy.ext.asyncio import AsyncSession
from scripts.seed_study_kanji import seed_study_kanji

def table_exists(table, engine):
    inspector = inspect(engine)
    return inspector.has_table(table)

async def table_is_populated(table:str, session: AsyncSession):
    select_statement = select(func.count()).select_from(text(table))
    result = session.scalars(select_statement).first()
    return [result > 0, result]
    

async def check_if_first_review(user_id: int, level: int, session: AsyncSession):
    try:
        has_rows = await session.scalar(select(exists().where(UserKanjiEntry.user_id == user_id)))
        if not has_rows:
            await seed_study_kanji(int(user_id), 1)
    except:
        raise HTTPException(status_code=422, detail="Error checking database.")
    
    
    


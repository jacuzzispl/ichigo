from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.engine import make_url
from dotenv import load_dotenv
import os

load_dotenv()

def async_url(url : str):
    u = make_url(url).set(drivername="postgresql+asyncpg")
    q = dict(u.query)
    q.pop("channel_binding", None)
    if q.pop("sslmode", None):
        q["ssl"] = "require"
    return u.set(query=q)


engine = create_async_engine(async_url(os.getenv("DATABASE_URL")))
SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine, expire_on_commit=False)

async def get_db():
    async with SessionLocal() as session:
        yield session
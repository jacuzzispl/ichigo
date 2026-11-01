from fastapi import FastAPI
from app.database import engine
from .routers import auth, kanji, lessons, reviews, story
from fastapi.middleware.cors import CORSMiddleware
import os

origins = ["*", os.getenv(key="FRONTEND_URL")]

app = FastAPI()
app.include_router(auth.router)
app.include_router(kanji.router)
app.include_router(lessons.router)
app.include_router(reviews.router)
app.include_router(story.router)

app.add_middleware(CORSMiddleware,
                   allow_origins=origins,
                   allow_credentials=True,
                   allow_methods=["*"],
                   allow_headers=["*"])

@app.get("/")
def home():
    try:
        with engine.connect() as conn:
            return {"status" : "ok", "database" : "connected"}
    except Exception as e:
        return {"status" : "ok", "database" : str(e)}

@app.get("/active")
def active():
    return {"server": "active"}
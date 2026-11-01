from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime, timezone
from typing import Optional
from .Base import Base


class Kanji(Base):
    __tablename__ = "kanji"
    id : Mapped[int] = mapped_column(primary_key=True, 	autoincrement=True)
    character : Mapped[str] = mapped_column(String)
    meaning: Mapped[str]
    jlpt_level : Mapped[int]
    curriculumn_order : Mapped[Optional[int]]
    onyomi: Mapped[Optional[str]]
    kunyomi: Mapped[Optional[str]]
    radical: Mapped[Optional[str]]
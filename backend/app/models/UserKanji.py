from sqlalchemy import ForeignKey, DateTime, String, Integer, Float, func
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime 
from .Base import Base
from typing import Optional

class UserKanjiEntry(Base):
    __tablename__ = "user_kanji"
    id : Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id : Mapped[int] = mapped_column(Integer, ForeignKey("user_profiles.id"))
    kanji_id : Mapped[int] = mapped_column(ForeignKey("kanji.id"))
    status : Mapped[str] = mapped_column(String, nullable=False)
    repetitions : Mapped[int] = mapped_column(Integer, default = 0)
    interval_days : Mapped[float] = mapped_column(Float, default = 1.0) #how many days until next review is due
    times_reviewed : Mapped[int] = mapped_column(Integer, default = 0)
    times_correct : Mapped[int] = mapped_column(Integer, default=0)
    last_reviewed_at : Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable= True)
    next_review_at : Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable = True) #when the kanji is first loaded, they will not have studied so it can not be up for review
    ease_factor : Mapped[Optional[float]] = mapped_column(Float, nullable = True, default=2.5, server_default="2.5")
    created_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)
    
    user = relationship("User", lazy="selectin")
    kanji = relationship("Kanji", lazy="selectin")
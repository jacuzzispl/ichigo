from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, SmallInteger, func
from sqlalchemy.orm import Mapped, mapped_column

from .Base import Base


class Review(Base):
    __tablename__ = "review_log"
    __table_args__ = (Index("ix_review_log_user_kanji", "user_id", "kanji_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user_profiles.id"), nullable=False)
    kanji_id: Mapped[int] = mapped_column(ForeignKey("kanji.id"), nullable=False)
    reviewed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    quality: Mapped[int] = mapped_column(SmallInteger, nullable=False)  # SM-2 grade, 0-5
    meaning_incorrect: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    reading_incorrect: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    response_ms: Mapped[int] = mapped_column(Integer, nullable=False)  # median across answers

    ease_factor_before: Mapped[float] = mapped_column(Float, nullable=False)
    ease_factor_after: Mapped[float] = mapped_column(Float, nullable=False)
    interval_before: Mapped[float] = mapped_column(Float, nullable=False)  # days
    interval_after: Mapped[float] = mapped_column(Float, nullable=False)  # days
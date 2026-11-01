from sqlalchemy import String, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from .Base import Base

def get_username(context):
    email = context.get_current_parameters()["email"]
    return email.split('@')[0]

class User(Base):
    __tablename__ = "user_profiles"
    id : Mapped[int] = mapped_column(primary_key=True, autoincrement=True, nullable=False)
    email : Mapped[str] = mapped_column(String(256), unique=True, index=True, nullable=False)
    password_hash : Mapped[str] = mapped_column(String(255), nullable=False)
    username : Mapped[str | None] = mapped_column(String(50), default=get_username)
    created_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    rank : Mapped[int | None] = mapped_column(Integer, nullable=True)

    reviews = relationship("Review", lazy="selectin")
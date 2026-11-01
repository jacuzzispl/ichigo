from .Users import User
from .Kanji import Kanji
from .UserKanji import UserKanjiEntry
from .ReviewLog import Review

from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass
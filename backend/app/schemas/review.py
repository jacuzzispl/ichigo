from app.schemas.kanji import KanjiCard
from pydantic import BaseModel

class KanjiDue(BaseModel):
    due: list[KanjiCard]
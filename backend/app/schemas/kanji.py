from pydantic import BaseModel

class KanjiCard(BaseModel):
    id: int
    character: str
    meaning: str
    jlpt_level: int | None
    curriculumn_order: int | None
    onyomi: str | None
    kunyomi: str | None
    radical: str
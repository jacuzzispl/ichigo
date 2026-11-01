from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class QuestionType(str, Enum):
    meaning = "meaning"   # match these values to your frontend's QuestionType
    reading = "reading"
    stroke_draw = "stroke_draw"
    kanji_to_romaji_english = "kanji_to_romaji_english"
    english_to_hiragana = "english_to_hiragana"
    sentence_translation = "sentence_translation"




class AnswerIn(BaseModel):
    question_type: QuestionType
    correct: bool
    response_ms: int = Field(ge=0, le=600_000)


class KanjiResultIn(BaseModel):
    kanji_id: int
    meaning_incorrect: int
    reading_incorrect: int
    answers: list[AnswerIn]
    # meaning_incorrect / reading_incorrect from the client are ignored (Pydantic drops


class LessonCompletePayload(BaseModel):
    results: list[KanjiResultIn] = Field(min_length=1)


class KanjiResultOut(BaseModel):
    kanji_id: int
    quality: int
    interval_days: int
    next_review_at: datetime


class LessonCompleteResponse(BaseModel):
    results: list[KanjiResultOut]
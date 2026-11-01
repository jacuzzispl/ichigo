from pydantic import BaseModel, Field

class Vocab(BaseModel):
    word: str             # exactly as written in the sentence, e.g. 飲みます
    dictionary_form: str  # e.g. 飲む
    meaning: str          # short English gloss

class StorySentence(BaseModel):
    japanese: str
    english: str
    vocab: list[Vocab]    # content words only: nouns, verbs, adjectives

class StoryText(BaseModel):
    title: str
    title_english: str
    sentences: list[StorySentence]

class StoryRequest(BaseModel):
    num_sentences: int
    kanji: list[str]
    level: str
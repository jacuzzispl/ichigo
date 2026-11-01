from google import genai
from dotenv import load_dotenv
from fastapi import APIRouter
import os

from app.schemas.story import Vocab, StorySentence, StoryText, StoryRequest

router = APIRouter()

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=GEMINI_API_KEY)


import re
import pykakasi

kks = pykakasi.kakasi()
KANJI = r"[\u4e00-\u9fff々]"

def to_hira(s: str) -> str:
    return "".join(
        chr(ord(c) - 0x60) if "\u30a1" <= c <= "\u30f6" else c for c in s
    )

def split_token(orig: str, hira: str) -> list[dict]:
    if not re.search(KANJI, orig):
        return [{"text": orig}]

    # "振り返る" -> ["振", "り", "返", "る"]
    parts = re.findall(f"{KANJI}+|[^\u4e00-\u9fff々]+", orig)
    pattern = "".join(
        "(.+?)" if re.match(KANJI, p) else re.escape(to_hira(p))
        for p in parts
    )
    m = re.fullmatch(pattern, hira)
    if not m:  # fallback: reading over the whole token
        return [{"text": orig, "reading": hira}]

    readings = iter(m.groups())
    return [
        {"text": p, "reading": next(readings)} if re.match(KANJI, p)
        else {"text": p}
        for p in parts
    ]

def add_furigana(text: str) -> list[dict]:
    segments = []
    for item in kks.convert(text):
        segments.extend(split_token(item["orig"], item["hira"]))
    return segments

def generate_story(num_sentences: int, level: str, kanji: list[str]):
    prompt = f"""Write a short story in Japanese for a {level} learner.

    Requirements:
    - Use each of these kanji at least once: {', '.join(kanji)}
    - Write exactly {num_sentences} sentences, using only {level}-appropriate vocabulary and grammar.
    - `japanese`: plain Japanese only. No furigana, romaji, parentheses or English.
    Use standard kanji forms where they exist. Avoid names and ambiguous readings (今日, 大人, 上手, 一人).
    - `english`: a natural, faithful English translation of that sentence.
    - `vocab`: every noun, verb and adjective in the sentence (skip particles and
    punctuation). `word` must match the sentence text exactly, `dictionary_form`
    is the base form, and `meaning` is a short English gloss.
    - Give `title` in Japanese and `title_english` in English.
    """
    print("1")
    resp = client.models.generate_content(
        model="gemini-3.8-flash",  # check docs for the current model name
        contents=prompt,
        config={"response_mime_type": "application/json", "response_schema": StoryText},
    )
    return resp.parsed


@router.post("/generate-story")
def build_story(req: StoryRequest):
    story = generate_story(req.num_sentences, req.level, req.kanji)
    return {
        "title": story.title,
        "title_english": story.title_english,
        "sentences": [
            {
                "segments": add_furigana(s.japanese),
                "english": s.english,
                "vocab": [v.model_dump() for v in s.vocab],
            }
            for s in story.sentences
        ],
    }


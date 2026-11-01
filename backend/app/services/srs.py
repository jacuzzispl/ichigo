from dataclasses import dataclass
from statistics import median

FAST_MS = 4000  # tune this


@dataclass
class SrsState:
    repetitions: int
    ease_factor: float
    interval_days: int


def quality_from_answers(answers) -> tuple[int, int, int, int]:
    """Returns (quality, meaning_incorrect, reading_incorrect, median_response_ms)."""
    meaning_wrong = sum(1 for a in answers if a.question_type == "meaning" and not a.correct)
    reading_wrong = sum(1 for a in answers if a.question_type == "reading" and not a.correct)
    mistakes = meaning_wrong + reading_wrong
    med_ms = int(median(a.response_ms for a in answers))

    if mistakes == 0:
        q = 5 if med_ms < FAST_MS else 4
    elif mistakes == 1:
        q = 3
    elif mistakes == 2:
        q = 2
    else:
        q = 1
    return q, meaning_wrong, reading_wrong, med_ms


def sm2(q: int, state: SrsState) -> SrsState:
    if q < 3:
        return SrsState(repetitions=0, ease_factor=state.ease_factor, interval_days=1)

    reps = state.repetitions + 1
    if reps == 1:
        interval = 1
    elif reps == 2:
        interval = 6
    else:
        interval = round(state.interval_days * state.ease_factor)

    ef = state.ease_factor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
    return SrsState(repetitions=reps, ease_factor=max(1.3, ef), interval_days=interval)
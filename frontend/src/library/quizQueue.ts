import { LessonKanji, QuestionType, QuizQuestion, DrawingStage } from '../types';
import { getSentenceQuestion } from '../data/sentenceData';

/**
 * Shuffles an array immutably using Fisher-Yates.
 */
export function shuffleArray<T>(array: readonly T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Creates a Question 1: Kanji -> Romaji & English question.
 */
export function createKanjiToRomajiEnglishQuestion(kanji: LessonKanji): QuizQuestion {
  return {
    id: `${kanji.id}-kanji_to_romaji_english`,
    kanji,
    type: 'kanji_to_romaji_english',
    prompt: `Translate the kanji 「${kanji.character}」 into Romaji reading and English meaning`,
  };
}

/**
 * Creates a Question 2: English -> Live Hiragana IME question.
 */
export function createEnglishToHiraganaQuestion(kanji: LessonKanji): QuizQuestion {
  return {
    id: `${kanji.id}-english_to_hiragana`,
    kanji,
    type: 'english_to_hiragana',
    prompt: `Type the Japanese reading in Romaji (converts to Hiragana live)`,
  };
}

/**
 * Creates a Question 3: Simple sentence translation question.
 */
export function createSentenceQuestion(kanji: LessonKanji): QuizQuestion {
  const sentenceData = getSentenceQuestion(kanji.character, kanji.meanings);
  return {
    id: `${kanji.id}-sentence_translation`,
    kanji,
    type: 'sentence_translation',
    prompt: `Choose the correct English translation of the sentence`,
    sentenceData,
    options: sentenceData.options,
    correctAnswer: sentenceData.correctAnswer,
  };
}

/**
 * Creates a Question 4: Stroke order drawing practice question.
 */
export function createStrokeQuestion(
  kanji: LessonKanji,
  stage: DrawingStage = 'guided'
): QuizQuestion {
  const stageTitles: Record<DrawingStage, string> = {
    guided: 'Stroke order practice (with guide dots)',
    outline: 'Stroke order outline practice (no dots)',
    blank: 'Draw kanji from memory (blank canvas)',
  };

  return {
    id: `${kanji.id}-stroke_${stage}`,
    kanji,
    type: 'stroke_draw',
    drawingStage: stage,
    prompt: stageTitles[stage],
  };
}

/**
 * Builds the complete queue containing all 4 question types across the batch.
 * Guarantees proper stroke stage progression (guided -> outline -> blank)
 * and interleaves kanji so adjacent questions are never for the same kanji.
 */
export function buildQuizQueue(batch: LessonKanji[]): QuizQuestion[] {
  if (!batch || batch.length === 0) return [];

  // Round 1: Guided stroke drawing for each kanji (introduction to stroke order)
  const round1: QuizQuestion[] = batch.map((k) => createStrokeQuestion(k, 'guided'));

  // Round 2: Kanji to Romaji & English dual translation
  const round2: QuizQuestion[] = batch.map((k) => createKanjiToRomajiEnglishQuestion(k));

  // Round 3: English to Live Hiragana IME typing
  const round3: QuizQuestion[] = batch.map((k) => createEnglishToHiraganaQuestion(k));

  // Round 4: Contextual sentence translation
  const round4: QuizQuestion[] = batch.map((k) => createSentenceQuestion(k));

  // Round 5: Outline stroke drawing (no dots)
  const round5: QuizQuestion[] = batch.map((k) => createStrokeQuestion(k, 'outline'));

  // Round 6: Final blank canvas mastery drawing (no outline)
  const round6: QuizQuestion[] = batch.map((k) => createStrokeQuestion(k, 'blank'));

  // Interleave and shuffle ensuring no adjacent same-kanji
  const orderedRounds = [
    shuffleQueueNoAdjacentSameKanji(round1),
    shuffleQueueNoAdjacentSameKanji(round2),
    shuffleQueueNoAdjacentSameKanji(round3),
    shuffleQueueNoAdjacentSameKanji(round4),
    shuffleQueueNoAdjacentSameKanji(round5),
    shuffleQueueNoAdjacentSameKanji(round6),
  ];

  const fullQueue: QuizQuestion[] = [];
  for (const round of orderedRounds) {
    fullQueue.push(...round);
  }

  // Smooth out any boundary conflicts between rounds
  return preventAdjacentDuplicates(fullQueue);
}

/**
 * Shuffles a queue of questions ensuring no two adjacent questions share the same kanji.
 */
export function shuffleQueueNoAdjacentSameKanji(
  questions: readonly QuizQuestion[]
): QuizQuestion[] {
  if (questions.length <= 1) return [...questions];

  const groups: Record<number, QuizQuestion[]> = {};
  for (const q of questions) {
    if (!groups[q.kanji.id]) {
      groups[q.kanji.id] = [];
    }
    groups[q.kanji.id].push(q);
  }

  for (const id in groups) {
    groups[id] = shuffleArray(groups[id]);
  }

  const result: QuizQuestion[] = [];
  let prevKanjiId: number | null = null;
  const total = questions.length;

  for (let step = 0; step < total; step++) {
    const availableIds = Object.keys(groups)
      .map(Number)
      .filter((id) => groups[id].length > 0);

    const candidates = availableIds.filter((id) => id !== prevKanjiId);
    const pool = candidates.length > 0 ? candidates : availableIds;

    pool.sort((a, b) => {
      const diff = groups[b].length - groups[a].length;
      if (diff !== 0) return diff;
      return Math.random() - 0.5;
    });

    const chosenId = pool[0];
    const question = groups[chosenId].pop()!;
    result.push(question);
    prevKanjiId = question.kanji.id;
  }

  return preventAdjacentDuplicates(result);
}

/**
 * Fixes any adjacent duplicates through local lookahead swap.
 */
function preventAdjacentDuplicates(questions: QuizQuestion[]): QuizQuestion[] {
  const result = [...questions];
  for (let i = 0; i < result.length - 1; i++) {
    if (result[i].kanji.id === result[i + 1].kanji.id) {
      for (let j = i + 2; j < result.length; j++) {
        if (
          result[j].kanji.id !== result[i].kanji.id &&
          (j === result.length - 1 || result[i + 1].kanji.id !== result[j + 1].kanji.id)
        ) {
          const temp = result[i + 1];
          result[i + 1] = result[j];
          result[j] = temp;
          break;
        }
      }
    }
  }
  return result;
}

/**
 * Re-inserts a wrongly answered question about 3 positions ahead of the front,
 * clamped to the end of the queue.
 */
export function requeueQuestion(
  remainingQueue: readonly QuizQuestion[],
  failedQuestion: QuizQuestion,
  offset = 3
): QuizQuestion[] {
  const copy = [...remainingQueue];
  const insertIndex = Math.min(offset, copy.length);
  copy.splice(insertIndex, 0, failedQuestion);
  return copy;
}

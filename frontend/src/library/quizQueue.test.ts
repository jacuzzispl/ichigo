import { describe, it, expect } from 'vitest';
import {
  buildQuizQueue,
  requeueQuestion,
  createKanjiToRomajiEnglishQuestion,
  createEnglishToHiraganaQuestion,
  createSentenceQuestion,
  createStrokeQuestion,
} from './quizQueue';
import { MOCK_KANJI_POOL } from '../api/lessons';

describe('quizQueue pure functions', () => {
  const batch = MOCK_KANJI_POOL.slice(0, 5);

  it('builds a queue covering all 4 question types across the batch', () => {
    const queue = buildQuizQueue(batch);
    expect(queue.length).toBeGreaterThan(0);

    const strokeQuestions = queue.filter((q) => q.type === 'stroke_draw');
    const romajiEnglishQuestions = queue.filter(
      (q) => q.type === 'kanji_to_romaji_english'
    );
    const hiraganaQuestions = queue.filter(
      (q) => q.type === 'english_to_hiragana'
    );
    const sentenceQuestions = queue.filter(
      (q) => q.type === 'sentence_translation'
    );

    expect(strokeQuestions.length).toBeGreaterThanOrEqual(batch.length);
    expect(romajiEnglishQuestions.length).toBe(batch.length);
    expect(hiraganaQuestions.length).toBe(batch.length);
    expect(sentenceQuestions.length).toBe(batch.length);
  });

  it('guarantees no adjacent questions have the same kanji', () => {
    for (let run = 0; run < 10; run++) {
      const queue = buildQuizQueue(batch);
      for (let i = 0; i < queue.length - 1; i++) {
        expect(queue[i].kanji.id).not.toBe(queue[i + 1].kanji.id);
      }
    }
  });

  it('correctly creates individual question types', () => {
    const k = batch[0];
    const q1 = createKanjiToRomajiEnglishQuestion(k);
    expect(q1.type).toBe('kanji_to_romaji_english');

    const q2 = createEnglishToHiraganaQuestion(k);
    expect(q2.type).toBe('english_to_hiragana');

    const q3 = createSentenceQuestion(k);
    expect(q3.type).toBe('sentence_translation');
    expect(q3.sentenceData).toBeDefined();

    const q4 = createStrokeQuestion(k, 'guided');
    expect(q4.type).toBe('stroke_draw');
    expect(q4.drawingStage).toBe('guided');
  });

  it('correctly clamps requeued question to the end when queue has fewer items than offset', () => {
    const queue = buildQuizQueue(batch);
    const testQuestion = queue[0];
    const shortQueue = queue.slice(1, 2); // length 1

    const requeued = requeueQuestion(shortQueue, testQuestion, 3);
    expect(requeued.length).toBe(2);
    expect(requeued[1].id).toBe(testQuestion.id);
  });
});

import React from 'react';
import { QuizQuestion } from '../../types';
import { KanjiToRomajiEnglishCard } from './questions/KanjiToRomajiEnglishCard';
import { EnglishToHiraganaCard } from './questions/EnglishToHiraganaCard';
import { SentenceTranslationCard } from './questions/SentenceTranslationCard';
import { StrokeDrawingCard } from './questions/StrokeDrawingCard';

interface QuestionCardProps {
  question: QuizQuestion;
  selectedAnswer: string | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  onSelectOption: (option: string) => void;
  onSubmitAnswer: (correct: boolean, inputSummary: string) => void;
  onContinue: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedAnswer,
  isAnswered,
  isCorrect,
  onSelectOption,
  onSubmitAnswer,
  onContinue,
}) => {
  switch (question.type) {
    case 'kanji_to_romaji_english':
      return (
        <KanjiToRomajiEnglishCard
          question={question}
          isAnswered={isAnswered}
          isCorrect={isCorrect}
          onSubmitAnswer={onSubmitAnswer}
          onContinue={onContinue}
        />
      );

    case 'english_to_hiragana':
      return (
        <EnglishToHiraganaCard
          question={question}
          isAnswered={isAnswered}
          isCorrect={isCorrect}
          onSubmitAnswer={onSubmitAnswer}
          onContinue={onContinue}
        />
      );

    case 'sentence_translation':
      return (
        <SentenceTranslationCard
          question={question}
          selectedAnswer={selectedAnswer}
          isAnswered={isAnswered}
          isCorrect={isCorrect}
          onSelectOption={onSelectOption}
          onContinue={onContinue}
        />
      );

    case 'stroke_draw':
      return (
        <StrokeDrawingCard
          question={question}
          isAnswered={isAnswered}
          onSubmitAnswer={onSubmitAnswer}
          onContinue={onContinue}
        />
      );

    // Legacy fallback for meaning / reading
    default:
      return (
        <SentenceTranslationCard
          question={question}
          selectedAnswer={selectedAnswer}
          isAnswered={isAnswered}
          isCorrect={isCorrect}
          onSelectOption={onSelectOption}
          onContinue={onContinue}
        />
      );
  }
};

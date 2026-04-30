// src/components/PreTestQuestionCard.tsx
import React, { useMemo } from "react";
import type { PreAssessmentQuestion } from "../../../types/adaptive";

function shuffled<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type PreTestQuestionCardProps = {
  question: PreAssessmentQuestion;
  selectedAnswer?: string;
  onAnswerChange: (questionId: number, answer: string) => void;
};

const PreTestQuestionCard: React.FC<PreTestQuestionCardProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
}) => {
  // Shuffle once per question mount so options appear in a random order
  const shuffledOptions = useMemo(() => shuffled(question.answer_options), [question.id]);

  return (
    <div className="mb-2 p-4">
      {/* Question header */}
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-[#704EE7]/10 text-[#704EE7] text-sm font-semibold mr-3">
          {question.order}
        </div>
        <p className="text-lg font-semibold">
          {question.question_text}
        </p>
      </div>

      {/* (Optional) Code snippet block, if you have one on your question object */}
      {/*
      {question.codeSnippet && (
        <pre className="bg-gray-900 text-gray-100 font-mono p-4 rounded mb-4 overflow-auto">
          {question.codeSnippet}
        </pre>
      )}
      */}

      {/* Answer options */}
      <div className="grid grid-cols-2 gap-4">
        {shuffledOptions.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx).toLowerCase();; // A, B, C, D…
          const isSelected = selectedAnswer === option;
          return (
            <label
              key={option}
              className={`flex items-center border border-[#95B7D2] rounded-lg p-3 cursor-pointer transition 
                ${isSelected ? "border-[#704EE7] bg-[#704EE7]/10" : "border-gray-300 hover:border-blue-300"}`}
            >
              <input
                type="radio"
                name={`q-${question.id}`}
                value={option}
                checked={isSelected}
                onChange={() => onAnswerChange(question.id, option)}
                className="sr-only peer"
              />
              <div className="ml-3 flex items-center gap-2">
                <span className="flex-shrink-0 flex items-center justify-center w-6.5 h-6.5 rounded-full border border-[#95B7D2] text-sm font-medium">
                  {letter}
                </span>
                <span>{option}</span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default PreTestQuestionCard;

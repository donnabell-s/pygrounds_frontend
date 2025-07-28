// src/components/PreTestQuestionCard.tsx
import React from "react";
import type { PreAssessmentQuestion } from "../../../types/adaptive";

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
  return (
    <div className="mb-2 p-4">
      {/* Question header */}
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-[#D7E4EE] text-[#3776AB] text-sm font-semibold mr-3">
          {question.order+1}
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
        {question.answer_options.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx).toLowerCase();; // A, B, C, D…
          const isSelected = selectedAnswer === option;
          return (
            <label
              key={option}
              className={`flex items-center border border-[#95B7D2] bg-[#F5F8FB] rounded-lg p-3 cursor-pointer transition 
                ${isSelected ? "border-[#3776AB] bg-blue-50" : "border-gray-300 hover:border-blue-300"}`}
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

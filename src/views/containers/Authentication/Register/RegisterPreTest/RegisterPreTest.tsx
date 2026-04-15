// src/pages/register/RegisterPreTest.tsx
import React, { useEffect, useRef, useState } from "react";
import * as Component from "../../../../components";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAdaptive } from "../../../../../context/AdaptiveContext";
import type { RegistrationContextType } from "../RegisterMain/RegisterMain";

const RegisterPreTest: React.FC = () => {
  const navigate = useNavigate();
  const { preTestAnswers, setPreTestAnswers } =
    useOutletContext<RegistrationContextType>();
  const { preAssessmentQuestions, isLoading, error, refresh } = useAdaptive();

  const [currentIndex, setCurrentIndex] = useState(0);
  const questionStartTime = useRef<number>(Date.now());

  // Reset the start timer whenever the displayed question changes
  useEffect(() => {
    questionStartTime.current = Date.now();
  }, [currentIndex]);

  const questions = preAssessmentQuestions ?? [];
  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const currentAnswer = currentQuestion ? preTestAnswers[currentQuestion.id] : undefined;
  const canAdvance = !!currentAnswer;

  const handleBack = () => {
    if (currentIndex === 0) {
      navigate(-1);
    } else {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleNext = () => {
    if (!canAdvance) return;
    if (isLast) {
      navigate("/register/terms-and-conditions");
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    const time_taken = Math.floor((Date.now() - questionStartTime.current) / 1000);
    setPreTestAnswers((prev) => ({
      ...prev,
      [questionId]: { user_answer: answer, time_taken },
    }));
  };

  if (isLoading) return <p>Loading questions…</p>;
  if (error)
    return (
      <div className="text-red-600">
        <p>Error loading questions: {error.message}</p>
        <button onClick={refresh} className="underline">
          Try again
        </button>
      </div>
    );

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1.5">
        Let's See What You Already Know!
      </h1>
      <span className="mb-5 block">
        This quick test helps us match you with the right challenges based on
        your current Python skills.
      </span>

      <p className="text-sm text-gray-500 mb-4">
        Question {currentIndex + 1} of {questions.length}
      </p>

      {currentQuestion && (
        <Component.PreTestQuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          selectedAnswer={currentAnswer?.user_answer}
          onAnswerChange={handleAnswerChange}
        />
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={handleBack}
          className="border border-[#D1D5DB] px-4 py-2 rounded-md flex items-center gap-2 text-sm cursor-pointer"
        >
          <FaArrowLeft size={11} />
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canAdvance}
          className={`
            px-4 py-2 rounded-md flex items-center gap-2 text-sm transition cursor-pointer
            ${canAdvance
              ? "bg-[#704EE7] text-white hover:brightness-110"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }
          `}
        >
          {isLast ? "Finish" : "Next"}
          <FaArrowRight size={11} />
        </button>
      </div>
    </div>
  );
};

export default RegisterPreTest;

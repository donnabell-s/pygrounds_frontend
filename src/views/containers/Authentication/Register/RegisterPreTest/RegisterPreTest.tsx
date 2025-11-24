// src/pages/register/RegisterPreTest.tsx
import React, { useMemo, useState } from "react";
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

  // Local state to show warning if they click Next too early
  const [showWarning, setShowWarning] = useState(false);

  // Mark all answered if every question id maps to a non-empty string
  const allAnswered: boolean = useMemo(() => {
    if (!preAssessmentQuestions) return false;
    return preAssessmentQuestions.every(
      (q) => typeof preTestAnswers[q.id] === "string" && preTestAnswers[q.id].trim() !== ""
    );
  }, [preAssessmentQuestions, preTestAnswers]);

  const handleBack = () => navigate(-1);

  const handleNext = () => {
    if (!allAnswered) {
      setShowWarning(true);
      return;
    }
    navigate("/register/terms-and-conditions");
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setShowWarning(false);
    setPreTestAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
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
        Let’s See What You Already Know!
      </h1>
      <span className="mb-5 block">
        This quick test helps us match you with the right challenges based on
        your current Python skills.
      </span>

      <div>
        { (preAssessmentQuestions ?? []).map((q) => (
          <Component.PreTestQuestionCard
            key={q.id}
            question={q}
            selectedAnswer={preTestAnswers[q.id]}
            onAnswerChange={handleAnswerChange}
          />
        ))}
      </div>

      {showWarning && (
        <p className="text-sm text-red-600 mb-4">
          Please answer all questions before continuing.
        </p>
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
          disabled={!allAnswered}
          className={`
            px-4 py-2 rounded-md flex items-center gap-2 text-sm transition cursor-pointer
            ${allAnswered
              ? "bg-[#704EE7] text-white hover:brightness-110"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }
          `}
        >
          Next
          <FaArrowRight size={11} />
        </button>
      </div>
    </div>
  );
};

export default RegisterPreTest;

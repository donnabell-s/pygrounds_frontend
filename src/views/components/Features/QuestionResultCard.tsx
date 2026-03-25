import React, { useState } from "react";
import { FaFlag } from "react-icons/fa6";
import FlagModal from "../UI/FlagModal";
import gameApi from "../../../api/gameApi";

interface QuestionResultCardProps {
  questionNumber: number;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  isCorrect: boolean;
  isCoding: boolean;
  questionId?: number;
}

const QuestionResultCard: React.FC<QuestionResultCardProps> = ({
  questionNumber,
  questionText,
  userAnswer,
  correctAnswer,
  explanation,
  isCorrect,
  isCoding,
  questionId,
}) => {
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFlagged, setIsFlagged] = useState(false);

  const handleFlagClick = async () => {
    if (!questionId) {
      console.error("Unable to flag this question. Question ID not found.");
      alert("Unable to flag this question. Question ID not found.");
      return;
    }
    
    // If already flagged, unflag directly without showing modal
    if (isFlagged) {
      setIsSubmitting(true);
      try {
        const result = await gameApi.toggleQuestionFlag(questionId);
        if (result) {
          if (result.is_flagged !== undefined) {
            setIsFlagged(result.is_flagged);
          } else {
            setIsFlagged(false);
          }
        } else {
          console.error("Failed to unflag question");
          alert("Failed to unflag question. Please try again.");
        }
      } catch (error) {
        console.error("Error unflagging question:", error);
        alert("An error occurred while unflagging the question.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Show modal for flagging
      setShowFlagModal(true);
    }
  };

  const handleFlagSubmit = async (_comment: string) => {
    if (!questionId) return;
    
    setIsSubmitting(true);
    try {
      const result = await gameApi.toggleQuestionFlag(questionId);
      if (result) {
        // Successfully flagged - backend returned 200
        // Update local state based on backend response
        if (result.is_flagged !== undefined) {
          setIsFlagged(result.is_flagged);
        } else {
          // If backend doesn't return flag status, toggle local state
          setIsFlagged(!isFlagged);
        }
        setShowFlagModal(false);
      } else {
        console.error("Failed to flag question");
        alert("Failed to flag question. Please try again.");
      }
    } catch (error) {
      console.error("Error flagging question:", error);
      alert("An error occurred while flagging the question.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFlagCancel = () => {
    setShowFlagModal(false);
  };
  return (
    <div
      className={`relative rounded-lg border p-3 shadow-sm ${
        isCorrect ? "border-[#42BFAC]/80 bg-[#42BFAC]/10" : "border-[#FD4E66]/80 bg-[#FD4E66]/10"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm">
          <div className="font-semibold">
            {questionNumber}. {questionText}
          </div>
          <div className="mt-1 space-y-0.5">
            <div className="text-[13px]">
              <span className="font-medium text-gray-700">Your answer:</span>{" "}
              <span className="font-mono break-words">{userAnswer}</span>
            </div>
            {!isCoding && (
              <div className="text-[13px]">
                <span className="font-medium text-gray-700">Correct answer:</span>{" "}
                <span className="font-mono break-words">{correctAnswer || "—"}</span>
              </div>
            )}
            {isCoding && (
              <div className="text-[13px]">
                <span className="font-medium text-gray-700">Explanation:</span>{" "}
                <span className="break-words">
                  {explanation?.trim() ? explanation : "No explanation yet."}
                </span>
              </div>
            )}
          </div>
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
            isCorrect ? "bg-[#42BFAC] text-white" : "bg-[#FD4E66] text-white"
          }`}
        >
          {isCorrect ? "Correct" : "Wrong"}
        </span>
      </div>
      <button 
        onClick={handleFlagClick}
        disabled={!questionId || isSubmitting}
        className={`absolute bottom-2.5 right-2.5 flex items-center justify-center w-6 h-6 rounded-full border transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
          isFlagged 
            ? "border-[#704EE7] bg-[#704EE7] text-white hover:bg-[#5c3ec2] hover:border-[#5c3ec2] cursor-pointer" 
            : "border-gray-300 bg-gray-100 text-gray-400 hover:bg-gray-200 hover:border-gray-400 hover:text-gray-500 cursor-pointer"
        }`}
        title={isFlagged ? "Click to unflag this question" : "Flag this question for review"}
      >
        <FaFlag className="w-3 h-3" />
      </button>
      {showFlagModal && (
        <FlagModal
          questionNumber={questionNumber}
          onSubmit={handleFlagSubmit}
          onCancel={handleFlagCancel}
        />
      )}
    </div>
  );
};

export default QuestionResultCard;
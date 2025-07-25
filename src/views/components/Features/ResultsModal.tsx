import React from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../../../context/GameContext";

interface ResultsModalProps {
  onClose: () => void;
}

const ResultsModal: React.FC<ResultsModalProps> = ({ onClose }) => {
  const { activeSession } = useGame();
  const navigate = useNavigate();

  const score = activeSession?.total_score ?? 0;
  const total = activeSession?.session_questions?.length ?? 0;
  
  const handleClose = () => {
    onClose();
    const storedUser = localStorage.getItem("user");
    const userId = storedUser ? JSON.parse(storedUser).id : "";
    navigate(`/${userId}/home`);
  };

  return (
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-[#0077B6]">Game Result</h2>

        <div className="space-y-2 text-sm">
          <p>
            <span className="inline-flex items-center gap-1">
              ✅ <strong>Correct Answers:</strong>
            </span>{" "}
            {score}
          </p>

          <p>
            <span className="inline-flex items-center gap-1 text-red-600 font-bold">
              ❌ Missed:
            </span>{" "}
            {total - score}
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={handleClose}
            className="px-5 py-2 bg-[#0077B6] text-white rounded-md hover:brightness-110 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
  );
};

export default ResultsModal;

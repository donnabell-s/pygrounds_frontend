// src/components/GameHeader.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaRegClock } from "react-icons/fa";
import ConfirmExit from "./ConfirmExit";
import { useAuth } from "../../../context/AuthContext";
import { useGame } from "../../../context/GameContext";

const GameHeader = () => {
  const { user } = useAuth();
  const { activeSession, submitCrosswordResult, clearActiveSession } = useGame();
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!activeSession) return;

    const startTime = new Date(activeSession.started_at).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    const remaining = activeSession.timer_seconds - elapsed;

    setTimeLeft(remaining > 0 ? remaining : 0);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession]);

  const handleTimeout = async () => {
    if (!activeSession) return;

    await submitCrosswordResult(activeSession.session_id, {
      answered: [],
      time_taken: activeSession.timer_seconds,
    });
    clearActiveSession();
    navigate(`/${user?.id}/home`);
  };

  const handleExitGame = () => {
    clearActiveSession(); // No submission on manual exit
    navigate(`/${user?.id}/home`);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  if (!activeSession) return null;

  return (
    <>
      <div className="sticky top-0 bg-white h-16 flex items-center justify-between px-6 shadow-sm z-50">
        <div className="flex items-center gap-5">
          <button
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
            onClick={() => setShowExitConfirm(true)}
          >
            <FaArrowLeft size={12} /> Exit Game
          </button>
          <div className="flex gap-3 text-sm font-medium">
            <span className="px-3 py-1 rounded-full border">Question ?</span>
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600">Score: ?</span>
          </div>
        </div>
        <div className="flex gap-3 items-center text-sm">
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-600 flex items-center gap-1.5">
            <FaRegClock size={12} /> {formatTime(timeLeft)}
          </span>
          <span className="font-medium">Lives: 3</span>
        </div>
      </div>

      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(45, 45, 45, 0.4)" }}>
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-md p-6 relative">
            <ConfirmExit
              onConfirm={handleExitGame}
              onCancel={() => setShowExitConfirm(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default GameHeader;

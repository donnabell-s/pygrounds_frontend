import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../../../context/GameContext";

const GameHeader = () => {
  const { activeSession, clearActiveSession, gameEnded } = useGame();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!activeSession) return;

    const start = new Date(activeSession.start_time).getTime();
    const limit = activeSession.time_limit * 1000;
    const end = start + limit;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const remaining = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(remaining);

      // ❌ Do NOT submit here
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const handleExit = () => {
    clearActiveSession();
    const storedUser = localStorage.getItem("user");
    const userId = storedUser ? JSON.parse(storedUser)?.id : "";
    navigate(`/${userId}/home`);
  };

  if (!activeSession) return null;

  return (
    <div className="w-full px-4 py-3 flex justify-between items-center border-b border-gray-200 bg-white">
      <div className="text-lg font-semibold capitalize">
        {activeSession.game_type} Game
      </div>
      {!gameEnded && (
        <div className="flex items-center gap-6">
          <span className="text-sm text-gray-600">⏱ {timeLeft}s</span>
          <button
            onClick={handleExit}
            className="text-red-500 text-sm hover:underline"
          >
            Exit Game
          </button>
        </div>
      )}
    </div>
  );
};

export default GameHeader;

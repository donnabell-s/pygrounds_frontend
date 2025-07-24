import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../../../context/GameContext";
import { FaRegClock, FaArrowLeft } from "react-icons/fa";
import * as Component from "../../components";

const GameHeader = () => {
  const { activeSession, exitSession, gameEnded } = useGame(); // ✅ use exitSession instead of clearActiveSession
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    if (!activeSession) return;

    const start = new Date(activeSession.start_time).getTime();
    const limit = activeSession.time_limit * 1000;
    const end = start + limit;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const remaining = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const confirmExit = async () => {
    if (!activeSession) return;

    await exitSession(activeSession.session_id); // ✅ mark session as expired in backend
    const storedUser = localStorage.getItem("user");
    const userId = storedUser ? JSON.parse(storedUser)?.id : "";
    navigate(`/${userId}/home`);
  };

  if (!activeSession) return null;

  return (
    <>
      <div className="sticky top-0 bg-[#FFFFFF] h-16 flex items-center shadow-sm px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 z-50">
        {!gameEnded && (
          <div className="flex flex-row items-center gap-6">
            <button
              onClick={() => setShowExitModal(true)}
              className="rounded-md border border-[#D1D5DB] px-3.5 py-1.5 cursor-pointer flex flex-row items-center gap-2 hover:bg-gray-100 transition-colors"
            >
              <FaArrowLeft size={11} />
              Exit Game
            </button>
            <span className="bg-[#E9FAF1] rounded-full text-sm text-[#23CC71] py-0.5 px-2 flex items-center justify-center gap-1">
              <FaRegClock />
              <span className="inline-block w-[35px] text-center">
                {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
                {String(timeLeft % 60).padStart(2, "0")}
              </span>
            </span>
          </div>
        )}
      </div>

      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(45, 45, 45, 0.4)" }}>
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-md p-6 relative">
            <Component.ConfirmExit
              onConfirm={confirmExit}
              onCancel={() => setShowExitModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default GameHeader;

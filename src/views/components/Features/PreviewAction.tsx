import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import * as Interfaces from "../../../interfaces";
import * as Components from "../../components";
import { useAuth } from "../../../context/AuthContext";
import { useGame } from "../../../context/GameContext"; 

type PreviewActionProps = {
  selectedGame: Interfaces.Minigame;
};

const PreviewAction = ({ selectedGame }: PreviewActionProps) => {
  const { user } = useAuth();
  const { startCrosswordGame } = useGame(); // ✅ Grab this from context
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const slugifyTitle = (title: string) =>
    title.toLowerCase().replace(/\s+/g, "-");

  return (
    <>
      <div className="flex flex-col md:flex-row gap-11">
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center text-sm text-[#9CA3AF]">
            <span
              className="hover:text-[#0077B6] cursor-pointer"
              onClick={() => navigate(`/${user?.id}/home`)}
            >
              Home
            </span>
            <span className="mx-2">/</span>
            <span className="text-[#0077B6] font-medium">
              {selectedGame.title}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-bold">{selectedGame.title}</h1>
            <p className="text-xs font-semibold py-1 px-3 rounded-full border border-[#D1D5DB] max-w-max">
              {selectedGame.category}
            </p>
            <p>{selectedGame.description}</p>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              className="px-6 py-2 bg-[#0077B6] text-white font-semibold rounded-md hover:brightness-110 transition-colors cursor-pointer"
              onClick={() => setShowConfirm(true)}
            >
              Start Game
            </button>

            <button
              className="px-6 py-2 bg-[#FFFFFF] border border-[#D1D5DB] rounded-md hover:bg-gray-100 transition-colors cursor-pointer shadow-sm flex flex-row justify-center items-center gap-2"
              onClick={() => navigate(`/${user?.id}/home`)}
            >
              <FaArrowLeft size={11} />
              Back to Games
            </button>
          </div>
        </div>

        <div className="w-full md:w-[350px] h-[230px] bg-[#F1F1F1] rounded-lg flex items-center justify-center shadow-md">
          <span className="text-[#A8A8A8]">Game Thumbnail</span>
        </div>
      </div>

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(45, 45, 45, 0.4)" }}
        >
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-md p-6 relative">
            <Components.ConfirmGame
              game={selectedGame}
              onConfirm={async () => {
                await startCrosswordGame(); // ✅ GET happens here only
                setShowConfirm(false);
                navigate(
                  `/${user?.id}/${slugifyTitle(selectedGame.title)}/start`
                );
              }}
              onCancel={() => setShowConfirm(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PreviewAction;

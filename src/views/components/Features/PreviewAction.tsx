// src/pages/user/components/PreviewAction.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Interfaces from "../../../interfaces";
import * as Components from "../../components";
import AuthExpiryModal from "../UI/AuthExpiryModal";
import { useAuth } from "../../../context/AuthContext";
import { useGame } from "../../../context/GameContext";

type PreviewActionProps = {
  selectedGame: Interfaces.Minigame;
};

const PreviewAction = ({ selectedGame }: PreviewActionProps) => {
  const { user, logout, sessionExpired } = useAuth();
  const {
    startCrosswordGame,
    startWordSearchGame,
    startHangmanGame,
    startDebuggingGame,
  } = useGame();

  const [showConfirm, setShowConfirm] = useState(false);
  const [showAuthExpiry, setShowAuthExpiry] = useState(false);
  const navigate = useNavigate();

  const slugifyTitle = (title: string) =>
    title.toLowerCase().replace(/\s+/g, "-");

  const handleStartGame = async () => {
    const gameSlug = slugifyTitle(selectedGame.title);
    const lowerTitle = selectedGame.title.toLowerCase();

    if (lowerTitle.includes("crossword")) {
      await startCrosswordGame();
    } else if (lowerTitle.includes("search")) {
      await startWordSearchGame();
    } else if (lowerTitle.includes("hangman")) {
      await startHangmanGame();
    } else if (lowerTitle.includes("debugging")) {
      await startDebuggingGame();
    }

    setShowConfirm(false);
    navigate(`/${user?.id}/${gameSlug}/start`);
  };

  // Determine glow color: prefer the game's canonical color if present
  const glowColor = selectedGame.color || (() => {
    const t = selectedGame.title.toLowerCase();
    if (t.includes("hangman")) return "#4498FF";
    if (t.includes("ship") || t.includes("debug")) return "#FC4D66";
    if (t.includes("search")) return "#42BFAB";
    if (t.includes("crossword")) return "#7E5CE3";
    return "#9CA3AF";
  })();

  const hexToRgba = (hex: string, alpha: number) => {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const glowStyle = {
    // smaller spread, less blur and slightly reduced alpha for a subtle glow
    boxShadow: `0 1px 3px rgba(0,0,0,0.06), 0 6px 12px ${hexToRgba(glowColor, 0.10)}`,
  } as React.CSSProperties;

  return (
    <>
  <div className="flex flex-col md:flex-row gap-9">
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center text-sm text-[#9CA3AF]">
            <span
              className="hover:text-[#7053D0] cursor-pointer"
              onClick={() => navigate(`/${user?.id}/home`)}
            >
              Home
            </span>
            <span className="mx-2">/</span>
            <span className="text-[#7053D0] font-medium">
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
              className="px-6 py-2 bg-[#7053D0] text-white hover:bg-[#482986]
              shadow-sm hover:shadow-md transition-colors focus:outline-none 
              focus:ring-2 focus:ring-[#EAE7FE] focus:ring-offset-2 disabled:opacity-60
               disabled:cursor-not-allowed cursor-pointer font-semibold rounded-lg"
              onClick={() => {
                // If the token is marked expired, or we have a token but no in-memory user,
                // show the AuthExpiryModal instead of the ConfirmGame modal.
                const accessToken = localStorage.getItem("accessToken");
                if (sessionExpired || (accessToken && !user)) {
                  setShowAuthExpiry(true);
                  return;
                }
                setShowConfirm(true);
              }}
            >
              Start Game
            </button>

            <Components.BackButton 
              onClick={() => navigate(`/${user?.id}/home`)}
              label="Back to Games"
              fontSize="text-base"
              fontWeight="font-semibold"
              iconSize={12}
            />

          </div>
        </div>

    <div className="w-full md:w-[380px] h-[230px] rounded-xl overflow-hidden shadow-md bg-white border border-[#E6EDF7]" style={glowStyle}>
          {selectedGame.image ? (
            <img
              src={selectedGame.image}
              alt={`${selectedGame.title} thumbnail`}
              className="w-full h-full object-cover"
            />
          ) : (
            // Fallback colored placeholder for games without images (e.g., Hangman, Ship Debugging)
            <div
              className={`w-full h-full flex items-center justify-center text-white font-bold p-4`}
              style={{
                background: (() => {
                  const t = selectedGame.title.toLowerCase();
                  // Use the project's canonical game colors
                  // prefer the game's canonical color when available
                  const base = selectedGame.color || (t.includes("hangman") ? "#4498FF" : t.includes("ship") || t.includes("debug") ? "#FC4D66" : "#9CA3AF");
                  // build a simple gradient from base to a slightly darker variant
                  const darker = (() => {
                    // crude darken by reducing hex components
                    const h = base.replace('#','');
                    const r = Math.max(0, parseInt(h.substring(0,2),16) - 25).toString(16).padStart(2,'0');
                    const g = Math.max(0, parseInt(h.substring(2,4),16) - 25).toString(16).padStart(2,'0');
                    const b = Math.max(0, parseInt(h.substring(4,6),16) - 25).toString(16).padStart(2,'0');
                    return `#${r}${g}${b}`;
                  })();
                  return `linear-gradient(135deg,${base},${darker})`;
                })(),
              }}
            >
              <span className="text-xl md:text-2xl px-4 text-center">{selectedGame.title}</span>
            </div>
          )}
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
              onConfirm={handleStartGame}
              onCancel={() => setShowConfirm(false)}
            />
          </div>
        </div>
      )}

      {showAuthExpiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(45, 45, 45, 0.4)" }}
        >
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-md p-6 relative">
            <AuthExpiryModal
              open={true}
              onConfirm={() => {
                try {
                  localStorage.removeItem("tokenExpired");
                  localStorage.setItem("tokenExpiredHandled", "1");
                } catch (e) {}
                logout();
                setShowAuthExpiry(false);
                navigate(`/`);
              }}
              onCancel={() => setShowAuthExpiry(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PreviewAction;

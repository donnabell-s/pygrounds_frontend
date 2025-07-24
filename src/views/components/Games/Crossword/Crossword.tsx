// src/pages/user/game/Crossword.tsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import { useGame } from "../../../../context/GameContext";
import type { AnswerSubmission, CrosswordPlacement } from "../../../../types/game";
import * as Component from "../../../components";

const Crossword: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    activeSession,
    gameEnded,
    getCrosswordGrid,
    submitAnswers,
    clearActiveSession,
    resetGameEnd,
  } = useGame();

  const [grid, setGrid] = useState<string[]>([]);
  const [placements, setPlacements] = useState<CrosswordPlacement[]>([]);
  const [letters, setLetters] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const storageKey = activeSession ? `crossword-letters-${activeSession.session_id}` : null;

  useEffect(() => {
    const stored = localStorage.getItem("submitted");
    if (stored === "true") {
      setSubmitted(true);
    }
  }, []);

  useEffect(() => {
    if (!activeSession) return;
    getCrosswordGrid(activeSession.session_id).then((data) => {
      if (data) {
        setGrid(data.grid);
        setPlacements(data.placements);
      }
    });
  }, [activeSession]);

  useEffect(() => {
    if (!activeSession || submitted || gameEnded) return;

    const start = new Date(activeSession.start_time).getTime();
    const duration = activeSession.time_limit * 1000;
    const end = start + duration;

    const now = new Date().getTime();
    const timeout = Math.max(0, end - now);

    const timer = setTimeout(() => {
      handleSubmit();
    }, timeout);

    return () => clearTimeout(timer);
  }, [activeSession, submitted, gameEnded]);

  useEffect(() => {
    if (!activeSession) return;
    const saved = localStorage.getItem(`crossword-letters-${activeSession.session_id}`);
    if (saved) {
      setLetters(JSON.parse(saved));
    }
  }, [activeSession]);

  useEffect(() => {
    if (activeSession) {
      localStorage.setItem(`crossword-letters-${activeSession.session_id}`, JSON.stringify(letters));
    }
  }, [letters, activeSession]);

  useEffect(() => {
    if (gameEnded && !submitted && activeSession && activeSession.status === "active") {
      handleSubmit();
    }
  }, [gameEnded, submitted, activeSession]);

  const editableCells = useMemo(() => {
    const positions = new Set<string>();
    placements.forEach((p) => {
      for (let i = 0; i < p.word.length; i++) {
        const r = p.row + (p.direction === "down" ? i : 0);
        const c = p.col + (p.direction === "across" ? i : 0);
        positions.add(`${r}-${c}`);
      }
    });
    return positions;
  }, [placements]);

  const numberingMap = useMemo(() => {
    const map: Record<string, number> = {};
    placements.forEach((placement, index) => {
      map[`${placement.row}-${placement.col}`] = index + 1;
    });
    return map;
  }, [placements]);

  const handleCellChange = (key: string, value: string) => {
    if (gameEnded || !editableCells.has(key)) return;
    setLetters((prev) => ({
      ...prev,
      [key]: value.toUpperCase().slice(0, 1),
    }));
  };

const handleSubmit = async () => {
  if (!activeSession || submitted) return; // ✅ prevent duplicate

  setSubmitted(true); // ✅ mark immediately to block future calls
  localStorage.setItem("submitted", "true");

  const answers: AnswerSubmission[] = placements
    .map((p) => {
      let guess = "";
      for (let i = 0; i < p.word.length; i++) {
        const r = p.row + (p.direction === "down" ? i : 0);
        const c = p.col + (p.direction === "across" ? i : 0);
        const key = `${r}-${c}`;
        guess += letters[key]?.toUpperCase() || " ";
      }

      const gameQuestion = activeSession.session_questions.find(
        (sq) => sq.question.answer.toUpperCase() === p.word.toUpperCase()
      );

      return {
        question_id: gameQuestion?.id || -1,
        user_answer: guess.trim(),
        time_taken: 0,
      };
    })
    .filter((a) => a.question_id !== -1);

  await submitAnswers(activeSession.session_id, answers);
  if (storageKey) localStorage.removeItem(storageKey);
};


  const renderClueList = (dir: "across" | "down") => {
    return placements
      .filter((p) => p.direction === dir)
      .map((p, idx) => {
        const num = numberingMap[`${p.row}-${p.col}`];
        return (
          <div key={`${p.word}-${idx}`} className="text-sm mb-1">
            <strong className="text-[#0077B6]">{num}.</strong> {p.clue}
          </div>
        );
      });
  };

  if (!activeSession) return <div>Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-10 py-6 px-4 justify-center items-start">
      <div className="grid grid-cols-15 gap-[2px] relative">
        {grid.map((row, rowIndex) =>
          row.split("").map((_, colIndex) => {
            const key = `${rowIndex}-${colIndex}`;
            const isEditable = editableCells.has(key);
            const number = numberingMap[key];

            return (
              <div
                key={key}
                className={`relative w-10 h-10 border border-[#2D2D2D] flex items-center justify-center ${
                  isEditable ? "bg-white" : "bg-[#E4ECF7]"
                }`}
              >
                {number && (
                  <span className="absolute top-[1px] left-[2px] text-[0.5rem] font-bold text-[#6B7280]">
                    {number}
                  </span>
                )}
                {isEditable ? (
                  <input
                    type="text"
                    maxLength={1}
                    value={letters[key] || ""}
                    disabled={gameEnded}
                    onChange={(e) => handleCellChange(key, e.target.value)}
                    className="w-full h-full text-center font-semibold text-sm outline-none"
                  />
                ) : null}
              </div>
            );
          })
        )}
      </div>

      <div className="flex flex-col gap-4 max-w-sm w-full">
        <div>
          <h2 className="text-md font-bold mb-2">Across</h2>
          {renderClueList("across")}
        </div>
        <div>
          <h2 className="text-md font-bold mt-4 mb-2">Down</h2>
          {renderClueList("down")}
        </div>

        {!gameEnded && (
          <button
            onClick={handleSubmit}
            className="bg-[#0077B6] hover:brightness-110 text-white px-4 py-2 rounded-md mt-6 cursor-pointer"
          >
            Submit Answers
          </button>
        )}
      </div>

      {gameEnded && submitted && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(45, 45, 45, 0.4)" }}
        >
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-md p-6 relative">
            <Component.ResultsModal
              onClose={() => {
                clearActiveSession();
                resetGameEnd();
                localStorage.removeItem("submitted");
                navigate(`/${user?.id}/home`);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Crossword;

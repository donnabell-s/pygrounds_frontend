import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import { useGame } from "../../../../context/GameContext";
import type { AnswerSubmission, WordSearchPlacement } from "../../../../types/game";
import * as Component from "../../../components";

const WordSearch: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    activeSession,
    gameEnded,
    getWordSearchMatrix,
    submitAnswers,
    clearActiveSession,
    resetGameEnd,
  } = useGame();

  const [matrix, setMatrix] = useState<string[]>([]);
  const [, setPlacements] = useState<WordSearchPlacement[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [highlighted, setHighlighted] = useState<Record<number, Set<string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [questionColors, setQuestionColors] = useState<Record<number, string>>({});
  const COLORS = [
  "bg-yellow-200",
  "bg-green-200",
  "bg-red-200",
  "bg-blue-200",
  "bg-purple-200",
  "bg-pink-200",
  "bg-orange-200",
  "bg-indigo-200",
];

useEffect(() => {
  if (!activeSession) return;

  const mapping: Record<number, string> = {};
  activeSession.session_questions.forEach((q, idx) => {
    mapping[q.id] = COLORS[idx % COLORS.length];
  });
  setQuestionColors(mapping);
}, [activeSession]);

  useEffect(() => {
    if (!activeSession) return;
    getWordSearchMatrix(activeSession.session_id).then((data) => {
      if (data) {
        setMatrix(data.matrix);
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
    if (gameEnded && !submitted && activeSession?.status === "active") {
      handleSubmit();
    }
  }, [gameEnded, submitted, activeSession]);

  const handleCellClick = (row: number, col: number) => {
    if (selectedQuestionId === null || gameEnded) return;
    const key = `${row}-${col}`;
    setHighlighted((prev) => {
      const prevSet = new Set(prev[selectedQuestionId] || []);
      if (prevSet.has(key)) {
        prevSet.delete(key);
      } else {
        prevSet.add(key);
      }
      return {
        ...prev,
        [selectedQuestionId]: prevSet,
      };
    });
  };

  const handleSubmit = async () => {
    if (!activeSession || submitted) return;
    setSubmitted(true);
    localStorage.setItem("submitted", "true");

    const answers: AnswerSubmission[] = Object.entries(highlighted).map(([questionId, cells]) => {
      const sortedCells = Array.from(cells)
        .map((cell) => {
          const [r, c] = cell.split("-").map(Number);
          return { r, c, key: cell };
        })
        .sort((a, b) => (a.r === b.r ? a.c - b.c : a.r - b.r)); // sort row then col

      const word = sortedCells
        .map(({ r, c }) => matrix[r]?.[c] || "")
        .join("");

      return {
        question_id: Number(questionId),
        user_answer: word, // ✅ ACTUAL word
        time_taken: 0,
      };
    });


    await submitAnswers(activeSession.session_id, answers);
  };

  if (!activeSession) return <div>Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-10 py-6 px-4 justify-center items-start">
      <div className="grid grid-cols-15 gap-[2px] relative">
        {matrix.map((row, rowIndex) =>
          row.split("").map((char, colIndex) => {
            const key = `${rowIndex}-${colIndex}`;
            const questionIdForCell = Object.entries(highlighted).find(([, cells]) =>
                cells.has(key)
              )?.[0];
              const highlightColor = questionIdForCell
                ? questionColors[parseInt(questionIdForCell)]
                : "bg-white";

            return (
              <div
                key={key}
                  className={`w-10 h-10 border border-[#2D2D2D] flex items-center justify-center cursor-pointer text-sm font-semibold ${highlightColor}`}

                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {char}
              </div>
            );
          })
        )}
      </div>

      <div className="flex flex-col gap-4 max-w-sm w-full">
        <h2 className="text-md font-bold mb-2">Questions</h2>
        {activeSession.session_questions.map((sq) => (
          <button
            key={sq.id}
            onClick={() => setSelectedQuestionId(sq.id)}
            className={`text-left p-2 border rounded-md text-sm ${
              selectedQuestionId === sq.id ? "bg-blue-100 border-blue-400" : "hover:bg-gray-100"
            }`}
          >
            {sq.question.text}
          </button>
        ))}

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

export default WordSearch;

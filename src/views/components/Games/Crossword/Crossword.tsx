import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../../../../context/GameContext";
import { useAuth } from "../../../../context/AuthContext";

interface Placement {
  word: string;
  clue: string;
  row: number;
  col: number;
  direction: "across" | "down";
}

type Cell = {
  letter: string;
  readOnly: boolean;
  partOf: string[];
  number?: number;
};

const Crossword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeSession, submitCrosswordResult } = useGame();
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clues, setClues] = useState<{ across: Placement[]; down: Placement[] }>({
    across: [],
    down: [],
  });

  useEffect(() => {
    if (!activeSession) {
      navigate(`/${user?.id}/home`);
    }
  }, [activeSession, user, navigate]);

  useEffect(() => {
    if (!activeSession) return;

    const rows = activeSession.grid.length;
    const cols = activeSession.grid[0]?.length || 0;
    let clueNumber = 1;

    const numberMap: Record<string, number> = {}; // key = row-col

    const newGrid: Cell[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        letter: "",
        readOnly: true,
        partOf: [],
      }))
    );

    const across: Placement[] = [];
    const down: Placement[] = [];

    activeSession.placements.forEach(({ word, row, col, direction, clue }) => {
      const upperWord = word.toUpperCase();
      const key = `${row}-${col}`;

      if (!numberMap[key]) {
        numberMap[key] = clueNumber++;
      }

      if (direction === "across") across.push({ word, clue, row, col, direction });
      if (direction === "down") down.push({ word, clue, row, col, direction });

      for (let i = 0; i < upperWord.length; i++) {
        const r = direction === "across" ? row : row + i;
        const c = direction === "across" ? col + i : col;
        newGrid[r][c] = {
          ...newGrid[r][c],
          letter: "",
          readOnly: false,
          partOf: [...(newGrid[r][c]?.partOf || []), word],
        };

        // Only mark number on the first cell
        if (i === 0) {
          newGrid[r][c].number = numberMap[key];
        }
      }
    });

    setGrid(newGrid);
    setClues({ across, down });
  }, [activeSession]);

  const handleChange = (r: number, c: number, val: string) => {
    const char = val.slice(-1).toUpperCase();
    setGrid((prev) => {
      const updated = prev.map((row) => row.map((cell) => ({ ...cell })));
      updated[r][c].letter = char;
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!activeSession || !user) return;

    const answered: string[] = [];

    for (const { word, row, col, direction } of activeSession.placements) {
      let built = "";

      for (let i = 0; i < word.length; i++) {
        const r = direction === "across" ? row : row + i;
        const c = direction === "across" ? col + i : col;
        built += grid[r][c]?.letter || "";
      }

      if (built.toUpperCase() === word.toUpperCase()) {
        answered.push(word);
      }
    }

    const startedAt = new Date(activeSession.started_at).getTime();
    const timeTaken = Math.floor((Date.now() - startedAt) / 1000);

    setIsSubmitting(true);
    await submitCrosswordResult(activeSession.session_id, {
      answered,
      time_taken: timeTaken,
    });
    setIsSubmitting(false);
  };

  if (!activeSession) return null;

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Crossword Puzzle</h2>

      <div className="overflow-x-auto">
        <div
          className="relative grid gap-[2px] bg-gray-400 w-fit mx-auto"
          style={{
            gridTemplateColumns: `repeat(${grid[0]?.length || 0}, 2rem)`,
          }}
        >
          {grid.flatMap((row, rIdx) =>
            row.map((cell, cIdx) => (
              <div key={`${rIdx}-${cIdx}`} className="relative">
                {cell.readOnly ? (
                  <div className="w-8 h-8 bg-gray-300" />
                ) : (
                  <>
                    {cell.number && (
                      <div className="absolute top-[2px] left-[2px] text-[0.5rem] text-gray-500 font-bold">
                        {cell.number}
                      </div>
                    )}
                    <input
                      className="w-8 h-8 text-center uppercase border text-sm bg-white"
                      maxLength={1}
                      value={cell.letter}
                      onChange={(e) => handleChange(rIdx, cIdx, e.target.value)}
                    />
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>


      <div className="mt-8">
        <h3 className="font-semibold mb-2 text-lg">Clues</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-1">Across</h4>
            <ul className="text-sm list-disc list-inside">
              {clues.across.map((clue, idx) => (
                <li key={`${clue.word}-across`}>{clue.clue}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Down</h4>
            <ul className="text-sm list-disc list-inside">
              {clues.down.map((clue, idx) => (
                <li key={`${clue.word}-down`}>{clue.clue}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:brightness-110"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Answers"}
      </button>

    </div>
  );
};

export default Crossword;

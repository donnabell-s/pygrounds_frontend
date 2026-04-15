import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import { useGame } from "../../../../context/GameContext";
import type { AnswerSubmission, CrosswordPlacement } from "../../../../types/game";
import * as Component from "../../../components";

type ExtendedPlacement = CrosswordPlacement & {
  clue?: string;
  game_question_id?: number | string | null;
};

const toNum = (v: unknown): number | undefined => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const norm = (s?: string | null) => (s ?? "").replace(/[^A-Za-z]/g, "").toUpperCase();

const Crossword: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { activeSession, gameEnded, getCrosswordGrid, submitAnswers, clearActiveSession, resetGameEnd } = useGame();

  const [grid, setGrid] = useState<string[]>([]);
  const [placements, setPlacements] = useState<ExtendedPlacement[]>([]);
  const [letters, setLetters] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [selectedPlacement, setSelectedPlacement] = useState<ExtendedPlacement | null>(null);

  const storageKey = activeSession ? `crossword-letters-${activeSession.session_id}` : null;
  const submittedKey = activeSession ? `submitted-${activeSession.session_id}` : null;

  const normalizePlacements = (raw: any[] = []): ExtendedPlacement[] => {
    const unique: ExtendedPlacement[] = [];
    const seen = new Set<number>();
    for (const p of raw) {
      const id = toNum(p?.game_question_id);
      if (!id) continue;
      if (seen.has(id)) continue;
      seen.add(id);
      unique.push({ ...(p as ExtendedPlacement), game_question_id: id });
    }
    return unique;
  };

  useEffect(() => {
    if (!submittedKey) return;
    const stored = localStorage.getItem(submittedKey);
    if (stored === "true") setSubmitted(true);
  }, [submittedKey]);

  useEffect(() => {
    if (!activeSession) return;
    (async () => {
      const data = await getCrosswordGrid(activeSession.session_id);
      if (!data) return;
      setGrid(data.grid || []);
      setPlacements(normalizePlacements(data.placements || []));
    })();
  }, [activeSession, getCrosswordGrid]);

  useEffect(() => {
    if (!activeSession || submitted || gameEnded) return;
    const start = new Date(activeSession.start_time).getTime();
    const duration = (activeSession.time_limit || 0) * 1000;
    const end = start + duration;
    const now = Date.now();
    const timeout = Math.max(0, end - now);
    const timer = setTimeout(() => handleSubmit(), timeout);
    return () => clearTimeout(timer);
  }, [activeSession, submitted, gameEnded]);

  useEffect(() => {
    if (!activeSession) return;
    const saved = localStorage.getItem(`crossword-letters-${activeSession.session_id}`);
    if (saved) setLetters(JSON.parse(saved));
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

  // When a placement is selected, focus its first input so typing begins immediately
  useEffect(() => {
    if (!selectedPlacement) return;
    const cells = getCellsForPlacement(selectedPlacement);
    if (!cells || cells.length === 0) return;
    const firstKey = cells[0];
    // delay slightly to ensure DOM updates if needed
    setTimeout(() => {
      const el = document.querySelector<HTMLInputElement>(`input[data-cell="${firstKey}"]`);
      if (el) {
        el.focus();
        try { el.select(); } catch (err) { /* ignore */ }
      }
    }, 0);
  }, [selectedPlacement]);

  const wordToGqId = useMemo(() => {
    const m = new Map<string, number>();
    const sqs = activeSession?.session_questions ?? [];
    for (const sq of sqs) {
      const key = norm(sq?.question?.correct_answer ?? "");
      if (key && !m.has(key)) m.set(key, sq.id);
    }
    return m;
  }, [activeSession]);

  const orderedPlacedIds = useMemo<number[]>(() => {
    const placedIds = new Set(
      placements
        .map((p) => toNum(p.game_question_id) ?? wordToGqId.get(norm(p.word)))
        .filter((v): v is number => !!v),
    );
    return (activeSession?.session_questions ?? [])
      .map((sq) => Number(sq.id))
      .filter((id) => placedIds.has(id));
  }, [placements, activeSession, wordToGqId]);

  const gqIdToNumber = useMemo<Map<number, number>>(() => {
    const map = new Map<number, number>();
    orderedPlacedIds.forEach((id, idx) => map.set(id, idx + 1));
    return map;
  }, [orderedPlacedIds]);

  const startCellNumberingMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of placements) {
      const id = toNum(p.game_question_id) ?? wordToGqId.get(norm(p.word));
      if (!id) continue;
      const num = gqIdToNumber.get(id);
      if (!num) continue;
      map[`${p.row}-${p.col}`] = num;
    }
    return map;
  }, [placements, gqIdToNumber, wordToGqId]);

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

  const getCellsForPlacement = (p: ExtendedPlacement) => {
    const cells: string[] = [];
    for (let i = 0; i < p.word.length; i++) {
      const r = p.row + (p.direction === "down" ? i : 0);
      const c = p.col + (p.direction === "across" ? i : 0);
      cells.push(`${r}-${c}`);
    }
    return cells;
  };

  const getCellClass = (key: string, isEditable: boolean) => {
    // make non-editable (negative) cells a bit darker so they read better against the page
    if (!isEditable) return "bg-[#C6D4E6]";
    if (!selectedPlacement) return "bg-white";
    const cells = getCellsForPlacement(selectedPlacement);
    return cells.includes(key) ? "bg-yellow-200" : "bg-white";
  };

  const handleCellChange = (key: string, value: string) => {
    if (gameEnded || !editableCells.has(key)) return;
    const char = value.toUpperCase().slice(0, 1);
    setLetters((prev) => ({ ...prev, [key]: char }));

    if (char && selectedPlacement) {
      const cells = getCellsForPlacement(selectedPlacement);
      const idx = cells.indexOf(key);
      if (idx !== -1 && idx < cells.length - 1) {
        const nextKey = cells[idx + 1];
        const nextInput = document.querySelector<HTMLInputElement>(`input[data-cell="${nextKey}"]`);
        if (nextInput) {
          nextInput.focus();
          try { nextInput.select(); } catch (err) { /* ignore */ }
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, key: string) => {
    if (!selectedPlacement) return;

    const cells = getCellsForPlacement(selectedPlacement);
    const idx = cells.indexOf(key);
    if (idx === -1) return;

    // Backspace behavior: clear current cell if it has a value; otherwise move to previous cell and clear it.
      if (e.key === "Backspace") {
      e.preventDefault();
      const currentVal = (letters[key] || "").toString();
      if (currentVal.length > 0) {
        setLetters((prev) => ({ ...prev, [key]: "" }));
        const curInput = document.querySelector<HTMLInputElement>(`input[data-cell="${key}"]`);
        if (curInput) {
          curInput.focus();
          try { curInput.select(); } catch (err) { /* ignore */ }
        }
      } else if (idx > 0) {
        const prevKey = cells[idx - 1];
        setLetters((prev) => ({ ...prev, [prevKey]: "" }));
        const prevInput = document.querySelector<HTMLInputElement>(`input[data-cell="${prevKey}"]`);
        if (prevInput) {
          prevInput.focus();
          try { prevInput.select(); } catch (err) { /* ignore */ }
        }
      }
      return;
    }

    let nextIdx = idx;
    if (e.key === "ArrowRight" && selectedPlacement.direction === "across") nextIdx = Math.min(idx + 1, cells.length - 1);
    else if (e.key === "ArrowLeft" && selectedPlacement.direction === "across") nextIdx = Math.max(idx - 1, 0);
    else if (e.key === "ArrowDown" && selectedPlacement.direction === "down") nextIdx = Math.min(idx + 1, cells.length - 1);
    else if (e.key === "ArrowUp" && selectedPlacement.direction === "down") nextIdx = Math.max(idx - 1, 0);

    if (nextIdx !== idx) {
      const nextKey = cells[nextIdx];
      const nextInput = document.querySelector<HTMLInputElement>(`input[data-cell="${nextKey}"]`);
      if (nextInput) {
        nextInput.focus();
        try { nextInput.select(); } catch (err) { /* ignore */ }
      }
      e.preventDefault();
    }
  };

  const handleSubmit = async () => {
    if (!activeSession || submitted) return;
    setSubmitted(true);
    if (submittedKey) localStorage.setItem(submittedKey, "true");

    const used = new Set<number>();
    const answers: AnswerSubmission[] = placements
      .map((p) => {
        let guess = "";
        for (let i = 0; i < p.word.length; i++) {
          const r = p.row + (p.direction === "down" ? i : 0);
          const c = p.col + (p.direction === "across" ? i : 0);
          const key = `${r}-${c}`;
          guess += (letters[key]?.toUpperCase() || " ");
        }

        const viaPlacement = toNum(p.game_question_id);
        const viaWord = wordToGqId.get(norm(p.word));
        const gqid = viaPlacement ?? viaWord;

        if (!gqid || used.has(gqid)) return null;
        used.add(gqid);

        return { question_id: gqid, user_answer: guess.trim(), time_taken: 0 };
      })
      .filter((a): a is AnswerSubmission => !!a);

    await submitAnswers(activeSession.session_id, answers);
    if (storageKey) localStorage.removeItem(storageKey);
  };

  const renderClueList = (dir: "across" | "down") =>
    placements
      .filter((p) => p.direction === dir)
      .map((p, idx) => {
        const id = toNum(p.game_question_id) ?? wordToGqId.get(norm(p.word));
        const num = id ? gqIdToNumber.get(id) : undefined;
        const isSelected = selectedPlacement === p;
        // consider a placement complete when all its boxes are filled (regardless of correctness)
        const isComplete = (() => {
          const cells = getCellsForPlacement(p);
          return cells.length > 0 && cells.every((key) => {
            const v = (letters[key] || "").toString().trim();
            return v.length > 0;
          });
        })();
        return (
          <div
            key={`${p.word}-${p.row}-${p.col}-${p.direction}-${idx}`}
            className={`text-sm mb-1 cursor-pointer px-3 py-2 rounded transition-all border shadow-sm ${isSelected ? "bg-yellow-100 border-yellow-300 " : "bg-white hover:bg-gray-100 border-gray-200"}`}
            onClick={() => setSelectedPlacement(p)}
          >
            <strong className="text-[#0B4BCB] mr-1">{num ?? ""}.</strong>
            <span className={`${isComplete ? "line-through text-gray-500" : ""}`}>{p.clue || ""}</span>
          </div>
        );
      });

  if (!activeSession) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-10 py-6 px-4 justify-center items-start bg-[#F8FAFC] min-h-screen">
  <div className="inline-block overflow-hidden border border-[#6B7280]">
        <div className="grid grid-cols-15">
          {grid.map((row, rowIndex) =>
            row.split("").map((_, colIndex) => {
              const key = `${rowIndex}-${colIndex}`;
              const isEditable = editableCells.has(key);
              const number = startCellNumberingMap[key];

              return (
                <div
                  key={key}
                  className={`relative w-10 h-10 border border-[#6B7280] flex items-center justify-center ${getCellClass(key, isEditable)} transition-all duration-150`}
                >
                  {number && (
                    <span className="absolute top-[2px] left-[3px] text-[0.55rem] font-bold text-[#6B7280]">{number}</span>
                  )}
                  {isEditable ? (
                    <input
                      type="text"
                      maxLength={1}
                      value={letters[key] || ""}
                      disabled={gameEnded}
                      data-cell={key}
                      onChange={(e) => handleCellChange(key, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, key)}
                      className="w-full h-full text-center font-semibold text-sm outline-none focus:bg-yellow-100 focus:ring-1 focus:ring-[#0B4BCB]"
                    />
                  ) : null}
                </div>
              );
            }),
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 max-w-sm w-full">
        <div>
          <h2 className="text-md font-bold mb-2 text-[#0B4BCB]">Across</h2>
          {renderClueList("across")}
        </div>
        <div>
          <h2 className="text-md font-bold mt-4 mb-2 text-[#0B4BCB]">Down</h2>
          {renderClueList("down")}
        </div>

        {!gameEnded && (
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              className="w-full py-2 bg-[#0B4BCB] hover:bg-[#083ea0] text-white rounded-md text-md font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-[#BFD9FF]"
            >
              Submit Answers
            </button>
          </div>
        )}
      </div>

      {gameEnded && submitted && (
        <div>
          <Component.ResultsModal
            onClose={() => {
              if (submittedKey) localStorage.removeItem(submittedKey);
              clearActiveSession();
              resetGameEnd();
              navigate(`/${user?.id}/home`);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Crossword;

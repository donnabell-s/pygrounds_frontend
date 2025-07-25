// src/pages/user/game/WordSearch.tsx

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import { useGame } from "../../../../context/GameContext";
import type { AnswerSubmission, WordSearchPlacement } from "../../../../types/game";
import * as Component from "../../../components";

const CELL_SIZE = 40; // Tailwind w-10 = 40px
const GAP = 2;        // gap-[2px] between cells

// CSS & canvas‐RGBA color arrays
const COLORS_CSS = [
  "bg-yellow-400","bg-green-400","bg-red-400","bg-blue-400",
  "bg-purple-400","bg-pink-400","bg-orange-400","bg-indigo-400",
];
const COLORS_RGBA = [
  "rgba(250,204,21,0.5)","rgba(74,222,128,0.5)","rgba(248,113,113,0.5)",
  "rgba(96,165,250,0.5)","rgba(192,132,252,0.5)","rgba(244,114,182,0.5)",
  "rgba(251,146,60,0.5)","rgba(165,180,252,0.5)",
];

const WordSearch: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    activeSession, gameEnded,
    getWordSearchMatrix, submitAnswers,
    clearActiveSession, resetGameEnd,
  } = useGame();

  // ─── state ─────────────────────────────────────────────────────────
  const [matrix, setMatrix] = useState<string[]>([]);
  const [, setPlacements] = useState<WordSearchPlacement[]>([]);

  const [questionCss, setQuestionCss] = useState<Record<number,string>>({});
  const [questionRgba, setQuestionRgba] = useState<Record<number,string>>({});

  const [selectedQ, setSelectedQ] = useState<number|null>(null);
  const [highlighted, setHighlighted] = useState<Record<number,string[]>>({});

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart,   setDragStart]   = useState<[number,number] | null>(null);
  const [dragPath,    setDragPath]    = useState<string[]>([]);

  const [submitted, setSubmitted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);


  const getDirection = (
    [r0,c0]:[number,number],
    [r1,c1]:[number,number]
  ): [number,number] | null => {
    const dy = r1 - r0, dx = c1 - c0;
    if (dy === 0 && dx === 0) return null;
    return [Math.sign(dy), Math.sign(dx)];
  };
  const getCellsInLine = (
    [sr,sc]:[number,number],
    [dy,dx]:[number,number],
    [er,ec]:[number,number]
  ): string[] => {
    const path:string[] = [];
    let r=sr, c=sc;
    while (
      (dy===0 || (dy>0? r<=er: r>=er)) &&
      (dx===0 || (dx>0? c<=ec: c>=ec))
    ) {
      if (r<0||c<0||r>=matrix.length||c>=matrix[0].length) break;
      path.push(`${r}-${c}`);
      r+=dy; c+=dx;
    }
    return path;
  };

  // ─── session setup ──────────────────────────────────────────────────
  useEffect(() => {
    if (!activeSession) return;
    const css:Record<number,string> = {};
    const rgba:Record<number,string> = {};
    activeSession.session_questions.forEach((q,i) => {
      css[q.id]  = COLORS_CSS[i % COLORS_CSS.length];
      rgba[q.id] = COLORS_RGBA[i % COLORS_RGBA.length];
    });
    setQuestionCss(css);
    setQuestionRgba(rgba);
  }, [activeSession]);

  useEffect(() => {
    if (!activeSession) return;
    getWordSearchMatrix(activeSession.session_id).then(data => {
      if (data) {
        setMatrix(data.matrix);
        setPlacements(data.placements);
      }
    });
  }, [activeSession]);

  // ─── auto-submit timers ──────────────────────────────────────────────
  useEffect(() => {
    if (!activeSession || submitted || gameEnded) return;
    const startMs = new Date(activeSession.start_time).getTime();
    const endMs   = startMs + activeSession.time_limit*1000;
    const wait    = Math.max(0, endMs - Date.now());
    const t       = setTimeout(() => doSubmit(), wait);
    return () => clearTimeout(t);
  }, [activeSession, submitted, gameEnded]);

  useEffect(() => {
    if (gameEnded && !submitted && activeSession?.status==="active") {
      doSubmit();
    }
  }, [gameEnded, submitted, activeSession]);

  // ─── global mouseup ─────────────────────────────────────────────────
  useEffect(() => {
    const onUp = () => { if (isDragging) finishDrag(); };
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, [isDragging, dragStart, dragPath]);

  // ─── canvas drawing ─────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // draw each found word
    Object.entries(highlighted).forEach(([qid, cells]) => {
      if (cells.length<2) return;
      const color = questionRgba[+qid] || "rgba(0,0,0,0.3)";
      const [r0,c0] = cells[0].split("-").map(Number);
      const [r1,c1] = cells[cells.length-1].split("-").map(Number);
      const x0 = c0*(CELL_SIZE+GAP) + CELL_SIZE/2;
      const y0 = r0*(CELL_SIZE+GAP) + CELL_SIZE/2;
      const x1 = c1*(CELL_SIZE+GAP) + CELL_SIZE/2;
      const y1 = r1*(CELL_SIZE+GAP) + CELL_SIZE/2;
      ctx.strokeStyle = color;
      ctx.lineWidth   = CELL_SIZE - 8;
      ctx.lineCap     = "round";
      ctx.beginPath();
      ctx.moveTo(x0,y0);
      ctx.lineTo(x1,y1);
      ctx.stroke();
    });

    // draw live drag
    if (isDragging && dragPath.length>=2) {
      const [r0,c0] = dragPath[0].split("-").map(Number);
      const [r1,c1] = dragPath[dragPath.length-1].split("-").map(Number);
      const x0 = c0*(CELL_SIZE+GAP) + CELL_SIZE/2;
      const y0 = r0*(CELL_SIZE+GAP) + CELL_SIZE/2;
      const x1 = c1*(CELL_SIZE+GAP) + CELL_SIZE/2;
      const y1 = r1*(CELL_SIZE+GAP) + CELL_SIZE/2;
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth   = CELL_SIZE - 8;
      ctx.lineCap     = "round";
      ctx.beginPath();
      ctx.moveTo(x0,y0);
      ctx.lineTo(x1,y1);
      ctx.stroke();
    }
  }, [highlighted, dragPath, isDragging, questionRgba, matrix]);

  // ─── drag handlers ──────────────────────────────────────────────────
  const startDrag = (r: number, c: number) => {
    if (selectedQ === null || gameEnded) return;
    setIsDragging(true);
    setDragStart([r, c]);
    setDragPath([`${r}-${c}`]);
  };  
  const moveDrag = (r: number, c: number) => {
    if (!isDragging || !dragStart) return;

    // recompute every time
    const dir = getDirection(dragStart, [r, c]);
    if (!dir) {
      // if not a valid 8-way, reset to just the start cell
      setDragPath([`${dragStart[0]}-${dragStart[1]}`]);
      return;
    }

    const line = getCellsInLine(dragStart, dir, [r, c]);
    setDragPath(line);
  };
const finishDrag = () => {
  if (!isDragging || selectedQ === null) return;
  setHighlighted((prev) => ({
    ...prev,
    [selectedQ]: [...dragPath],
  }));
  setIsDragging(false);
  setDragStart(null);
  setDragPath([]);
};

  // ─── submit logic ───────────────────────────────────────────────────
  const doSubmit = async () => {
    if (!activeSession || submitted) return;
    setSubmitted(true);
    localStorage.setItem("submitted","true");

    const answers: AnswerSubmission[] = Object.entries(highlighted).map(
      ([qid,cells]) => {
        const sorted = cells.map(k => {
          const [r,c] = k.split("-").map(Number);
          return { r,c };
        }).sort((a,b) => a.r===b.r ? a.c-b.c : a.r-b.r);
        const word = sorted.map(({r,c}) => matrix[r][c]).join("");
        return {
          question_id: +qid,
          user_answer: word,
          time_taken: 0,
        };
      }
    );
    await submitAnswers(activeSession.session_id, answers);
  };

  if (!activeSession) return <div>Loading…</div>;

  const rows = matrix.length;
  const cols = matrix[0]?.length || 0;
  const totalW = cols*(CELL_SIZE+GAP) - GAP;
  const totalH = rows*(CELL_SIZE+GAP) - GAP;

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6">
      {/* GRID + CANVAS */}
      <div
        className="relative select-none"
        style={{ width:`${totalW}px`, height:`${totalH}px` }}
      >
        <canvas
          ref={canvasRef}
          width={totalW}
          height={totalH}
          className="absolute top-0 left-0 z-10 pointer-events-none"
        />
        <div
          className="absolute top-0 left-0 grid gap-[2px] shadow-md"
          style={{ gridTemplateColumns:`repeat(${cols},${CELL_SIZE}px)` }}
        >
          {matrix.map((row,r) =>
            row.split("").map((ch,c) => (
              <div
                key={`${r}-${c}`}
                className="w-10 h-10  flex items-center justify-center text-sm font-medium bg-white shadow-sm"
                onMouseDown={() => startDrag(r, c)}
                onMouseEnter={() => moveDrag(r, c)}
                onMouseUp={finishDrag}
              >
                {ch}
              </div>
            ))
          )}
        </div>
      </div>

{/* SIDEBAR */}
<div className="flex flex-col gap-2 w-full max-w-sm">
  <h2 className="text-lg font-bold">Questions</h2>
  {activeSession.session_questions.map((sq) => {
    const isSelected = selectedQ === sq.id;
    const isAnswered = Array.isArray(highlighted[sq.id]) && highlighted[sq.id].length > 1;

    // 1) Selected gets full color + black border
    // 2) Answered (but not selected) gets half-opacity color, no heavy border
    // 3) Otherwise white with hover state
    const bgClass = isSelected
      ? questionCss[sq.id]
      : isAnswered
      ? `${questionCss[sq.id]} bg-opacity-50`
      : "bg-white hover:bg-gray-100";
    const borderClass = isSelected
      ? "border-black"
      : isAnswered
      ? "border-transparent"
      : "border-gray-300";

    return (
      <button
        key={sq.id}
        onClick={() => setSelectedQ(sq.id)}
        className={`
          text-left px-3 py-2 rounded shadow-sm cursor-pointer
          ${borderClass} ${bgClass}
        `}
      >
        {sq.question.text}
      </button>
    );
  })}

  {!gameEnded && (
    <button
      onClick={doSubmit}
      className="bg-[#0077B6] hover:brightness-110 text-white px-4 py-2 rounded-md mt-6 cursor-pointer"
    >
      Submit Answers
    </button>
  )}

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

    </div>
  );
};

export default WordSearch;

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../../../context/GameContext";

interface ResultsModalProps { onClose: () => void; }

type RespRow = {
  question?: number | string;                 // authoritative join key
  user_answer?: string | null;
  is_correct?: boolean | null;
  // tolerate variants just in case:
  session_question_id?: number | string;
  question_id?: number | string;
  response?: { user_answer?: string | null; is_correct?: boolean | null } | null;
};

type SQ = {
  id: number;
  question?: {
    question_text?: string;
    correct_answer?: string | null;
    explanation?: string | null;
    game_type?: string;
    game_data?: Record<string, any>;
  };
  user_answer?: string | null;
  response?: { user_answer?: string | null; is_correct?: boolean | null } | null;
  is_correct?: boolean | null;
  correct?: boolean | null;
};

const normalize = (s?: string | null) =>
  (s ?? "").toString().trim().replace(/\s+/g, " ").replace(/[^A-Za-z0-9]/g, "").toUpperCase();

const ResultsModal: React.FC<ResultsModalProps> = ({ onClose }) => {
  const { activeSession, fetchResponses } = useGame();
  const navigate = useNavigate();

  // Map: GameQuestion ID -> { ua, ok }
  const [respMap, setRespMap] = useState<Record<number, { ua?: string | null; ok?: boolean | null }>>({});

  useEffect(() => {
    (async () => {
      if (!activeSession?.session_id) return;
      const rows = (await fetchResponses(activeSession.session_id)) as RespRow[] | null;
      if (!rows) return;

      const m: Record<number, { ua?: string | null; ok?: boolean | null }> = {};
      for (const r of rows) {
        // prefer `question` (GameQuestion ID); fall back to others if backend changes shape
        const keyRaw = r.question ?? r.session_question_id ?? r.question_id;
        const key = keyRaw != null ? Number(keyRaw) : NaN;
        if (!Number.isFinite(key)) continue;

        const ua = r.user_answer ?? r.response?.user_answer ?? null;
        const ok = typeof r.is_correct === "boolean"
          ? r.is_correct
          : typeof r.response?.is_correct === "boolean"
          ? r.response.is_correct
          : null;

        m[key] = { ua, ok };
      }
      setRespMap(m);
    })();
  }, [activeSession?.session_id, fetchResponses]);

  // ✅ Only show/count questions that actually have a stored response
  const items = useMemo(() => {
    const all: SQ[] = activeSession?.session_questions ?? [];
    const filtered = all.filter((sq) => respMap[sq.id] !== undefined);

    const sessionGameType = (activeSession?.game_type || "").toLowerCase();
    const sessionIsCoding = ["debugging", "hangman", "coding"].includes(sessionGameType);

    return filtered.map((sq) => {
      const q = sq.question ?? {};
      const qText = q.question_text ?? "";
      const correctAnswer = q.correct_answer ?? "";
      const explanation = q.explanation ?? q.game_data?.explanation ?? "";
      const isCoding = sessionIsCoding || (q.game_type ?? "").toLowerCase() === "coding";

      const fetched = respMap[sq.id] || {};
      const userAnswerRaw = fetched.ua ?? sq.user_answer ?? sq.response?.user_answer ?? null;

      const serverCorrect =
        typeof fetched.ok === "boolean" ? fetched.ok
        : typeof sq.is_correct === "boolean" ? sq.is_correct
        : typeof sq.response?.is_correct === "boolean" ? sq.response.is_correct
        : typeof sq.correct === "boolean" ? sq.correct
        : undefined;

      const computedCorrect = !isCoding ? normalize(userAnswerRaw) === normalize(correctAnswer) : undefined;
      const isCorrect = serverCorrect ?? (typeof computedCorrect === "boolean" ? computedCorrect : false);

      return {
        id: sq.id,
        qText,
        correctAnswer,
        explanation,
        userAnswer: userAnswerRaw ?? "—",
        isCorrect,
        isCoding,
      };
    });
  }, [activeSession, respMap]);

  const total = items.length;
  const correctCount = items.filter((i) => i.isCorrect).length;

  const handleClose = () => {
    onClose();
    const storedUser = localStorage.getItem("user");
    const userId = storedUser ? JSON.parse(storedUser).id : "";
    navigate(`/${userId}/home`);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#0077B6]">Game Results</h2>
        <div className="text-right">
          <div className="text-sm text-gray-500">Score</div>
          <div className="text-2xl font-extrabold">{correctCount} / {total}</div>
        </div>
      </div>

      <div className="max-h-[55vh] overflow-auto pr-1 space-y-3">
        {items.map((it, idx) => (
          <div key={it.id ?? idx}
               className={`rounded-md border p-3 shadow-sm ${it.isCorrect ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm">
                <div className="font-semibold text-gray-800">{idx + 1}. {it.qText}</div>
                <div className="mt-1 space-y-0.5">
                  <div className="text-[13px]"><span className="font-medium text-gray-700">Your answer:</span>{" "}
                    <span className="font-mono break-words">{it.userAnswer}</span>
                  </div>
                  {!it.isCoding && (
                    <div className="text-[13px]"><span className="font-medium text-gray-700">Correct answer:</span>{" "}
                      <span className="font-mono break-words">{it.correctAnswer || "—"}</span>
                    </div>
                  )}
                  {it.isCoding && (
                    <div className="text-[13px]"><span className="font-medium text-gray-700">Explanation:</span>{" "}
                      <span className="break-words">{it.explanation?.trim() ? it.explanation : "No explanation yet."}</span>
                    </div>
                  )}
                </div>
              </div>
              <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${it.isCorrect ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
                {it.isCorrect ? "Correct" : "Wrong"}
              </span>
            </div>
          </div>
        ))}
        {total === 0 && <div className="text-sm text-gray-600">No questions found for this session.</div>}
      </div>

      <div className="pt-1 flex items-center justify-end">
        <button onClick={handleClose} className="px-5 py-2 bg-[#0077B6] text-white rounded-md hover:brightness-110 transition-colors">
          Return Home
        </button>
      </div>
    </div>
  );
};

export default ResultsModal;

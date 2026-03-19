import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../../../context/GameContext";
import { useAdaptive } from "../../../context/AdaptiveContext";
import * as Component from "../../components";
import { FaRegClock } from "react-icons/fa6";
import { HiOutlineLightningBolt } from "react-icons/hi";
import { TiStarOutline } from "react-icons/ti";
import QuestionResultCard from "./QuestionResultCard";

interface ResultsModalProps {
  onClose: () => void;
}

type RespRow = {
  question?: number | string;
  user_answer?: string | null;
  is_correct?: boolean | null;
  session_question_id?: number | string;
  question_id?: number | string;
  response?: { user_answer?: string | null; is_correct?: boolean | null } | null;
};

type SQ = {
  id: number;
  question?: {
    id?: number;
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
  (s ?? "")
    .toString()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();

const ResultsModal: React.FC<ResultsModalProps> = ({ onClose }) => {
  const { activeSession, fetchResponses } = useGame();
  const { refresh } = useAdaptive();
  const navigate = useNavigate();

  const startTime = activeSession?.start_time ? new Date(activeSession.start_time).getTime() : 0;
  const endTime = activeSession?.end_time ? new Date(activeSession.end_time).getTime() : 0;

  const elapsedSeconds = startTime && endTime ? Math.max(0, Math.floor((endTime - startTime) / 1000)) : 0;
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeStr = `${minutes}m ${seconds.toString().padStart(2, "0")}s`;

  const [respMap, setRespMap] = useState<Record<number, { ua?: string | null; ok?: boolean | null }>>({});

  useEffect(() => {
    (async () => {
      if (!activeSession?.session_id) return;
      const rows = (await fetchResponses(activeSession.session_id)) as RespRow[] | null;
      if (!rows) return;

      const map: Record<number, { ua?: string | null; ok?: boolean | null }> = {};
      for (const r of rows) {
        const keyRaw = r.question ?? r.session_question_id ?? r.question_id;
        const key = keyRaw != null ? Number(keyRaw) : NaN;
        if (!Number.isFinite(key)) continue;

        const ua = r.user_answer ?? r.response?.user_answer ?? null;
        const ok =
          typeof r.is_correct === "boolean"
            ? r.is_correct
            : typeof r.response?.is_correct === "boolean"
            ? r.response.is_correct
            : null;

        map[key] = { ua, ok };
      }
      setRespMap(map);
    })();
  }, [activeSession?.session_id, fetchResponses]);

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
      const questionId = q.id;

      const fetched = respMap[sq.id] || {};
      const userAnswerRaw = fetched.ua ?? sq.user_answer ?? sq.response?.user_answer ?? null;

      const serverCorrect =
        typeof fetched.ok === "boolean"
          ? fetched.ok
          : typeof sq.is_correct === "boolean"
          ? sq.is_correct
          : typeof sq.response?.is_correct === "boolean"
          ? sq.response.is_correct
          : typeof sq.correct === "boolean"
          ? sq.correct
          : undefined;

      const computedCorrect = !isCoding ? normalize(userAnswerRaw) === normalize(correctAnswer) : undefined;
      const isCorrect = serverCorrect ?? (typeof computedCorrect === "boolean" ? computedCorrect : false);

      return {
        id: sq.id,
        questionId,
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
  const percent = total > 0 ? (correctCount / total) * 100 : 0;

  // --- feedback effects (audio + confetti) ---
  // Updated sound refs: lose & win replacements
  const loseRef = useRef<HTMLAudioElement>(null);
  const winRef = useRef<HTMLAudioElement>(null);
  const [celebrated, setCelebrated] = useState(false);
  const [sounded, setSounded] = useState(false);

  useEffect(() => {
    if (total === 0) return;

    if (percent >= 70) {
      if (celebrated) return;
      setCelebrated(true);

      // Play success sound
      try {
        if (winRef.current) {
          winRef.current.currentTime = 0;
          winRef.current.play().catch(() => {});
        }
      } catch {}

      // Fire confetti once
      (async () => {
        const confetti = (await import("canvas-confetti")).default;
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          scalar: 1,
        });
      })();
    } else {
      if (sounded) return;
      setSounded(true);

      // Play womp-womp
      try {
        if (loseRef.current) {
          loseRef.current.currentTime = 0;
          loseRef.current.play().catch(() => {});
        }
      } catch {}
    }
  }, [percent, total, celebrated, sounded]);


  const handleClose = () => {
    refresh();
    onClose();
    const storedUser = localStorage.getItem("user");
    const userId = storedUser ? JSON.parse(storedUser).id : "";
    navigate(`/${userId}/home`);
  };

  const hintsDisplay =
    activeSession && (activeSession as any).hints_used != null ? String((activeSession as any).hints_used) : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D2D2D]/40">
      {/* audio elements */}
  <audio ref={loseRef} preload="auto" src="/sounds/lose.wav" />
  <audio ref={winRef} preload="auto" src="/sounds/win.wav" />

      <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-xl relative border border-gray-200">
        <div>
          <div className="flex items-center gap-3 bg-[#F6F1FF] rounded-t-xl px-6 py-5">
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-[#704EE7] leading-none">Game Results</span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-2 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#704EE7]/10">
                <TiStarOutline className="h-5 w-5 text-[#704EE7]" />
              </div>
              <div className="leading-tight">
                <div className="text-[12px] text-gray-500">Score</div>
                <div className="text-lg font-semibold">
                  {correctCount} / {total}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#704EE7]/10">
                <FaRegClock className="h-4 w-4 text-[#704EE7]" />
              </div>
              <div className="leading-tight">
                <div className="text-[12px] text-gray-500">Time Taken</div>
                <div className="text-lg font-semibold">{timeStr}</div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#704EE7]/10">
                <HiOutlineLightningBolt className="h-4.5 w-4.5 text-[#704EE7]" />
              </div>
              <div className="leading-tight">
                <div className="text-[12px] text-gray-500">Hints Used</div>
                <div className="text-lg font-semibold">{hintsDisplay}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-2">
          <div className="max-h-[55vh] overflow-auto space-y-3">
            {items.map((it, idx) => (
              <QuestionResultCard
                key={it.id ?? idx}
                questionNumber={idx + 1}
                questionText={it.qText}
                userAnswer={it.userAnswer}
                correctAnswer={it.correctAnswer}
                explanation={it.explanation}
                isCorrect={it.isCorrect}
                isCoding={it.isCoding}
                questionId={it.questionId}
              />
            ))}
            {total === 0 && <div className="text-sm text-gray-600">No questions found for this session.</div>}
          </div>
        </div>

        <div className="p-6 pt-2 flex items-center justify-end">
          <Component.PrimaryButton label="Return Home" onClick={handleClose} py="py-2" fontSize="text-md" />
        </div>
      </div>
    </div>
  );
};

export default ResultsModal;

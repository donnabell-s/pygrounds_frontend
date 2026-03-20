import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../../../context/GameContext";
import { useAdaptive } from "../../../context/AdaptiveContext";
import * as Component from "../../components";
import { FaRegClock } from "react-icons/fa6";
import { HiOutlineLightningBolt } from "react-icons/hi";
import { TiStarOutline } from "react-icons/ti";
import { FiFlag } from "react-icons/fi";
import gameApi from "../../../api/gameApi";

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

type FlagReason = "incorrect" | "different" | "unclear" | "bug" | "other";

type FlagDraft = {
  reason: FlagReason | "";
  note: string;
};

type FlaggingItem = {
  id: number;
  question: string;
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
  const [flaggingItem, setFlaggingItem] = useState<FlaggingItem | null>(null);
  const [flagDraft, setFlagDraft] = useState<FlagDraft>({ reason: "", note: "" });
  const [flagged, setFlagged] = useState<Record<number, FlagDraft>>({});
  const [flagSubmitting, setFlagSubmitting] = useState(false);
  const [flagError, setFlagError] = useState("");
  const [flagSuccess, setFlagSuccess] = useState(false);

  const flagReasons: { value: FlagReason; label: string }[] = [
    { value: "incorrect", label: "Incorrect answer" },
    { value: "different", label: "Different valid answer" },
    { value: "unclear", label: "Unclear or ambiguous" },
    { value: "bug", label: "Bug in tests" },
    { value: "other", label: "Other" },
  ];

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

      // Extract the actual GeneratedQuestion ID from session question
      // Multi-question games (CrossWord, WordSearch) might have different structure
      let questionId = sq.id;
      
      // Try multiple possible fields
      if ((sq as any).question_id) {
        questionId = (sq as any).question_id;
      } else if ((q as any).id) {
        questionId = (q as any).id;
      } else if ((sq as any).generated_question_id) {
        questionId = (sq as any).generated_question_id;
      }
      
      // Debug log for multi-question games
      if ((activeSession?.session_questions?.length ?? 0) > 1) {
        console.debug("Multi-question game - SessionQ:", { sq, extractedId: questionId });
      }

      return {
        id: questionId,
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

  const handleStartFlag = (itemId: number, question: string) => {
    const existing = flagged[itemId];
    setFlagDraft({ reason: existing?.reason ?? "", note: existing?.note ?? "" });
    setFlaggingItem({ id: itemId, question });
  };

  const handleCancelFlag = () => {
    setFlagDraft({ reason: "", note: "" });
    setFlaggingItem(null);
  };

  const handleSubmitFlag = async (itemId: number) => {
    if (!flagDraft.reason) return;
    
    setFlagSubmitting(true);
    setFlagError("");
    setFlagSuccess(false);

    const result = await gameApi.flagQuestion(itemId, flagDraft.reason, flagDraft.note);
    
    if (result) {
      setFlagged((prev) => ({ ...prev, [itemId]: { reason: flagDraft.reason, note: flagDraft.note } }));
      setFlagSuccess(true);
      
      // Clear form and close modal after 1.5 seconds
      setTimeout(() => {
        setFlagDraft({ reason: "", note: "" });
        setFlaggingItem(null);
        setFlagSuccess(false);
      }, 1500);
    } else {
      setFlagError("Failed to submit flag. Please try again.");
    }
    
    setFlagSubmitting(false);
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
              <div
                key={it.id ?? idx}
                className={`rounded-lg border p-3 shadow-sm ${
                  it.isCorrect ? "border-[#42BFAC]/80 bg-[#42BFAC]/10" : "border-[#FD4E66]/80 bg-[#FD4E66]/10"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm">
                    <div className="font-semibold">
                      {idx + 1}. {it.qText}
                    </div>
                    <div className="mt-1 space-y-0.5">
                      <div className="text-[13px]">
                        <span className="font-medium text-gray-700">Your answer:</span>{" "}
                        <span className="font-mono break-words">{it.userAnswer}</span>
                      </div>
                      {!it.isCoding && (
                        <div className="text-[13px]">
                          <span className="font-medium text-gray-700">Correct answer:</span>{" "}
                          <span className="font-mono break-words">{it.correctAnswer || "—"}</span>
                        </div>
                      )}
                      {it.isCoding && (
                        <div className="text-[13px]">
                          <span className="font-medium text-gray-700">Explanation:</span>{" "}
                          <span className="break-words">
                            {it.explanation?.trim() ? it.explanation : "No explanation yet."}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                        it.isCorrect ? "bg-[#42BFAC] text-white" : "bg-[#FD4E66] text-white"
                      }`}
                    >
                      {it.isCorrect ? "Correct" : "Wrong"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStartFlag(it.id, it.qText)}
                      disabled={Boolean(flagged[it.id])}
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold transition ${
                        flagged[it.id]
                          ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                          : "border-[#704EE7]/40 bg-white text-[#704EE7] hover:bg-[#704EE7]/10"
                      }`}
                    >
                      <FiFlag className="h-3.5 w-3.5" />
                      {flagged[it.id] ? "Flagged" : "Flag"}
                    </button>
                  </div>
                </div>
                {flagged[it.id] && flaggingItem?.id !== it.id && (
                  <div className="mt-2 text-xs text-gray-700">
                    Flagged for: {flagReasons.find((r) => r.value === flagged[it.id].reason)?.label || "Other"}
                  </div>
                )}
              </div>
            ))}
            {total === 0 && <div className="text-sm text-gray-600">No questions found for this session.</div>}
          </div>
        </div>

        <div className="p-6 pt-2 flex items-center justify-end">
          <Component.PrimaryButton label="Return Home" onClick={handleClose} py="py-2" fontSize="text-md" />
        </div>
      </div>

      {flaggingItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Flag Question</h3>
              <button
                type="button"
                onClick={handleCancelFlag}
                disabled={flagSubmitting}
                className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Close
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600">Select a reason and add any helpful notes.</p>

            <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              {flaggingItem.question || "Question text not available."}
            </div>

            {flagSuccess && (
              <div className="mt-3 rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">
                ✓ Flag submitted successfully!
              </div>
            )}

            {flagError && (
              <div className="mt-3 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {flagError}
              </div>
            )}

            <div className="mt-4">
              <div className="text-xs font-semibold text-gray-700">Reason</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {flagReasons.map((reason) => (
                  <label
                    key={reason.value}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition ${
                      flagDraft.reason === reason.value
                        ? "border-[#704EE7] bg-[#704EE7]/10 text-[#704EE7]"
                        : "border-gray-200 bg-white text-gray-700 hover:border-[#704EE7]/60"
                    } ${flagSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <input
                      type="radio"
                      name="flag-reason"
                      value={reason.value}
                      checked={flagDraft.reason === reason.value}
                      onChange={() => setFlagDraft((prev) => ({ ...prev, reason: reason.value }))}
                      disabled={flagSubmitting}
                      className="sr-only"
                    />
                    {reason.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold text-gray-700">Notes (optional)</label>
              <textarea
                value={flagDraft.note}
                onChange={(e) => setFlagDraft((prev) => ({ ...prev, note: e.target.value }))}
                rows={3}
                disabled={flagSubmitting}
                className="mt-1 w-full rounded-md border border-gray-200 px-2 py-1 text-xs focus:border-[#704EE7] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Add a quick note for admins"
              />
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelFlag}
                disabled={flagSubmitting}
                className="rounded-md border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSubmitFlag(flaggingItem.id)}
                disabled={!flagDraft.reason || flagSubmitting || flagSuccess}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                  !flagDraft.reason || flagSubmitting || flagSuccess
                    ? "cursor-not-allowed bg-gray-200 text-gray-400"
                    : "bg-[#704EE7] text-white hover:bg-[#5a3fd0]"
                }`}
              >
                {flagSubmitting ? "Submitting..." : flagSuccess ? "Submitted!" : "Submit Flag"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsModal;

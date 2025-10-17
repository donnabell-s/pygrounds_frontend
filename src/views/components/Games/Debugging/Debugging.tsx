import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useAuth } from "../../../../context/AuthContext";
import { useGame } from "../../../../context/GameContext";
import * as Component from "../../../components";

const MAX_LIVES = 3;

const clampLives = (n: unknown) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return MAX_LIVES;
  return Math.max(0, Math.min(MAX_LIVES, num));
};

const normalizeInitialLives = (raw: unknown) => {
  const n = Number(raw);
  return n > 0 ? clampLives(n) : MAX_LIVES;
};

const Debugging: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeSession, startDebuggingGame, submitDebuggingCode, fetchGameSession, clearActiveSession, resetGameEnd } = useGame();

  const [lives, setLives] = useState<number | null>(null);
  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let session = activeSession;
      if (!session || session.game_type !== "debugging") {
        session = await startDebuggingGame();
      } else {
        session = (await fetchGameSession(session.session_id)) || session;
      }

      if (session) {
        setLives(normalizeInitialLives(session.remaining_lives));
        const broken = session.session_questions?.[0]?.question?.game_data?.buggy_code;
        setCode(broken || "");
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!activeSession || submitted) return;

    const startMs = new Date(activeSession.start_time).getTime();
    const endMs = startMs + activeSession.time_limit * 1000;
    const delay = Math.max(0, endMs - Date.now());

    const timer = setTimeout(async () => {
      if (!submitted) {
        const result = await submitDebuggingCode(activeSession.session_id, code);
        if (result) {
          setLives(clampLives(result.remaining_lives));
          setSubmitted(true);
          setOutput(result.success ? "⏰ Time's up, but your last submission passed all tests!" : `⏰ Time's up. Game over.\n${result.message}`);
          if (result.traceback) setOutput((prev) => prev + `\n\nTraceback:\n${result.traceback}`);
        } else {
          setOutput("⏰ Time's up. Game over.");
          setSubmitted(true);
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [activeSession, submitted, code, submitDebuggingCode]);

  const question = activeSession?.session_questions?.[0]?.question;
  const gameData = question?.game_data;
  
  const prompt = gameData?.buggy_question_text ?? "";
  const sampleInput = gameData?.sample_input ?? "";
  const sampleOutput = gameData?.sample_output ?? "";

  const handleSubmit = async () => {
    if (!activeSession || submitted) return;
    const result = await submitDebuggingCode(activeSession.session_id, code);
    if (!result) return;

    setLives(clampLives(result.remaining_lives));
    setSubmitted(result.success || result.game_over);
    setOutput(
      result.success
        ? `✅ Fixed! All tests passed.\nLives left: ${clampLives(result.remaining_lives)}`
        : `❌ ${result.message}\nLives left: ${clampLives(result.remaining_lives)}`,
    );
    if (result.traceback) setOutput((prev) => prev + `\n\nTraceback:\n${result.traceback}`);
  };

  const handleClose = () => {
    clearActiveSession();
    resetGameEnd();
    navigate(`/${user?.id}/home`);
  };

  if (loading || !activeSession) return <div className="p-6">Loading...</div>;

  const safeLives = lives ?? MAX_LIVES;
  const lost = Math.max(0, MAX_LIVES - safeLives);

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <div className="flex gap-4 mb-4">
        {Array.from({ length: MAX_LIVES }).map((_, idx) => {
          const isLost = idx < lost;
          return (
            <div
              key={idx}
              className={
                "w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-lg " +
                (isLost ? "bg-red-700 border-red-400" : "bg-gray-200 border-gray-400")
              }
            >
              {isLost && <span className="text-white font-bold">✕</span>}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center relative w-full max-w-6xl h-[300px]">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/4 h-[300px] bg-gray-800 text-white p-4 rounded-md transform -skew-y-6 shadow-lg overflow-auto">
          <p className="font-bold mb-2">Prompt & I/O</p>
          <p className="text-sm mb-2">{prompt}</p>
          <div className="text-xs">
            <p className="font-semibold">Sample Input:</p>
            <pre className="bg-black/30 p-1 mt-1">{sampleInput}</pre>
            <p className="font-semibold mt-2">Expected Output:</p>
            <pre className="bg-black/30 p-1 mt-1">{sampleOutput}</pre>
          </div>
        </div>

        <div className="w-1/2 h-full flex flex-col bg-gray-900 border-4 border-gray-700 rounded-lg overflow-hidden shadow-xl z-10">
          <Editor height="100%" language="python" value={code} onChange={(val) => setCode(val || "")} theme="vs-dark" />
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/4 h-[300px] bg-gray-800 text-green-300 p-4 rounded-md transform skew-y-6 shadow-lg overflow-auto">
          <p className="font-bold mb-2">Execution Output</p>
          <pre className="text-xs whitespace-pre-wrap">{output || "..."}</pre>
        </div>
      </div>

      {!submitted && <Component.PrimaryButton label="Submit Answers" onClick={handleSubmit} py="py-2" fontSize="text-md" m="mt-8" />}

      {submitted && (
        <div>
          <Component.ResultsModal onClose={handleClose} />
        </div>
      )}
    </div>
  );
};

export default Debugging;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useAuth } from "../../../../context/AuthContext";
import { useGame } from "../../../../context/GameContext";
import * as Component from "../../../components";

const Debugging: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    activeSession,
    startDebuggingGame,
    submitDebuggingCode,
    fetchGameSession,
    clearActiveSession,
    resetGameEnd,
  } = useGame();

  const [lives, setLives] = useState<number>(3);
  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load session
  useEffect(() => {
    (async () => {
      let session = activeSession;
      if (!session || session.game_type !== "debugging") {
        session = await startDebuggingGame();
      } else {
        session = (await fetchGameSession(session.session_id)) || session;
      }
      if (session) {
        setLives(session.remaining_lives);
        const broken = session.session_questions[0].question.game_data?.buggy_code;
        setCode(broken || "");
      }
      setLoading(false);
    })();
  }, []);

  // 3️⃣ Auto-submit on timeout
useEffect(() => {
  if (!activeSession || submitted) return;

  const startMs = new Date(activeSession.start_time).getTime();
  const endMs = startMs + activeSession.time_limit * 1000;
  const delay = Math.max(0, endMs - Date.now());

  const timer = setTimeout(async () => {
    // Auto-submit current code
    if (!submitted) {
      const result = await submitDebuggingCode(activeSession.session_id, code);
      if (result) {
        setLives(result.remaining_lives);
        setSubmitted(true);
        setOutput(
          result.success
            ? `⏰ Time's up, but your last submission passed all tests!`
            : `⏰ Time's up. Game over.\n${result.message}`
        );
        if (result.traceback) {
          setOutput(prev => prev + `\n\nTraceback:\n${result.traceback}`);
        }
      } else {
        setOutput("⏰ Time's up. Game over.");
        setSubmitted(true);
      }
    }
  }, delay);

  return () => clearTimeout(timer);
}, [activeSession, submitted, code]);


  const question = activeSession?.session_questions?.[0]?.question;
  const prompt = question?.question_text ?? "";
  const sampleInput = question?.game_data?.sample_input ?? "";
  const sampleOutput = question?.game_data?.sample_output ?? "";


  const handleSubmit = async () => {
    if (!activeSession || submitted) return;
    const result = await submitDebuggingCode(activeSession.session_id, code);
    if (!result) return;

    setLives(result.remaining_lives);
    setSubmitted(result.success || result.game_over);
    setOutput(
      result.success
        ? `✅ Fixed! All tests passed.\nLives left: ${result.remaining_lives}`
        : `❌ ${result.message}\nLives left: ${result.remaining_lives}`
    );
    if (result.traceback) {
      setOutput((prev) => prev + `\n\nTraceback:\n${result.traceback}`);
    }
  };

  const handleClose = () => {
    clearActiveSession();
    resetGameEnd();
    navigate(`/${user?.id}/home`);
  };

  if (loading || !activeSession) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      
      {/* Lives HUD */}
      <div className="flex gap-4 mb-4">
        {Array.from({ length: 3 }).map((_, idx) => {
          const lost = 3 - lives;
          const isLost = idx < lost;
          return (
            <div
              key={idx}
              className={
                `w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-lg ` +
                (isLost
                  ? "bg-red-700 border-red-400"
                  : "bg-gray-200 border-gray-400")
              }
            >
              {isLost && <span className="text-white font-bold">✕</span>}
            </div>
          );
        })}
      </div>

{/* Cockpit Panels */}
<div className="flex items-center justify-center relative w-full max-w-6xl h-[300px]">

  {/* Left Console */}
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

  {/* Main Code Editor */}
  <div className="w-1/2 h-full flex flex-col bg-gray-900 border-4 border-gray-700 rounded-lg overflow-hidden shadow-xl z-10">
    <Editor
      height="100%"
      language="python"
      value={code}
      onChange={(val) => setCode(val || "")}
      theme="vs-dark"
    />
  </div>

  {/* Right Console */}
  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/4 h-[300px] bg-gray-800 text-green-300 p-4 rounded-md transform skew-y-6 shadow-lg overflow-auto">
    <p className="font-bold mb-2">Execution Output</p>
    <pre className="text-xs whitespace-pre-wrap">{output || "..."}</pre>
  </div>
</div>


      {/* Central Button */}
      {!submitted && (
        <button
          className="mt-8 bg-[#0077B6] hover:brightness-125 text-white px-6 py-3 rounded-md shadow-lg border-b-4 border-[#004d75] active:translate-y-[2px]"
          onClick={handleSubmit}
        >
          Submit Fix
        </button>
      )}

      {submitted && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-[rgba(0,0,0,0.6)]">
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-md p-6">
            <Component.ResultsModal onClose={handleClose} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Debugging;

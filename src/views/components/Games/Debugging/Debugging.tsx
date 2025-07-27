// src/pages/user/game/Debugging.tsx

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

  // 1️⃣ On mount: ensure session exists, then fetch full session
  useEffect(() => {
    (async () => {
      let session = activeSession;
      if (!session || session.game_type !== "debugging") {
        session = await startDebuggingGame();
      } else {
        session = await fetchGameSession(session.session_id) || session;
      }
      if (session) {
        setLives(session.remaining_lives);
        // Prefill editor with broken_code
        const broken = session.session_questions[0].question.broken_code;
        setCode(broken || "");
      }
      setLoading(false);
    })();
  }, []);

  // Extract fields from the question
  const question = activeSession?.session_questions?.[0]?.question;
  const prompt      = question?.text          ?? "";
  const sampleInput = question?.sample_input  ?? "";
  const sampleOutput= question?.sample_output ?? "";

  // 2️⃣ Submit fix
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
      setOutput(prev => prev + `\n\nTraceback:\n${result.traceback}`);
    }
  };

  // 3️⃣ Timeout auto-submit
  useEffect(() => {
    if (!activeSession || submitted) return;
    const startMs = new Date(activeSession.start_time).getTime();
    const endMs   = startMs + activeSession.time_limit * 1000;
    const delay   = Math.max(0, endMs - Date.now());
    const timer   = setTimeout(() => {
      setOutput("⏰ Time's up. Game over.");
      setSubmitted(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [activeSession, submitted]);

  // 4️⃣ Close handler
  const handleClose = () => {
    clearActiveSession();
    resetGameEnd();
    navigate(`/${user?.id}/home`);
  };

  if (loading || !activeSession) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="flex flex-row p-6 gap-6 max-w-4xl mx-auto">
      {/* Lives indicator */}
      <div className="flex flex-col items-center">
        {Array.from({ length: 3 }).map((_, idx) => {
          const lost   = 3 - lives;
          const isLost = idx < lost;
          return (
            <div
              key={idx}
              className={
                `w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 ` +
                (isLost
                  ? "bg-red-100 border-red-500"
                  : "bg-[#ECECEF] border-[#6B7280]")
              }
            >
              {isLost && <span className="text-red-500 font-bold">✕</span>}
            </div>
          );
        })}
      </div>

      {/* Main panel */}
      <div className="flex flex-col flex-1 gap-6">
        {/* Prompt & I/O */}
        <div className="bg-white p-5 rounded-md shadow-md text-sm">
          <p className="mb-4 text-lg">
            <strong>Prompt:</strong> {prompt}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#E6F2F8] p-3 rounded-md">
              <p className="font-semibold">Sample Input:</p>
              <code className="block bg-white p-1 mt-1">{sampleInput}</code>
            </div>
            <div className="bg-[#E6F2F8] p-3 rounded-md">
              <p className="font-semibold">Expected Output:</p>
              <code className="block bg-white p-1 mt-1">{sampleOutput}</code>
            </div>
          </div>
          <p className="mt-4 font-semibold">Fix the code below:</p>
        </div>

        {/* Execution output */}
        {output && (
          <pre className="bg-gray-100 text-sm p-4 rounded whitespace-pre-wrap border">
            {output}
          </pre>
        )}

        {/* Code editor */}
        <Editor
          height="300px"
          language="python"
          value={code}
          onChange={val => setCode(val || "")}
          theme="vs-dark"
        />

        {/* Submit button */}
        {!submitted && (
          <button
            className="bg-[#0077B6] hover:brightness-110 text-white px-4 py-2 rounded-md self-start"
            onClick={handleSubmit}
          >
            Submit Fix
          </button>
        )}
      </div>

      {/* Results modal */}
      {submitted && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-[rgba(45,45,45,0.4)]">
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-md p-6">
            <Component.ResultsModal onClose={handleClose} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Debugging;

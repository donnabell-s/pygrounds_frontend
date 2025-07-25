// src/pages/user/game/Hangman.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useAuth } from "../../../../context/AuthContext";
import { useGame } from "../../../../context/GameContext";
import * as Component from "../../../components";
import { RxCross1 } from "react-icons/rx";

const Hangman: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    activeSession,
    fetchGameSession,       // new
    startHangmanGame,
    submitHangmanCode,
    clearActiveSession,
    resetGameEnd,
  } = useGame();

  const [lives, setLives] = useState<number>(3);
  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1️⃣ On mount: ensure a session exists, then fetch full session
  useEffect(() => {
    (async () => {
      if (!activeSession || activeSession.game_type !== "hangman") {
        await startHangmanGame();
      }
      // Now pull the full session (with remaining_lives)
      const session = await fetchGameSession(activeSession!.session_id);
      if (session?.remaining_lives !== undefined) {
        setLives(session.remaining_lives);
      }
      setLoading(false);
    })();
  }, []);

  // Extract question
  const question = activeSession?.session_questions?.[0]?.question;
  const prompt = question?.text ?? "";
  const sampleInput = question?.sample_input ?? "";
  const sampleOutput = question?.sample_output ?? "";

  // 2️⃣ Submit code
  const handleSubmit = async () => {
    if (!activeSession || submitted) return;
    const result = await submitHangmanCode(activeSession.session_id, code);
    if (!result) return;

    setLives(result.remaining_lives);
    setSubmitted(result.success || result.game_over);
    setOutput(
      result.success
        ? `✅ Correct! All test cases passed.\nLives left: ${result.remaining_lives}`
        : `❌ ${result.message}\nLives left: ${result.remaining_lives}`
    );
    if (result.traceback) {
      setOutput(prev => prev + `\n\nTraceback:\n${result.traceback}`);
    }
  };

  // 3️⃣ Auto-submit on timeout
  useEffect(() => {
    if (!activeSession || submitted) return;
    const startMs = new Date(activeSession.start_time).getTime();
    const endMs = startMs + activeSession.time_limit * 1000;
    const delay = Math.max(0, endMs - Date.now());
    const timer = setTimeout(() => {
      setOutput("⏰ Time's up. Game over.");
      setSubmitted(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [activeSession, submitted]);

  // 4️⃣ Close handler clears session
  const handleClose = () => {
    clearActiveSession();
    resetGameEnd();
    navigate(`/${user?.id}/home`);
  };

  if (loading || !activeSession) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="flex flex-row my-6 gap-6  mx-auto">
      {/* Lives indicator */}
      <div className="flex flex-col items-center">
        <div className="flex flex-row items-center w-full gap-2.5">
          {Array.from({ length: 3 }).map((_, idx) => {
            const lost = 3 - lives;
            const isLost = idx < lost;
            return (
              <div
                key={idx}
                className={
                  `w-15 h-15 rounded-full flex items-center justify-center border-2 mb-2 ` +
                  (isLost
                    ? "bg-red-100 border-red-500"
                    : "bg-[#ECECEF] border-[#6B7280]")
                }
              >
                {isLost && <span className="text-red-500 font-bold"><RxCross1 size={30}/></span>}
              </div>
            );
          })}
        </div>
      </div>
      {/* Main content */}
      <div className="flex flex-col flex-1 gap-6 max-w-4xl">
        <div className="bg-white p-5 rounded-md shadow-md text-sm">
          <p className="mb-4 text-lg">
            <strong>Prompt:</strong> {prompt}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#E6F2F8] p-3 rounded-md">
              <p className="font-semibold">Sample Input:</p>
              <code className="block bg-white mt-2 max-w-max">{sampleInput}</code>
            </div>
            <div className="bg-[#E6F2F8] p-3 rounded-md">
              <p className="font-semibold">Expected Output:</p>
              <code className="block bg-white mt-2 max-w-max">{sampleOutput}</code>
            </div>
          </div>
        </div>

        {output && (
          <pre className="bg-gray-100 text-sm p-4 rounded whitespace-pre-wrap border">
            {output}
          </pre>
        )}

        <Editor
          height="250px"
          language="python"
          value={code}
          onChange={val => setCode(val || "")}
          theme="vs-dark"
          defaultValue="# Write your function here"
        />

        {!submitted && (
          <button
            className="bg-[#0077B6] hover:brightness-110 text-white px-4 py-2 rounded-md self-start w-full"
            onClick={handleSubmit}
          >
            Submit Code
          </button>
        )}
      </div>

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

export default Hangman;

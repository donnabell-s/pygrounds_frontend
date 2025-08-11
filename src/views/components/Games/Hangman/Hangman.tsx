import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useAuth } from "../../../../context/AuthContext";
import { useGame } from "../../../../context/GameContext";
import * as Component from "../../../components";
import { RxCross1 } from "react-icons/rx";
import snakeImg from "../../../../assets/images/snake.png";

const Hangman: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeSession, fetchGameSession, startHangmanGame, submitHangmanCode, clearActiveSession, resetGameEnd } = useGame();

  const [lives, setLives] = useState<number>(3);
  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!activeSession || activeSession.game_type !== "hangman") {
        await startHangmanGame();
      }
      const session = await fetchGameSession(activeSession!.session_id);
      if (session?.remaining_lives !== undefined) setLives(session.remaining_lives);
      setLoading(false);
    })();
  }, []);

  const question = activeSession?.session_questions?.[0]?.question;
  const prompt = question?.question_text ?? "";
  const sampleInput = question?.game_data?.sample_input ?? "";
  const sampleOutput = question?.game_data?.sample_output ?? "";
  const functionName = question?.game_data?.function_name ?? "";

  const handleSubmit = async () => {
    if (!activeSession || submitted) return;
    const result = await submitHangmanCode(activeSession.session_id, code);
    if (!result) return;

    setLives(result.remaining_lives);
    setSubmitted(result.success || result.game_over);
    setOutput(
      result.success
        ? `✅ Correct! All test cases passed.\nLives left: ${result.remaining_lives}`
        : `❌ ${result.message}\nLives left: ${result.remaining_lives}`,
    );
    if (result.traceback) setOutput((prev) => prev + `\n\nTraceback:\n${result.traceback}`);
  };

  useEffect(() => {
    if (question?.game_data?.function_name) {
      const fnName = question.game_data.function_name;

      let params = "";
      const buggy = question.game_data.buggy_code || "";
      const match = buggy.match(/def\s+\w+\s*\(([^)]*)\)/);
      if (match) params = match[1].trim();

      setCode(`def ${fnName}(${params}):\n    # Write your code here`);
    }
  }, [activeSession]);

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

  const handleClose = () => {
    clearActiveSession();
    resetGameEnd();
    navigate(`/${user?.id}/home`);
  };

  if (loading || !activeSession) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex flex-row my-6 gap-6  mx-auto">
      <div className="flex flex-col items-center justify-between">
        <div className="w-full flex justify-center">
          <img className="h-90 w-90" src={snakeImg} />
        </div>

        <div className="flex flex-row items-center justify-center gap-2.5">
          {Array.from({ length: 3 }).map((_, idx) => {
            const lost = 3 - lives;
            const isLost = idx < lost;
            return (
              <div
                key={idx}
                className={`w-15 h-15 rounded-full flex items-center justify-center border-2 ${isLost ? "bg-red-100 border-red-500" : "bg-[#ECECEF] border-[#6B7280]"}`}
              >
                {isLost && (
                  <span className="text-red-500 font-bold">
                    <RxCross1 size={30} />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col flex-1 gap-6 max-w-4xl">
        <div className="bg-white p-5 rounded-md shadow-md text-sm">
          <p className="mb-4 text-lg">
            <strong>Prompt:</strong> {prompt}
            {functionName && (
              <span className="ml-2 text-[#704EE7]">
                (Function: <code>{functionName}</code>)
              </span>
            )}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#704EE7]/10 p-3 rounded-md">
              <p className="font-semibold">Sample Input:</p>
              <code className="block bg-white mt-2 max-w-max">{sampleInput}</code>
            </div>
            <div className="bg-[#704EE7]/10 p-3 rounded-md">
              <p className="font-semibold">Expected Output:</p>
              <code className="block bg-white mt-2 max-w-max">{sampleOutput}</code>
            </div>
          </div>
        </div>

        {output && <pre className="bg-gray-100 text-sm p-4 rounded whitespace-pre-wrap border">{output}</pre>}

        <Editor height="250px" language="python" value={code} onChange={(val) => setCode(val || "")} theme="vs-dark" defaultValue="# Write your function here" />

        {!submitted && <Component.PrimaryButton label="Submit Answers" onClick={handleSubmit} py="py-2" fontSize="text-md" />}
      </div>

      {submitted && (
        <div>
          <Component.ResultsModal onClose={handleClose} />
        </div>
      )}
    </div>
  );
};

export default Hangman;

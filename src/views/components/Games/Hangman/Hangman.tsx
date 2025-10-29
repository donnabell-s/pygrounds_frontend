import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useAuth } from "../../../../context/AuthContext";
import { useGame } from "../../../../context/GameContext";
import * as Component from "../../../components";
import { RxCross1 } from "react-icons/rx";
import hangmanStatic from "../../../../assets/images/hangman_static.png";

const Hangman: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeSession, fetchGameSession, startHangmanGame, submitHangmanCode, clearActiveSession, resetGameEnd } = useGame();

  const [lives, setLives] = useState<number>(3);
  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"code" | "output">("code");

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

  // when new output arrives (e.g., after submit), show output tab by default
  useEffect(() => {
    if (output) setView("output");
  }, [output]);

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
    <div className="flex justify-center my-6">
      {/* Game container: fixed size with static background */}
      <div
        className="relative w-[1080px] h-[665px] rounded-lg overflow-hidden shadow-lg"
        style={{
          backgroundImage: `url(${hangmanStatic})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay content (left lives + right editor) */}
        <div className="absolute inset-0 flex flex-row gap-6 p-6">
          {/* Left overlay for lives and future animations (lives shown at top) */}
          <div className="w-1/3 flex flex-col items-center justify-start">
            <div className="flex flex-row items-center justify-center gap-3 mt-4">
              {Array.from({ length: 3 }).map((_, idx) => {
                const lost = 3 - lives;
                const isLost = idx < lost;
                return (
                  <div
                    key={idx}
                    className={`w-16 h-16 rounded-sm flex items-center justify-center border-5 ${isLost ? "bg-red-100 border-red-500" : "bg-[#ECECEF] border-[#6B7280]"}`}
                  >
                    {isLost && (
                      <span className="text-red-600 font-bold">
                        <RxCross1 size={60} style={{ strokeWidth: 1 }} />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="w-full h-44" />
          </div>

          {/* Right overlay: content area */}
          <div className="flex flex-col flex-1 gap-6 max-w-4xl">
            <div className="bg-white p-5 rounded-md shadow-md text-sm">
              <p className="mb-4 text-lg">
                <strong>Prompt:</strong> {prompt}
                {functionName && (
                  <span className="ml-2 text-[#16A34A]">
                    (Function: <code>{functionName}</code>)
                  </span>
                )}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#16A34A]/10 p-3 rounded-md">
                  <p className="font-semibold">Sample Input:</p>
                  <code className="block bg-white mt-2 max-w-max">{sampleInput}</code>
                </div>
                <div className="bg-[#16A34A]/10 p-3 rounded-md">
                  <p className="font-semibold">Expected Output:</p>
                  <code className="block bg-white mt-2 max-w-max">{sampleOutput}</code>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className={`px-3 py-1 rounded cursor-pointer ${view === "code" ? "bg-[#16A34A] text-white border border-2 border-[#16A34A]/30 border-[#16A34A] shadow-sm" : "bg-white border border-2 border-[#16A34A]/30"}`}
                onClick={() => setView("code")}
              >
                Code
              </button>
              <button
                className={`px-3 py-1 rounded cursor-pointer ${view === "output" ? "bg-[#16A34A] text-white border border-2 border-[#16A34A]/30 border-[#16A34A] shadow-sm" : "bg-white border border-2 border-[#16A34A]/30"}`}
                onClick={() => setView("output")}
              >
                Output
              </button>
            </div>

            {/* Editor / Output container: fixed height so output doesn't stretch the page */}
            <div className="w-full h-[250px]">
              {view === "output" ? (
                <pre className="h-full overflow-auto bg-white border border-3 border-[#16A34A]/30 text-sm p-4 rounded whitespace-pre-wrap">{output || "No output yet."}</pre>
              ) : (
                <Editor height="100%" language="python" value={code} onChange={(val) => setCode(val || "")} theme="vs-dark" defaultValue="# Write your function here" />
              )}
            </div>

            {!submitted && (
              <button
              onClick={handleSubmit}
              className="px-5 py-2.5 bg-[#16A34A] hover:bg-[#12803b] rounded-md text-white text-lg font-semibold shadow-lg cursor-pointer"
              >
              Submit Answers
              </button>
            )}
          </div>
        </div>
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

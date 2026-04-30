import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useAuth } from "../../../../context/AuthContext";
import { useGame } from "../../../../context/GameContext";
import * as Component from "../../../components";
import { RxCross1 } from "react-icons/rx";
import hangmanHappyStaticMp4 from "../../../../assets/images/hangman_animation/hangman_happy_static.mp4";
import hangmanSadMp4 from "../../../../assets/images/hangman_animation/hangman_sad.mp4";
import hangmanHappyMp4 from "../../../../assets/images/hangman_animation/hangman_happy.mp4";
import hangmanLoseMp4 from "../../../../assets/images/hangman_animation/hangman_lose.mp4";
import hangmanLoseStaticMp4 from "../../../../assets/images/hangman_animation/hangman_lose_static.mp4";
import hangmanStaticBg from "../../../../assets/images/hangman_animation/hangman_static_bg.png";
import hangmanStaticBgLost from "../../../../assets/images/hangman_animation/hangman_static_bg_lost.png";

const VIDEO_CONFIGS = [
  { src: hangmanHappyStaticMp4, loop: true },
  { src: hangmanSadMp4, loop: false },
  { src: hangmanHappyMp4, loop: false },
  { src: hangmanLoseMp4, loop: false },
  { src: hangmanLoseStaticMp4, loop: true },
] as const;

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

  const sequenceRef = React.useRef<Array<{ src: string }>>([]);
  const timeoutRef = React.useRef<number | null>(null);
  const prevLivesRef = React.useRef<number | null>(null);
  const loseLifeRef = useRef<HTMLAudioElement>(null);

  // All video elements are mounted at once; we switch by opacity + direct play()
  const activeVideoSrcRef = useRef<string>(hangmanHappyStaticMp4);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const switchToVideo = (src: string) => {
    const prev = videoRefs.current.get(activeVideoSrcRef.current);
    if (prev) prev.style.opacity = "0";

    activeVideoSrcRef.current = src;
    const next = videoRefs.current.get(src);
    if (next) {
      next.style.opacity = "1";
      next.currentTime = 0;
      next.play().catch(() => {});
    }
  };

  const resetSequence = () => {
    sequenceRef.current = [];
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const playNextInSequence = () => {
    const next = sequenceRef.current.shift();
    if (!next) return;
    switchToVideo(next.src);
  };

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
      const firstLine = (question.correct_answer ?? "").split("\n")[0];
      const answerMatch = firstLine.match(/def\s+\w+\s*\(([^)]*)\)/);
      if (answerMatch) params = answerMatch[1].trim();

      setCode(`def ${fnName}(${params}):\n    # Write your code here`);
    }
  }, [activeSession]);

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

  useEffect(() => {
    if (prevLivesRef.current === null) {
      prevLivesRef.current = lives;
      switchToVideo(hangmanHappyStaticMp4);
      return;
    }

    const prevLives = prevLivesRef.current;
    if (lives === prevLives) return;

    if (lives < prevLives) {
      if (lives > 0) {
        try {
          if (loseLifeRef.current) {
            loseLifeRef.current.currentTime = 0;
            loseLifeRef.current.play().catch(() => {});
          }
        } catch {}
      }

      resetSequence();
      if (lives <= 0) {
        sequenceRef.current = [
          { src: hangmanSadMp4 },
          { src: hangmanLoseMp4 },
          { src: hangmanLoseStaticMp4 },
        ];
      } else {
        sequenceRef.current = [
          { src: hangmanSadMp4 },
          { src: hangmanHappyMp4 },
          { src: hangmanHappyStaticMp4 },
        ];
      }
      playNextInSequence();
    }

    prevLivesRef.current = lives;
  }, [lives]);

  const handleClose = () => {
    clearActiveSession();
    resetGameEnd();
    navigate(`/${user?.id}/home`);
  };

  if (loading || !activeSession) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex justify-center my-6">
      <audio ref={loseLifeRef} preload="auto" src="/sounds/loselife.wav" />
      <div className="relative w-[1080px] h-[665px] rounded-lg overflow-hidden shadow-lg">
        {/* All videos pre-mounted; only the active one is visible (opacity 1) */}
        <div className="absolute inset-0">
          <img
            src={hangmanStaticBg}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: lives <= 0 ? 0 : 1, transition: "opacity 0.15s ease" }}
          />
          <img
            src={hangmanStaticBgLost}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: lives <= 0 ? 1 : 0, transition: "opacity 0.15s ease" }}
          />
          {VIDEO_CONFIGS.map(({ src, loop }) => (
            <video
              key={src}
              ref={(el) => {
                if (el) videoRefs.current.set(src, el);
                else videoRefs.current.delete(src);
              }}
              src={src}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                opacity: src === hangmanHappyStaticMp4 ? 1 : 0,
                transition: "opacity 0.15s ease",
              }}
              muted
              playsInline
              loop={loop}
              onEnded={() => {
                if (activeVideoSrcRef.current === src) playNextInSequence();
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 flex flex-row gap-6 p-6">
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

          <div className="flex flex-col flex-1 min-w-0 gap-6 max-w-4xl">
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

            <div className="w-full min-w-0 h-[250px]">
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

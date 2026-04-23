import React, { useEffect, useRef, useState } from "react";
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
  const prevLivesRef = useRef<number | null>(null);
  const loseLifeRef = useRef<HTMLAudioElement>(null);

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
        const gameData = session.session_questions?.[0]?.question?.game_data;
        const fnName = gameData?.function_name || "function_name";
        const fallbackCode = `def ${fnName}():\n    # write code here\n    pass`;
        const broken = gameData?.buggy_code || gameData?.code_shown_to_student || fallbackCode;
        setCode(broken);
      }
      setLoading(false);
    })();
  }, []);

  // useEffect(() => {
  //   if (!activeSession || submitted) return;

  //   const startMs = new Date(activeSession.start_time).getTime();
  //   const endMs = startMs + activeSession.time_limit * 1000;
  //   const delay = Math.max(0, endMs - Date.now());

  //   const timer = setTimeout(async () => {
  //     if (!submitted) {
  //       const result = await submitDebuggingCode(activeSession.session_id, code);
  //       if (result) {
  //         setLives(clampLives(result.remaining_lives));
  //         setSubmitted(true);
  //         setOutput(result.success ? "⏰ Time's up, but your last submission passed all tests!" : `⏰ Time's up. Game over.\n${result.message}`);
  //         if (result.traceback) setOutput((prev) => prev + `\n\nTraceback:\n${result.traceback}`);
  //       } else {
  //         setOutput("⏰ Time's up. Game over.");
  //         setSubmitted(true);
  //       }
  //     }
  //   }, delay);

  //   return () => clearTimeout(timer);
  // }, [activeSession, submitted, code, submitDebuggingCode]);

  const question = activeSession?.session_questions?.[0]?.question;
  const gameData = question?.game_data;
  
  const prompt = gameData?.buggy_question_text ?? "";
  const sampleInput = gameData?.sample_input ?? "";
  const sampleOutput = gameData?.sample_output ?? "";

  const handleSubmit = async () => {
    if (!activeSession || submitted) return;
    const result = await submitDebuggingCode(activeSession.session_id, code);
    if (!result) return;
    setLives(result.remaining_lives);
    setSubmitted(result.success || result.game_over);
    setOutput(
      result.success
        ? `✅ Fixed! All tests passed.\nLives left: ${result.remaining_lives}`
        : `❌ ${result.message}\nLives left: ${result.remaining_lives}`,
    );
    if (result.traceback) setOutput((prev) => prev + `\n\nTraceback:\n${result.traceback}`);
  };

  // Track lives across renders for life-loss detection outside submissions (e.g., timeouts)
  useEffect(() => {
    if (lives === null) return;
    if (prevLivesRef.current === null) {
      prevLivesRef.current = lives;
      return;
    }
    if (lives < prevLivesRef.current && lives > 0) {
      try {
        if (loseLifeRef.current) {
          loseLifeRef.current.currentTime = 0;
          loseLifeRef.current.play().catch(() => {});
        }
      } catch {}
    }
    prevLivesRef.current = lives;
  }, [lives]);

  const handleClose = () => {
    clearActiveSession();
    resetGameEnd();
    navigate(`/${user?.id}/home`);
  };

  if (loading || !activeSession) return <div className="p-6">Loading...</div>;

  const safeLives = lives ?? MAX_LIVES;
  const lost = Math.max(0, MAX_LIVES - safeLives);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-b from-purple-950 via-[#2a0027] to-black">
      {/* audio: life lost */}
      <audio ref={loseLifeRef} preload="auto" src="/sounds/loselife.wav" />

      <svg
        viewBox="0 0 1920 1080"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
        style={{ zIndex: 0 }}
      >
        <defs>
          <linearGradient id="cockpitTint" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8000ff" />
            <stop offset="55%" stopColor="#690362" />
            <stop offset="100%" stopColor="#330947" />
          </linearGradient>
        </defs>
        {/* Gradient background */}
        <rect x={0} y={0} width={1920} height={1080} fill="url(#cockpitTint)" opacity={0.4} pointerEvents="none" />

        {/* Star sprites with animation */}
        <image href="/images/star_sprites/TB.webp" x={230} y={160} width={32} height={32} className="animate-twinkle1" style={{ imageRendering: 'pixelated' }} />
        <image href="/images/star_sprites/SB.webp" x={480} y={135} width={32} height={32} className="animate-twinkle2" style={{ imageRendering: 'pixelated' }} />
        <image href="/images/star_sprites/SD.webp" x={760} y={210} width={32} height={32} className="animate-twinkle1" style={{ imageRendering: 'pixelated' }} />
        <image href="/images/star_sprites/SM.webp" x={1050} y={135} width={32} height={32} className="animate-twinkle2" style={{ imageRendering: 'pixelated' }} />
        <image href="/images/star_sprites/BB.webp" x={1340} y={135} width={32} height={32} className="animate-twinkle1" style={{ imageRendering: 'pixelated' }} />
        <image href="/images/star_sprites/TYB.webp" x={1630} y={135} width={32} height={32} className="animate-twinkle2" style={{ imageRendering: 'pixelated' }} />
        <image href="/images/star_sprites/TB.webp" x={290} y={135} width={32} height={32} className="animate-twinkle1" style={{ imageRendering: 'pixelated' }} />
        <image href="/images/star_sprites/SB.webp" x={860} y={135} width={32} height={32} className="animate-twinkle2" style={{ imageRendering: 'pixelated' }} />
        <image href="/images/star_sprites/SD.webp" x={1240} y={810} width={32} height={32} className="animate-twinkle1" style={{ imageRendering: 'pixelated' }} />
        <image href="/images/star_sprites/SM.webp" x={1530} y={220} width={32} height={32} className="animate-twinkle2" style={{ imageRendering: 'pixelated' }} />
        <image href="/images/star_sprites/BB.webp" x={580} y={135} width={32} height={32} className="animate-twinkle1" style={{ imageRendering: 'pixelated' }} />
        <image href="/images/star_sprites/TYB.webp" x={960} y={120} width={32} height={32} className="animate-twinkle2" style={{ imageRendering: 'pixelated' }} />

        {/* Cockpit overlay — screen blend: black holes become transparent, frame stays */}
        <image
          href="/images/cockpit_FINAL.webp"
          x={0}
          y={0}
          width={1920}
          height={1080}
          preserveAspectRatio="none"
          style={{ imageRendering: 'crisp-edges', pointerEvents: 'none', mixBlendMode: 'color' }}
        />

        {/* Lives display */}
        <foreignObject x={835} y={420} width={250} height={60} className="pointer-events-auto">
          <div className="flex gap-4 justify-center">
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
        </foreignObject>

        {/* Embed HTML screens inside SVG */}
        <foreignObject x={234} y={630} width={1452} height={300} className="pointer-events-none" style={{ overflow: 'visible' }}>
          <div className="relative flex h-full w-full items-end justify-center" style={{ overflow: 'visible' }}>
            {/* Left screen: Prompt & I/O */}
            <div
              className="absolute bottom-0 text-gray-100 p-4 rounded-md shadow-lg overflow-auto pointer-events-auto"
              style={{
                width: '31%',
                height: '160%',
                left: '-9.8%',
                top: '-92%',
                transform: 'skewY(13deg) skewX(2deg)',
                backgroundColor: '#1e1e1e'
              }}
            >
              <p className="font-bold mb-2 text-base">Prompt &amp; I/O</p>
              <p className="text-base mb-2">{prompt}</p>
              <div className="text-sm">
                <p className="font-semibold">Sample Input:</p>
                <pre className="p-1 mt-1" style={{ backgroundColor: '#2d2d2d' }}>{sampleInput}</pre>
                <p className="font-semibold mt-2">Expected Output:</p>
                <pre className="p-1 mt-1" style={{ backgroundColor: '#2d2d2d' }}>{sampleOutput}</pre>
              </div>
            </div>

            {/* Center screen: Code Editor */}
            <div className="absolute flex flex-col bg-gray-900 rounded-lg overflow-hidden shadow-xl z-10 pointer-events-auto" style={{ width: '48%', height: '138%', left: '26%', top: '-54%' }}>
              <Editor height="100%" language="python" value={code} onChange={(val) => setCode(val || "")} theme="vs-dark" options={{ fontSize: 16 }} />
            </div>

            {/* Right screen: Execution Output */}
            <div
              className="absolute bottom-0 text-gray-100 p-4 rounded-md shadow-lg overflow-auto pointer-events-auto"
              style={{
                width: '31%',
                height: '160%',
                right: '-9%',
                top: '-92%',
                transform: 'skewY(-13deg) skewX(-2deg)',
                backgroundColor: '#1e1e1e'
              }}
            >
              <p className="font-bold mb-2 text-base">Execution Output</p>
              <pre className="text-sm whitespace-pre-wrap text-green-400">{output || "..."}</pre>
            </div>
          </div>
        </foreignObject>

        {/* Submit button */}
        {!submitted && (
          <foreignObject x={760} y={940} width={400} height={100} className="pointer-events-auto">
            <div className="flex justify-center items-start" style={{ transform: 'perspective(140px) rotateX(25deg)', transformStyle: 'preserve-3d' }}>
              <button
                onClick={handleSubmit}
                className="relative px-20 py-6 text-lg font-bold text-white bg-gradient-to-b from-purple-500 to-purple-600 rounded-lg shadow-xl cursor-pointer"
                style={{
                  transformStyle: 'preserve-3d',
                  boxShadow: '0 8px 0 0 #6b21a8, 0 8px 20px rgba(0,0,0,0.5)'
                }}
              >
                Submit Answers
              </button>
            </div>
          </foreignObject>
        )}
      </svg>

      {/* Results modal */}
      {submitted && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <Component.ResultsModal onClose={handleClose} />
        </div>
      )}
    </div>
  );
};

export default Debugging;

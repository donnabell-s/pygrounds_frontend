import { useState, useEffect } from "react";

const ProgressBar = () => {
  const currentXP = 200;
  const maxXP = 500;
  const targetPercent = (currentXP / maxXP) * 100;

  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressPercent(targetPercent);
    }, 100);
    return () => clearTimeout(timer);
  }, [targetPercent]);

  return (
    <div className="w-full bg-[#E4ECF7] flex flex-col rounded-lg p-4 sm:p-6 shadow-md gap-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#147C8A] rounded-full h-10 w-10 sm:h-11 sm:w-11 shrink-0" />
          <div className="min-w-0">
            <p className="font-bold text-lg sm:text-2xl leading-tight">Level 1: Python Basics</p>
            <p className="text-sm sm:text-md text-wrap">Master the fundamentals of Python programming</p>
          </div>
        </div>
        <div className="bg-[#C5DCE7] rounded-full px-3 py-1 sm:py-1.5 text-center w-fit self-start sm:self-auto">
          <p className="text-sm sm:text-md font-semibold text-[#147C8A]">Beginner Zone</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold">Overall Progress</p>
          <p className="text-sm font-bold text-[#3776AB]">
            {currentXP}/{maxXP} XP
          </p>
        </div>
        <div className="w-full h-3.5 bg-white rounded-full overflow-hidden">
          <div
            className="h-full bg-[#3776AB] transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[#6B7280] gap-1 sm:gap-0">
          <p className="text-xs">3 achievements unlocked</p>
          <p className="text-xs">85% Topic Mastery</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;

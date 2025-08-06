import { useEffect, useState } from "react";
import { useAdaptive } from "../../../context/AdaptiveContext";
import { FaCode, FaKeyboard, FaLaptopCode, FaServer } from "react-icons/fa";

// 🎯 Level configuration with individual XP thresholds
const LEVELS = [
  { maxXP: 100, label: "Beginner", color: "#3776AB", iconBg: "bg-[#3776AB]", badgeBg: "bg-[#3776AB]/10", icon: <FaCode size={18} className="text-white" /> },
  { maxXP: 150, label: "Intermediate", color: "#EAB308", iconBg: "bg-[#EAB308]", badgeBg: "bg-[#EAB308]/10", icon: <FaKeyboard size={18} className="text-white" /> },
  { maxXP: 150, label: "Advanced", color: "#22C55E", iconBg: "bg-[#22C55E]", badgeBg: "bg-[#22C55E]/10", icon: <FaLaptopCode size={18} className="text-white" /> },
  { maxXP: 100, label: "Master", color: "#A855F7", iconBg: "bg-[#A855F7]", badgeBg: "bg-[#A855F7]/10", icon: <FaServer size={18} className="text-white" /> },
] as const;

const ANIMATION_DELAY = 100;

const LoadingSkeleton = () => (
  <div className="w-full bg-[#704EE7]/10 flex flex-col rounded-xl p-4 sm:p-6 shadow-md gap-4">
    <p className="text-sm text-gray-500">Loading zone progress...</p>
  </div>
);

const ProgressBar = () => {
  const { zoneProgress, isLoading } = useAdaptive();
  const zone = zoneProgress?.[0] || null;

  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    if (!zone) return;
    const timer = setTimeout(() => setProgressPercent(zone.completion_percent), ANIMATION_DELAY);
    return () => clearTimeout(timer);
  }, [zone]);

  if (isLoading || !zone) return <LoadingSkeleton />;

  const levelIndex = Math.min(zone.zone.order - 1, LEVELS.length - 1);
  const level = LEVELS[levelIndex];

  // 🎯 Compute currentXP and maxXP dynamically
  const maxXP = level.maxXP;
  const currentXP = Math.round((zone.completion_percent / 100) * maxXP);

  return (
    <div className="w-full bg-[#704EE7]/10 flex flex-col rounded-xl p-4 sm:p-6 shadow-md gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        {/* Icon + Info */}
        <div className="flex items-center gap-3">
          <div className={`rounded-full h-10 w-10 sm:h-11 sm:w-11 shrink-0 flex items-center justify-center ${level.iconBg}`}>
            {level.icon}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-lg sm:text-2xl leading-tight">
              Level {zone.zone.order}: {zone.zone.name}
            </p>
            <p className="text-sm sm:text-md text-wrap">{zone.zone.description}</p>
          </div>
        </div>

        {/* Level Badge */}
        <div className={`rounded-full px-3 py-1 sm:py-1.5 text-center w-fit self-start sm:self-auto ${level.badgeBg}`}>
          <p className="text-sm sm:text-md font-semibold" style={{ color: level.color }}>
            {level.label}
          </p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold">Overall Progress</p>
          <p className="text-sm font-bold text-[#7E5CE3]">
            {currentXP}/{maxXP} XP
          </p>
        </div>

        <div className="w-full h-3.5 bg-white rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%`, backgroundColor: level.color }}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[#6B7280] gap-1 sm:gap-0">
          <p className="text-xs">3 achievements unlocked</p>
          <p className="text-xs">{zone.completion_percent.toFixed(0)}% Topic Mastery</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;

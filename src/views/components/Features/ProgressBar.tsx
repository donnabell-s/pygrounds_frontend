import { useEffect, useState } from "react";
import { useAdaptive } from "../../../context/AdaptiveContext";
import { FaCode, FaKeyboard, FaLaptopCode, FaServer } from "react-icons/fa";
import { LEVELS } from "../../../types/game"; // ← thresholds only\
import { TiStarburst } from "react-icons/ti";

// UI-only map per level (keeps original styling)
const LEVEL_UI = {
  Beginner:     { color: "#3776AB", iconBg: "text-[#3776AB]",  badgeBg: "bg-[#3776AB]/15",  icon: <FaCode size={18} className="text-white" /> },
  Intermediate: { color: "#EAB308", iconBg: "text-[#EAB308]",  badgeBg: "bg-[#EAB308]/15",  icon: <FaKeyboard size={18} className="text-white" /> },
  Advanced:     { color: "#22C55E", iconBg: "text-[#22C55E]",  badgeBg: "bg-[#22C55E]/15",  icon: <FaLaptopCode size={18} className="text-white" /> },
  Master:       { color: "#A855F7", iconBg: "text-[#A855F7]",  badgeBg: "bg-[#A855F7]/15",  icon: <FaServer size={18} className="text-white" /> },
} as const;

const ANIMATION_DELAY = 100;

const LoadingSkeleton = () => (
  <div className="w-full bg-[#704EE7]/10 flex flex-col rounded-xl p-4 sm:p-6 shadow-md gap-4">
    <p className="text-sm text-gray-500">Loading zone progress...</p>
  </div>
);

type ProgressBarProps = {
  user?: any; // optional user object (selected user)
};

const ProgressBar = ({ user }: ProgressBarProps) => {
  const { zoneProgress, isLoading } = useAdaptive();
  // If a user is passed (viewing other user's profile), use their zone_progresses
  const zone = user?.zone_progresses?.length ? user.zone_progresses[0] : zoneProgress?.[0] || null;

  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    if (!zone) return;
    const timer = setTimeout(() => setProgressPercent(zone.completion_percent), ANIMATION_DELAY);
    return () => clearTimeout(timer);
  }, [zone]);

  if (isLoading || !zone) return <LoadingSkeleton />;

  // Use centralized thresholds to pick the label by index
  const levelIndex = Math.min(zone.zone.order - 1, LEVELS.length - 1);
  const tier = LEVELS[levelIndex];
  const ui = LEVEL_UI[tier.label as keyof typeof LEVEL_UI];

  // Keep original XP calculation
  const maxXP = tier.maxXP;
  const currentXP = Math.round((zone.completion_percent / 100) * maxXP);

return (
  <div
    className={`group relative overflow-hidden bg-[#704EE7]/15 rounded-2xl p-6 border border-white/40 ring-1 ring-[#704EE7]/40 shadow-md w-full`}
  >
    {/* overlay under content */}
    <div className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent" />

    <div className="relative z-10 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        {/* Icon + Info */}
        <div className="flex items-center gap-1">
          <div className="relative flex items-center justify-center h-[59px] w-[59px] shrink-0">
            <TiStarburst className={`absolute inset-0 w-full h-full ${ui.iconBg}`} />
            <div className="relative flex items-center justify-center text-white text-lg">
              {ui.icon}
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-lg sm:text-2xl leading-tight">
              Level {zone.zone.order}: {zone.zone.name}
            </p>
            <p className="text-sm sm:text-md text-wrap">{zone.zone.description}</p>
          </div>
        </div>

        {/* Level Badge */}
        <div className={`rounded-full px-3 py-1 sm:py-1.5 text-center w-fit self-start sm:self-auto ${ui.badgeBg}`}>
          <p className="text-sm sm:text-md font-semibold" style={{ color: ui.color }}>
            {tier.label}
          </p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold">Overall Progress</p>
          <p className="text-sm font-bold text-[#7054D0]">
            {currentXP}/{maxXP} XP
          </p>
        </div>

        <div className="w-full h-3.5 bg-white rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%`, backgroundColor: "#7054D0" }}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[#6B7280] gap-1 sm:gap-0">
          <p className="text-xs">3 achievements unlocked</p>
          <p className="text-xs">{zone.completion_percent.toFixed(0)}% Topic Mastery</p>
        </div>
      </div>
    </div>
  </div>
);


};

export default ProgressBar;

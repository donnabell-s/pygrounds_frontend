import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useAdaptive } from "../../../context/AdaptiveContext";
import { getAchievements } from "../../../services/achievementService";
import * as Interfaces from "../../../interfaces";
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
  <div className="w-full bg-[#ffffff] rounded-2xl p-6 shadow-md">
    <div className="flex items-center justify-center py-8">
      <p className="text-lg md:text-xl font-semibold text-gray-600">Loading zone progress...</p>
    </div>
  </div>
);

type ProgressBarProps = {
  user?: any; // optional user object (selected user)
};

const ProgressBar = ({ user }: ProgressBarProps) => {
  const { isLoading: authLoading, sessionExpired } = useAuth();
  // If session expired, let parent show unified fallback instead of this component's messages
  if (sessionExpired && !authLoading) return null;
  const { zoneProgress, isLoading } = useAdaptive();
  const [achievements, setAchievements] = useState<Interfaces.Achievement[]>([]);
  // If a user is passed (viewing other user's profile), use their zone_progresses
  const zone = user?.zone_progresses?.length ? user.zone_progresses[0] : zoneProgress?.[0] || null;

  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    if (!zone) return;
    const timer = setTimeout(() => setProgressPercent(zone.completion_percent), ANIMATION_DELAY);
    return () => clearTimeout(timer);
  }, [zone]);

  // Refresh achievements for this user (or current user if no user prop)
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const data = await getAchievements(user?.id || undefined);
        setAchievements(data);
      } catch (error) {
        console.error("Failed to fetch achievements", error);
      }
    };
    fetchAchievements();
  }, [user?.id]);

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
          <p className="text-xs">{achievements ? `${achievements.filter(a => a.isUnlocked).length} achievement${achievements.filter(a => a.isUnlocked).length === 1 ? '' : 's'} unlocked` : 'Loading achievements...'}</p>
          <p className="text-xs">{zone.completion_percent.toFixed(0)}% Topic Mastery</p>
        </div>
      </div>
    </div>
  </div>
);


};

export default ProgressBar;

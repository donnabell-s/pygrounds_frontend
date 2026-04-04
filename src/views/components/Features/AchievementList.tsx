import * as Interfaces from "../../../interfaces";
import { FaLock } from "react-icons/fa";
import { PiMedalFill } from "react-icons/pi";

// ✅ Centralized style function
const getAchievementStyle = (isUnlocked: boolean) => {
  const mainColor = isUnlocked ? "#181818" : "#374151";
  return {
    bg: isUnlocked ? "bg-[#EAB308]/20" : "bg-[#6B7280]/15",
    border: isUnlocked ? "border-[#EAB308]/25" : "border-[#6B7280]/22",
    progress: isUnlocked ? "bg-[#EAB308]" : "bg-[#6B7280]/50",
    text: `text-[${mainColor}]`,
    mainColor,
  };
};

// ✅ Reusable AchievementCard
const AchievementCard = ({ achievement }: { achievement: Interfaces.Achievement }) => {
  const { name, description, progress, isUnlocked } = achievement;
  const progressPercent = Math.min((progress.current / progress.target) * 100, 100);
  const progressText = `${progress.current}/${progress.target}`;

  const style = getAchievementStyle(isUnlocked);

  return (
<div className={`relative overflow-hidden flex items-start gap-4 px-4 py-5 rounded-xl shadow-sm ${style.bg} border ${style.border}`}>
  {/* Overlay */}
  <div className="pointer-events-none absolute inset-0 z-0 rounded-xl bg-gradient-to-br from-white/30 to-transparent" />

  {/* Content */}
  <div className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm shrink-0">
    {isUnlocked ? (
      <PiMedalFill size={25} className="text-[#EAB308]" />
    ) : (
      <FaLock size={16} className="text-gray-400" />
    )}
  </div>

  <div className="relative z-10 flex flex-col w-full gap-2">
    <div>
      <h4 className={`text-md font-bold ${style.text}`}>{name}</h4>
      <p className="text-sm text-[#6B7280]">{description}</p>
    </div>
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-xs mt-1">
        <span className="font-bold text-[#6B7280]">Progress</span>
        <span className={`font-bold ${style.text}`}>{progressText}</span>
      </div>
      <div className="w-full h-3 bg-white rounded-full overflow-hidden">
        <div
          className={`h-full ${style.progress} transition-all duration-500`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  </div>
</div>

  );
};

import { useEffect, useState } from "react";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa";
import { getAchievements } from "../../../services/achievementService";
import { useAdaptive } from "../../../context/AdaptiveContext";
import PageEmpty from "../UI/PageEmpty";
import { useAuth } from "../../../context/AuthContext";

type Props = {
  userId?: number | null;
};

const AchievementList = ({ userId }: Props) => {
  const [achievements, setAchievements] = useState<Interfaces.Achievement[]>([]);
  const { lastUpdated } = useAdaptive();
  const { isLoading: authLoading } = useAuth();
  const { sessionExpired } = useAuth();
  if (sessionExpired && !authLoading) return null;
  const [pageStart, setPageStart] = useState(0); // index of first achievement on current page

  const fetchAchievements = async (id?: number) => {
    try {
      const data = await getAchievements(id);
      setAchievements(data);
    } catch (error) {
      console.error("Failed to fetch achievements", error);
    }
  };

  useEffect(() => {
    fetchAchievements(userId || undefined);
    setPageStart(0);
  }, [userId]);

  // Keep achievements in sync when adaptive data refreshes (so progressbar and achievements match)
  useEffect(() => {
    if (!lastUpdated) return;
    // re-fetch achievements when adaptive context updates
    fetchAchievements(userId || undefined);
  }, [lastUpdated, userId]);

  const sortedAchievements = [...achievements].sort((a, b) => {
    if (a.isUnlocked !== b.isUnlocked) {
      return Number(b.isUnlocked) - Number(a.isUnlocked);
    }
    const aPercent = a.progress.current / a.progress.target;
    const bPercent = b.progress.current / b.progress.target;
    return bPercent - aPercent;
  });

return (
  <div className="relative overflow-hidden bg-[#FFFFFF] w-full rounded-2xl shadow-md border border-white/40 ring-1 ring-[#704EE7]/20">
    {/* Overlay */}
    <div className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent" />

    {/* Header (use ProficiencyList header styling) */}
    <div className="relative z-10 flex flex-col px-6 py-3.5 bg-[#704EE7]/15 gap-1 shadow-sm rounded-t-2xl">
      <h3 className="text-xl font-semibold">Achievements</h3>
      <p className="text-sm text-[#6B7280]">Earn badges as you progress through zones and games</p>
    </div>

    {/* Cards (same spacing as ProficiencyList, no pagination/footer) */}
    <div className="relative z-10 p-6 flex flex-col gap-4">
      {sortedAchievements.length === 0 ? (
        <PageEmpty title="No achievements available" subtitle="This user has not earned any achievements yet." />
      ) : (
        // show slice based on pageStart
        sortedAchievements.slice(pageStart, pageStart + 4).map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))
      )}
    </div>

    {/* Footer: prev/next navigation (wraps around) */}
    {sortedAchievements.length > 4 && (
      <div className="relative z-10 px-6 py-3.5 bg-white border-t border-[#E4ECF7] rounded-b-2xl flex items-center justify-between">
        <div className="text-xs text-[#6B7280]">
          {(() => {
            const total = sortedAchievements.length;
            const start = Math.min(pageStart + 1, total);
            const end = Math.min(pageStart + 4, total);
            return `${start}${end} of ${total}`.replace('\u0003','–');
          })()}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const total = sortedAchievements.length;
              const newStart = pageStart - 4 < 0 ? Math.max(0, Math.floor((total - 1) / 4) * 4) : pageStart - 4;
              setPageStart(newStart);
            }}
            className="text-sm transition cursor-pointer"
            aria-label="Previous achievements"
          >
            <FaAngleLeft size={18} />
          </button>

          <button
            onClick={() => {
              const total = sortedAchievements.length;
              const newStart = pageStart + 4 >= total ? 0 : pageStart + 4;
              setPageStart(newStart);
            }}
            className="text-sm transition cursor-pointer"
            aria-label="Next achievements"
          >
            <FaAngleRight size={18} />
          </button>
        </div>
      </div>
    )}
  </div>
);

};

export default AchievementList;

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

const AchievementList = () => {
  const sortedAchievements = [...Interfaces.achievements].sort((a, b) => {
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

    {/* Header */}
    <h3 className="relative z-10 text-xl font-semibold px-6 py-3.5 bg-[#704EE7]/15 shadow-sm rounded-t-2xl">
      Achievements
    </h3>

    {/* Cards */}
    <div className="relative z-10 p-4.5 flex flex-col gap-4">
      {sortedAchievements.map((achievement) => (
        <AchievementCard key={achievement.id} achievement={achievement} />
      ))}
    </div>
  </div>
);

};

export default AchievementList;

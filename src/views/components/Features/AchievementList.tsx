import * as Interfaces from "../../../interfaces";
import { FaLock } from "react-icons/fa";
import { PiMedalFill } from "react-icons/pi";

const AchievementCard = ({ achievement }: { achievement: Interfaces.Achievement }) => {
  const { name, description, progress, isUnlocked } = achievement;
  const progressText = `${progress.current}/${progress.target}`;
  const progressPercent = Math.min((progress.current / progress.target) * 100, 100);

  // Style adjustments based on unlock state
  const bgColor = isUnlocked ? "bg-[#FDF4E8]" : "bg-[#F3F4F6]";
  const borderColor = isUnlocked ? "border-[#F7D7AA]" : "border-[#E4ECF7]";
  const progressColor = isUnlocked ? "bg-[#E59116]" : "bg-gray-300";
  const textColor = isUnlocked ? "text-[#111827]" : "text-gray-500";
  const subTextColor = isUnlocked ? "text-[#4B5563]" : "text-gray-400";
  const progressTextColor = isUnlocked ? "text-[#E59116]" : "text-gray-400";

  return (
    <div className={`flex items-start gap-4 px-4 py-5 rounded-lg shadow-sm ${bgColor} border ${borderColor}`}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm shrink-0">
        {isUnlocked ? (
          <PiMedalFill size={25} className="text-[#E59116]" />
        ) : (
          <FaLock size={16} className="text-gray-400" />
        )}
      </div>

      <div className="flex flex-col w-full gap-2">
        <div>
          <h4 className={`text-md font-bold ${textColor}`}>{name}</h4>
          <p className={`text-sm ${subTextColor}`}>{description}</p>
        </div>
        <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs text-[#6B7280] mt-1">
                <span className={`font-bold ${subTextColor}`}>Progress</span>
                <span className={`font-bold ${progressTextColor}`}>{progressText}</span>
            </div>
            <div className="w-full h-3 bg-white rounded-full overflow-hidden">
                <div
                className={`h-full ${progressColor} transition-all duration-500`}
                style={{ width: `${progressPercent}%` }}
                ></div>
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
    <div className="bg-[#FFFFFF] w-full rounded-lg shadow-md">
      <h3 className="text-xl font-semibold px-6 py-3.5 bg-[#F1F5FA] shadow-sm">Achievements</h3>
      <div className="p-4.5 flex flex-col gap-4">
        {sortedAchievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
};



export default AchievementList;

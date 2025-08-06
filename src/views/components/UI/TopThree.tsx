// TopThree.tsx
import { FaCrown } from "react-icons/fa";
import "./Leaderboard.css";

interface TopUserProps {
  user: {
    name: string;
    username: string;
    totalXP: number;
    level: string;
  };
  rank: number; // 0 = 1st, 1 = 2nd, 2 = 3rd
}

// Local level colors
const LEVEL_COLORS: Record<
  string,
  { color: string; bg: string }
> = {
  Beginner: { color: "#3776AB", bg: "#3776AB20" },       // blue
  Intermediate: { color: "#EAB308", bg: "#EAB30820" },  // yellow
  Advanced: { color: "#22C55E", bg: "#22C55E20" },      // green
  Master: { color: "#A855F7", bg: "#A855F720" },        // purple
};

const TopThree: React.FC<TopUserProps> = ({ user, rank }) => {
  const podiumStyles = [
    {
      className: "pulse-gold scale-110",
      border: "border-yellow-400",
      badgeBg: "bg-yellow-400 text-white",
    },
    {
      className: "pulse-silver scale-100",
      border: "border-blue-400",
      badgeBg: "bg-blue-400 text-white",
    },
    {
      className: "pulse-bronze scale-95",
      border: "border-pink-500",
      badgeBg: "bg-pink-500 text-white",
    },
  ];

  const { className, border, badgeBg } = podiumStyles[rank];
  const rankNumber = rank + 1;

  // Dynamic level color
  const levelStyle = LEVEL_COLORS[user.level] || {
    color: "#704EE7",
    bg: "#704EE720",
  };

  return (
    <div
      className={`${className} flex flex-col items-center gap-3 rounded-2xl w-40 lg:w-48 p-5 
                  bg-white/80 backdrop-blur-sm border border-[#704EE7]/25 shadow-md hover:shadow-lg transition`}
    >
      {/* Avatar + Crown + Rank Badge */}
      <div className="relative flex items-center justify-center">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center 
                     bg-[#704EE7] text-white font-bold text-2xl shadow-md border-4 ${border}`}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        {rank === 0 && (
          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-yellow-400 drop-shadow-md scale-x-125 scale-y-85">
            <FaCrown size={25} />
          </div>
        )}

        <div
          className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 
                     w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${badgeBg} shadow`}
        >
          {rankNumber}
        </div>
      </div>

      {/* Name + Username */}
      <div className="flex flex-col items-center text-center gap-0.5 mt-3">
        <div className="text-lg font-semibold">{user?.name}</div>
        <div className="text-sm font-medium text-gray-500">@{user?.username}</div>
      </div>

      {/* XP + Dynamic Level */}
      <div className="flex flex-col items-center gap-1 mt-1">
        <span
          className="px-4 py-1 rounded-full text-xs font-semibold text-center"
          style={{
            color: levelStyle.color,
            backgroundColor: levelStyle.bg,
          }}
        >
          {user?.level}
        </span>
        <span className="text-gray-600 font-semibold text-sm">{user?.totalXP} XP</span>
      </div>
    </div>
  );
};

export default TopThree;

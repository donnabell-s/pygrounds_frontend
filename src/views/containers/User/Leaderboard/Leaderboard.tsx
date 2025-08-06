import * as Interfaces from "../../../../interfaces";
import * as Components from "../../../components";
import "./Leaderboard.css";

// Local level colors for dynamic badges
const LEVEL_COLORS: Record<
  string,
  { color: string; bg: string }
> = {
  Beginner: { color: "#3776AB", bg: "#3776AB20" },       // blue
  Intermediate: { color: "#EAB308", bg: "#EAB30820" },  // yellow
  Advanced: { color: "#22C55E", bg: "#22C55E20" },      // green
  Master: { color: "#A855F7", bg: "#A855F720" },        // purple
};

const Leaderboard = () => {
  const sortedUsers = [...Interfaces.users].sort((a, b) => b.totalXP - a.totalXP);
  const topThree = sortedUsers.slice(0, 3);
  const others = sortedUsers.slice(3);

  return (
    <div className="flex flex-col gap-10 py-8">
      {/* Top 3 Podium */}
      <div className="flex flex-row justify-center items-end gap-8 mt-2">
        <Components.TopThree user={topThree[1]} rank={1} />
        <Components.TopThree user={topThree[0]} rank={0} />
        <Components.TopThree user={topThree[2]} rank={2} />
      </div>

      {/* Other Users */}
      <div className="flex flex-col gap-4 text-sm">
        {others.map((user, index) => {
          const levelStyle = LEVEL_COLORS[user.level] || {
            color: "#704EE7",
            bg: "#704EE720",
          };

          return (
            <div
              key={user.id}
              className="flex items-center justify-between bg-white/80 backdrop-blur-sm border border-[#704EE7]/25 hover:border-[#704EE7]/35 
                        p-5 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 group"
            >
              {/* Left Side: Rank + Avatar + Name */}
              <div className="flex items-center gap-4">
                {/* Rank Number */}
                <span className="text-[#3776AB] font-bold text-xl w-10 text-center">
                  #{index + 4}
                </span>

                {/* Avatar */}
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#704EE7] text-white 
                                font-bold text-lg shadow-md group-hover:shadow-[#704EE7]/40 transition">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                {/* Name and Username */}
                <div className="flex flex-col">
                  <span className="font-semibold text-lg">{user.name}</span>
                  <span className="text-gray-500 text-sm">@{user.username}</span>
                </div>
              </div>

              {/* Right Side: Dynamic Level + XP */}
              <div className="flex flex-col items-end w-28 gap-1.5">
                <span
                  className="px-4 py-1 rounded-full text-xs font-semibold text-center"
                  style={{
                    color: levelStyle.color,
                    backgroundColor: levelStyle.bg,
                  }}
                >
                  {user.level}
                </span>
                <span className="text-gray-600 font-semibold">{user.totalXP} XP</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;

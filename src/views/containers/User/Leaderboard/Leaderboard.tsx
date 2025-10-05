// src/views/containers/User/Leaderboard/Leaderboard.tsx
import * as Components from "../../../components";
import "./Leaderboard.css";
import { useAdaptive } from "../../../../context/AdaptiveContext";
import { useAuth } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../../../constants";
import { LEVELS } from "../../../../types/game"; // ← use centralized thresholds
import type { LevelName } from "../../../../types/game";

// Local level colors (unchanged styling)
const LEVEL_COLORS: Record<LevelName, { color: string; bg: string }> = {
  Beginner: { color: "#3776AB", bg: "#3776AB20" }, // blue
  Intermediate: { color: "#EAB308", bg: "#EAB30820" }, // yellow
  Advanced: { color: "#22C55E", bg: "#22C55E20" }, // green
  Master: { color: "#A855F7", bg: "#A855F720" }, // purple
};

// Shape we pass to UI (and TopThree)
type UIUser = {
  id: number;
  name: string;
  username: string;
  totalXP: number;
  level: LevelName;
};

// Compute XP/Level from the user's CURRENT ZONE (mirrors ProgressBar)
const computeXPFromCurrentZone = (
  progresses: { zone_id: number; zone_name: string; zone_order: number | null; completion_percent: number }[],
) => {
  if (!progresses || progresses.length === 0) {
    return { totalXP: 0, level: LEVELS[0].label as LevelName };
  }
  const sorted = [...progresses].sort((a, b) => (a.zone_order ?? 999) - (b.zone_order ?? 999));
  const current = sorted.find((p) => (p.completion_percent ?? 0) < 100) ?? sorted[sorted.length - 1];

  const levelIndex = Math.max(0, Math.min((current.zone_order ?? 1) - 1, LEVELS.length - 1));
  const tier = LEVELS[levelIndex];
  const totalXP = Math.round(((current.completion_percent ?? 0) / 100) * tier.maxXP);

  return { totalXP, level: tier.label as LevelName };
};

const Leaderboard = () => {
  const { leaderboardZoneProgress, isLoading } = useAdaptive();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const handleUserClick = (userId: number) => {
    if (authUser?.id) {
      // Navigate to the user's profile using the USER_PROFILE route
      const profilePath = `/${authUser.id}/${PATHS.USER_VIEW.USER_PROFILE.path.replace(':profileId', userId.toString())}`;
      console.log("Navigating to profile path:", profilePath);
      console.log("USER_PROFILE path template:", PATHS.USER_VIEW.USER_PROFILE.path);
      console.log("Target userId:", userId);
      console.log("Current authUser.id:", authUser.id);
      navigate(profilePath);
    }
  };

  console.log("Leaderboard Component - Data received:", leaderboardZoneProgress);
  console.log("Leaderboard Component - Is loading:", isLoading);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
        <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
        <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  // Build UI list
  const entries: UIUser[] = (leaderboardZoneProgress ?? []).map((e: any) => {
    console.log("Leaderboard - Processing entry:", e);
    const name = [e.first_name, e.last_name].filter(Boolean).join(" ") || e.username;
    console.log("Leaderboard - Entry progresses:", e.progresses);
    const { totalXP, level } = computeXPFromCurrentZone(e.progresses || []);
    console.log("Leaderboard - Computed XP and level:", { totalXP, level });
    return { id: e.user_id, name, username: e.username, totalXP, level };
  });

  console.log("Leaderboard - Final entries:", entries);

  if (entries.length === 0) {
    return (
      <Components.PageEmpty
        title="No learner data yet"
        subtitle="There are no learners in this leaderboard. Check back later."
      />
    );
  }

  // Sort by XP desc
  const sortedUsers = [...entries].sort((a, b) => b.totalXP - a.totalXP);

  const meIndex = sortedUsers.findIndex(
    (u) => (authUser?.id && u.id === authUser.id) || (!!authUser?.username && u.username === authUser.username),
  );
  const myRank = meIndex >= 0 ? meIndex + 1 : null;
  const me = meIndex >= 0 ? sortedUsers[meIndex] : null;

  const topThree = sortedUsers.slice(0, 3);

  // Show ranks 4–10 in the list
  const others = sortedUsers.slice(3, 10);

  return (
    <div className="flex flex-col gap-10 py-8">
      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <>
          <div className="flex flex-row justify-center items-end gap-8 mt-2 relative">
            {topThree[1] && <Components.TopThree user={topThree[1]} rank={1} onClick={handleUserClick} />}
            {topThree[0] && <Components.TopThree user={topThree[0]} rank={0} onClick={handleUserClick} />}
            {topThree[2] && <Components.TopThree user={topThree[2]} rank={2} onClick={handleUserClick} />}
          </div>

          {/* If I'm in Top 3, show a subtle badge */}
          {myRank && myRank <= 3 && (
            <div className="flex justify-center -mt-2">
              <span className="px-3 py-1 rounded-full bg-[#704EE7]/10 text-[#704EE7] text-xs font-semibold">You are #{myRank}</span>
            </div>
          )}
        </>
      )}

      {/* Ranks 4–10 */}
      <div className="flex flex-col gap-4 text-sm">
        {others.map((user, index) => {
          const rankNumber = index + 4; // because we start from 4
          const levelStyle = LEVEL_COLORS[user.level] || { color: "#704EE7", bg: "#704EE720" };
          const isMe = myRank === rankNumber;

          return (
            <div
              key={user.id}
              onClick={() => handleUserClick(user.id)}
              className={[
                "flex items-center justify-between bg-white/80 backdrop-blur-sm border p-5 rounded-2xl shadow-md transition-all duration-300 group cursor-pointer",
                isMe ? "border-[#704EE7] ring-2 ring-[#704EE7]/40 bg-[#704EE7]/5" : "border-[#704EE7]/25 hover:border-[#704EE7]/35 hover:shadow-lg",
              ].join(" ")}
            >
              {/* Left Side: Rank + Avatar + Name */}
              <div className="flex items-center gap-4">
                {/* Rank Number */}
                <span className="text-[#3776AB] font-bold text-xl w-10 text-center">#{rankNumber}</span>

                {/* Avatar */}
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#704EE7] text-white 
                                font-bold text-lg shadow-md group-hover:shadow-[#704EE7]/40 transition">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                {/* Name and Username */}
                <div className="flex flex-col">
                  <span className="font-semibold text-lg">
                    {user.name}
                    {isMe && (
                      <span className="ml-2 align-middle text-xs px-2 py-0.5 rounded-full bg-[#704EE7]/10 text-[#704EE7] font-semibold">You</span>
                    )}
                  </span>
                  <span className="text-gray-500 text-sm">@{user.username}</span>
                </div>
              </div>

              {/* Right Side: Dynamic Level + XP */}
              <div className="flex flex-col items-end w-28 gap-1.5">
                <span className="px-4 py-1 rounded-full text-xs font-semibold text-center" style={{ color: levelStyle.color, backgroundColor: levelStyle.bg }}>
                  {user.level}
                </span>
                <span className="text-gray-600 font-semibold">{user.totalXP} XP</span>
              </div>
            </div>
          );
        })}

        {/* If I'm outside Top 10, show a divider and my row at the bottom */}
        {myRank && myRank > 10 && me && (
          <>
            <div className="flex items-center gap-3 my-3">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-[11px] uppercase tracking-wider text-gray-500">Your Rank</span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>

            <div 
              onClick={() => handleUserClick(me.id)}
              className="flex items-center justify-between bg-white/80 backdrop-blur-sm border p-5 rounded-2xl 
                         shadow-md ring-2 ring-[#704EE7]/40 border-[#704EE7] bg-[#704EE7]/5 cursor-pointer">
              {/* Left Side: Rank + Avatar + Name */}
              <div className="flex items-center gap-4">
                <span className="text-[#3776AB] font-bold text-xl w-10 text-center">#{myRank}</span>
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#704EE7] text-white 
                                font-bold text-lg shadow-md">
                  {me.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-lg">
                    {me.name}
                    <span className="ml-2 align-middle text-xs px-2 py-0.5 rounded-full bg-[#704EE7]/10 text-[#704EE7] font-semibold">You</span>
                  </span>
                  <span className="text-gray-500 text-sm">@{me.username}</span>
                </div>
              </div>

              {/* Right Side: Level + XP */}
              <div className="flex flex-col items-end w-28 gap-1.5">
                {(() => {
                  const style = LEVEL_COLORS[me.level] || { color: "#704EE7", bg: "#704EE720" };
                  return (
                    <>
                      <span className="px-4 py-1 rounded-full text-xs font-semibold text-center" style={{ color: style.color, backgroundColor: style.bg }}>
                        {me.level}
                      </span>
                      <span className="text-gray-600 font-semibold">{me.totalXP} XP</span>
                    </>
                  );
                })()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;

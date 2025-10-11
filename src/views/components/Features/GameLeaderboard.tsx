import React, { useEffect, useState } from "react";
import PageEmpty from "../UI/PageEmpty";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { PATHS } from "../../../constants/constants";

type RawEntry = {
  user_id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  score: number; // higher is better
  time_ms: number; // lower is better
  game_key?: string;
};

// Backend leaderboard entry (matches types/game.LeaderboardEntry)
type BackendEntry = {
  user_id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  score: number;
  time_seconds: number;
  session_id: string;
  played_at: string;
};

type Props = {
  // optional: pass raw leaderboard entries directly
  entries?: RawEntry[];
  // optional: fetch function that returns either raw entries OR backend entries OR null
  fetchLeaderboard?: () => Promise<RawEntry[] | BackendEntry[] | null>;
  title?: string;
};

const GameLeaderboard: React.FC<Props> = ({ entries: propEntries, fetchLeaderboard, title = "Game Leaderboard" }) => {
  const [entries, setEntries] = useState<RawEntry[] | null>(propEntries ?? null);
  const [loading, setLoading] = useState(!propEntries && !!fetchLeaderboard);
  const navigate = useNavigate();
  const authCtx = useAuth();
  

  useEffect(() => {
    let mounted = true;
    if (!propEntries && fetchLeaderboard) {
      setLoading(true);
      fetchLeaderboard()
        .then((data) => {
          if (!mounted) return;
          if (!data) return setEntries([]);

          // Normalize backend entries (time_seconds) to local RawEntry (time_ms)
          const normalized: RawEntry[] = (data as any[]).map((d) => {
            if (d.time_ms !== undefined) return d as RawEntry;
            // assume backend shape
            const be = d as BackendEntry;
            return {
              user_id: be.user_id,
              username: be.username,
              first_name: be.first_name,
              last_name: be.last_name,
              score: be.score,
              time_ms: Math.round((be.time_seconds || 0) * 1000),
              game_key: undefined,
            } as RawEntry;
          });

          setEntries(normalized ?? []);
        })
        .catch((err) => {
          console.error("Failed to fetch game leaderboard", err);
          if (mounted) setEntries([]);
        })
        .finally(() => mounted && setLoading(false));
    }
    return () => { mounted = false; };
  }, [propEntries, fetchLeaderboard]);

  // if propEntries changes, keep local copy
  useEffect(() => { if (propEntries) setEntries(propEntries); }, [propEntries]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
        <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return <PageEmpty title={title} subtitle="No results yet for this game." />;
  }

  // Reduce to best performance per user (best score, tie -> fastest time)
  const bestByUser = new Map<number, RawEntry>();
  for (const e of entries) {
    const existing = bestByUser.get(e.user_id);
    if (!existing) {
      bestByUser.set(e.user_id, e);
      continue;
    }
    if (e.score > existing.score) {
      bestByUser.set(e.user_id, e);
    } else if (e.score === existing.score && e.time_ms < existing.time_ms) {
      bestByUser.set(e.user_id, e);
    }
  }

  const ranked = Array.from(bestByUser.values()).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score; // higher score first
    return a.time_ms - b.time_ms; // lower time first
  });

  const formatTime = (ms: number) => {
    if (ms >= 60000) {
      const mins = Math.floor(ms / 60000);
      const secs = Math.floor((ms % 60000) / 1000);
      return `${mins}m ${secs}s`;
    }
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(2)}s`;
    }
    return `${ms}ms`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <div className="flex-grow border-t border-gray-300" />
        <h3 className="mx-4 text-2xl font-semibold tracking-wider">Leaderboard</h3>
        <div className="flex-grow border-t border-gray-300" />
      </div>

      <div className="flex flex-col gap-4 text-sm">
        {ranked.map((r, index) => {
          const rankNumber = index + 1;
          return (
            <div
              key={r.user_id}
              onClick={() => {
                const { user: authUser } = authCtx;
                if (authUser?.id) {
                  const profilePath = `/${authUser.id}/${PATHS.USER_VIEW.USER_PROFILE.path.replace(':profileId', r.user_id.toString())}`;
                  navigate(profilePath);
                }
              }}
              className={[
                "flex items-center justify-between bg-white/80 backdrop-blur-sm border p-5 rounded-2xl shadow-md transition-all duration-300 group cursor-pointer",
                "border-[#704EE7]/25 hover:border-[#704EE7]/35 hover:shadow-lg",
              ].join(" ")}
            >
              {/* Left Side: Rank + Avatar + Name */}
              <div className="flex items-center gap-4">
                <span className="text-[#3776AB] font-bold text-xl w-10 text-center">#{rankNumber}</span>

                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#704EE7] text-white font-bold text-lg shadow-md">
                  {([r.first_name, r.last_name].filter(Boolean).join(' ') || r.username).charAt(0).toUpperCase()}
                </div>

                <div className="flex flex-col">
                  <span className="font-semibold text-lg">{[r.first_name, r.last_name].filter(Boolean).join(' ') || r.username}</span>
                  <span className="text-gray-500 text-sm">@{r.username}</span>
                </div>
              </div>

              {/* Right Side: Score + Time */}
              <div className="flex flex-col items-end w-36 gap-1.5">
                <div className="text-lg font-bold">{r.score}</div>
                <div className="text-gray-600 text-sm">{formatTime(r.time_ms)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameLeaderboard;
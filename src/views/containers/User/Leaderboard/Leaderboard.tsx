import * as Interfaces from "../../../../interfaces";
import * as Components from "../../../components"
import "./Leaderboard.css";

const Leaderboard = () => {
  const sortedUsers = [...Interfaces.users].sort((a, b) => b.totalXP - a.totalXP);
  const topThree = sortedUsers.slice(0, 3);
  const others = sortedUsers.slice(3);

  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="flex flex-row justify-center items-end gap-8">
        <Components.TopThree user={topThree[1]} rank={1} />
        <Components.TopThree user={topThree[0]} rank={0} />
        <Components.TopThree user={topThree[2]} rank={2} />
      </div>

      <div className="bg-white rounded-md shadow-md p-6 flex flex-col gap-3 text-sm">
        {others.map((user, index) => (
          <div key={user.id} className="flex items-center justify-between bg-[#F5F8FB] p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#3776AB] font-bold text-xl w-10">#{index + 4}</span>
              <div className="w-10 h-10 bg-[#D9D9D9] rounded-full" />
              <span className="font-semibold">{user.name}</span>
            </div>
            <div className="flex items-center justify-between w-50 gap-3">
              <span className="text-[#6B7280] font-semibold">{user.totalXP} XP</span>
              <span className="text-[#0077B6] bg-[#0077B626] px-4 py-1 rounded-full text-xs font-medium">
                Level {user.level}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;

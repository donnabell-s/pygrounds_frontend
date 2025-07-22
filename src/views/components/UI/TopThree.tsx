// TopThree.tsx
import { RiMedalLine, RiVipCrownLine } from "react-icons/ri";
import "./Leaderboard.css";

interface TopUserProps {
  user: {
    name: string;
    username: string;
    totalXP: number;
  };
  rank: number; // 0 = 1st, 1 = 2nd, 2 = 3rd
}

const TopThree: React.FC<TopUserProps> = ({ user, rank }) => {
  const styles = [
    {
      className: "pulse-gold",
      height: "h-52",
      textColor: "text-[#E59116]",
      icon: <RiVipCrownLine />,
      label: "1st",
    },
    {
      className: "pulse-silver",
      height: "h-48",
      textColor: "text-[#A3A9BC]",
      icon: <RiMedalLine />,
      label: "2nd",
    },
    {
      className: "pulse-bronze",
      height: "h-46",
      textColor: "text-[#C09139]",
      icon: <RiMedalLine />,
      label: "3rd",
    },
  ];

  const { className, height, textColor, icon, label } = styles[rank];

  return (
    <div className={`${className} flex flex-col items-center justify-between rounded-lg w-50 p-4 gap-1 ${height} bg-white`}>
      <div className="flex flex-col items-center justify-center">
        <div className="w-15 h-15 bg-[#D9D9D9] rounded-full" />
        <div className="text-lg font-semibold mt-2">{user?.name}</div>
        <div className="text-md font-medium text-[#6B7280]">{user?.username}</div>
        {/* <span className="text-sm mt-1 text-[#6B7280]">{user?.totalXP} XP</span> */}
      </div>
      <div className={`flex items-center justify-center text-lg font-bold ${textColor}`}>
        {icon}{label}
      </div>
    </div>
  );
};

export default TopThree;

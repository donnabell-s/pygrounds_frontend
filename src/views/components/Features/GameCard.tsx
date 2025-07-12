import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface GameCardProps {
  title: string;
  description: string;
  category: string;
  comingSoon?: boolean;
  color: string; // HEX like "#3776AB"
}

const GameCard: React.FC<GameCardProps> = ({title, description, category, comingSoon = false, color}) => {
  const navigate = useNavigate();
  const gameSlug = title.toLowerCase().replace(/\s+/g, "-");

  const handlePlayClick = () => {
    if (!comingSoon) {
      navigate(`/user/${gameSlug}/preview`);
    }
  };

  return (
    <div className="rounded-lg shadow-md transition-shadow duration-300 bg-white hover:shadow-lg flex flex-col justify-between overflow-hidden">
      <div className="h-27 w-full bg-[#F1F1F1] flex items-end px-4 py-3">
        <h3 className="text-lg font-bold" style={{ color }}>
          {title}
        </h3>
      </div>

      <div className="p-4 flex flex-col justify-between flex-grow gap-3">
        <p className="text-sm text-[#6B7280]">{description}</p>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold py-0.5 px-2 rounded-full border border-[#D1D5DB]">
            {category}
          </span>

          <button 
          className="text-sm px-3 py-1.5 rounded-md hover:brightness-110 flex flex-row items-center gap-3.5 cursor-pointer" style={{backgroundColor: color, color: "#FFFFFF"}}
          onClick={handlePlayClick}
          disabled={comingSoon}>
            {comingSoon ? ("Coming Soon") : (<>Play Now <FaArrowRight size={11} /></>)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCard;

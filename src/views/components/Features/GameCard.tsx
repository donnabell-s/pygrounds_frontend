import { FaArrowRight } from "react-icons/fa";
import { FaPlay } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

interface GameCardProps {
  title: string;
  description: string;
  category: string;
  comingSoon?: boolean;
  color: string; 
  image?: string; // optional image support
}

const GameCard: React.FC<GameCardProps> = ({
  title,
  description,
  category,
  comingSoon = false,
  color,
  image,
}) => {
  const navigate = useNavigate();
  const gameSlug = title.toLowerCase().replace(/\s+/g, "-");
  const { user } = useAuth();

  const handlePlayClick = () => {
    if (!user || comingSoon) return;
    navigate(`/${user.id}/${gameSlug}/preview`);
  };

  return (
    <div className="rounded-xl shadow-md transition-shadow duration-300 bg-white hover:shadow-lg flex flex-col justify-between overflow-hidden">
      {/* Card Header */}
      <div
        className="relative h-28 w-full shadow-sm overflow-hidden"
        style={{ backgroundColor: color }}
      >
        {image && (
          <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Dynamic gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${color}cc 30%, transparent 100%)`,
          }}
        />

        {/* Title over gradient */}
        <div className="absolute bottom-0 w-full text-white px-4 py-2">
          <h3 className="text-lg font-bold truncate">{title}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col justify-between flex-grow gap-3">
        <p className="text-sm text-[#6B7280]">{description}</p>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold py-0.5 px-2 rounded-full border border-[#D1D5DB]">
            {category}
          </span>

          <button
            className="text-sm font-semibold px-3.5 py-1.5 rounded-lg hover:brightness-110 flex flex-row items-center gap-2 cursor-pointer"
            style={{ backgroundColor: color, color: "#FFFFFF" }}
            onClick={handlePlayClick}
            disabled={comingSoon}
          >
            {comingSoon ? "Coming Soon" : <>Play Now <FaPlay size={9} /></>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCard;

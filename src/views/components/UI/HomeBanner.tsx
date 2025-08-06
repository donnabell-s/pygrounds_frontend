import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import * as Component from "../../components";
import { FaArrowRight } from "react-icons/fa6";

const HomeBanner = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const viewProgressClick = () => {
    if (user?.id) navigate(`/${user.id}/my-profile`);
  };

  return (
    <div className="w-full h-[270px] bg-[#704EE7]/10 rounded-xl shadow-md flex flex-col md:flex-row md:justify-between overflow-hidden">
      {/* Left Section */}
      <div className="flex flex-col justify-center gap-3 px-6 py-8 sm:px-10 md:pl-14 md:py-11 w-full md:w-[560px]">
        <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl">
          Welcome to the Python Game Zone
        </h1>
        <p className="font-semibold text-sm sm:text-base md:text-lg">
          Pick a game, test your skills, and level up your Python, all while having fun!
        </p>
        <div>
            <Component.PrimaryButton
            label="View Progress"
            py="py-1.5"
            px="px-4"
            fontSize="text-md"
            fontWeight="font-medium"
            onClick={viewProgressClick}
            icon={<FaArrowRight size={14} />}
            iconPosition="right"
            />
        </div>
      </div>

      {/* Right Section (Optional Image) */}
      <div className="hidden lg:flex items-end justify-center pr-18">
        {/* Uncomment if you want to show the mascot/banner image */}
        
        <img
          src="/images/python_banner.png"
          alt="Python Game Zone Illustration"
          className="h-auto max-h-[260px] w-auto object-contain"
          loading="lazy"
        /> 
       
      </div>
    </div>
  );
};

export default HomeBanner;

import { useNavigate } from 'react-router-dom';

const HomeBanner = () => {
    const navigate = useNavigate();

    const viewProgressClick = () => {
        navigate('/user/my-skills');
    };

    return (
        <div className="w-full bg-[#E4ECF7] flex flex-col md:flex-row md:justify-between rounded-lg shadow-md">
            <div className="flex flex-col justify-between px-6 py-8 md:px-11 md:py-8 min-h-[300px]">
                <div className="flex flex-col gap-4">
                    <h1 className="font-bold text-4xl md:text-5xl">
                        <span className="block">Welcome to the Python</span>
                        <span className="block">Game Zone</span>
                    </h1>
                    <p className="text-base md:text-lg">
                        <span className="block">Pick a game, test your skills, and level up your</span>
                        <span className="block">Python, all while having fun!</span>
                    </p>
                </div>
                
                <div className="mt-auto">
                    <button 
                        className="text-md px-8 py-2 rounded-md hover:brightness-110 flex flex-row items-center gap-3.5 cursor-pointer bg-[#3776AB] text-white w-fit font-semibold"
                        onClick={viewProgressClick}
                    >
                        View Progress
                    </button>
                </div>
            </div>
            <div className="hidden lg:flex items-end justify-center px-10">
                <img
                    src="/images/banner.png"
                    alt="Python Game Zone Illustration"
                    className="h-auto max-h-[300px] w-auto object-contain"
                    loading="lazy"
                />
            </div>
        </div>
    );
};

export default HomeBanner;
const ProgressBar = () => {
    const currentXP = 200;
    const maxXP = 500;
    const progressPercent = (currentXP / maxXP) * 100;
    
    return (
        <div className="w-full bg-[#E4ECF7] flex flex-col rounded-lg p-6 shadow-md gap-4">
            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row items-center gap-2.5">
                    <div className="bg-[#147C8A] rounded-full h-11 w-11"></div>
                    <div className="flex flex-col">
                        <div><p className="font-bold text-2xl">Level 1: Python Basics</p></div>
                        <div><p className="text-md">Master the fundamentals of Python programming</p></div>
                    </div>
                </div>
                <div className="bg-[#C5DCE7] rounded-full px-3 py-1.5"><p className="text-md font-semibold text-[#147C8A]">Beginner Zone</p></div>
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex flex-row justify-between items-center">
                    <div><p className="text-sm font-semibold">Overall Progress</p></div>
                    <div><p className="text-sm font-bold text-[#3776AB]">200/500 XP</p></div>
                </div>
                <div className="w-full h-3 bg-white rounded-full overflow-hidden">
                <div
                    className="h-full bg-[#3776AB] transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                ></div>
                </div>
                <div className="flex flex-row justify-between items-center text-[#6B7280]">
                    <div><p className="text-xs">3 achievements unlocked</p></div>
                    <div><p className="text-xs">85% Topic Mastery</p></div>
                </div>
            </div>
        </div>
    )
}

export default ProgressBar
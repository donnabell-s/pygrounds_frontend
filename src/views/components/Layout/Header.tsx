import * as Components from "../../components"

const Header = () => {
    return (
        <div className="sticky top-0 bg-[#FFFFFF] h-16 flex items-center shadow-sm px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20">
            <div className="flex items-center gap-7">
                <div className="font-bold text-2xl text-[#3776AB]">PyGrounds</div>
                <div className="flex gap-3">
                    <Components.HeaderLink label="Home" route={`/user/home`} />
                    <Components.HeaderLink label="My Skills" route={`/user/my-skills`} />
                    <Components.HeaderLink label="Leaderboard" route={`/user/leaderboard`} />
                </div>
            </div>
            <div className="ml-auto">
                <Components.ProfileDropdown />
            </div>
        </div>
    )
}

export default Header;

import * as Components from "../../../components"

const MyProfile = () => {
  return (
    <div className="flex flex-col gap-7 py-8">
<div className="flex flex-col md:flex-row items-center gap-6">
  <div className="w-55 md:w-45 aspect-square bg-[#D9D9D9] rounded-full flex-shrink-0" />
  <Components.ProgressBar />
</div>
<div className="flex flex-col md:flex-row gap-5">
  <Components.AchievementList />
  <Components.ProficiencyList />
</div>

    </div>
  )
}

export default MyProfile
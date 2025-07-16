import * as Components from "../../../components"

const MySkills = () => {
  return (
    <div className="flex flex-col gap-6 py-8">
      <Components.ProgressBar />
      <div className="flex flex-row gap-5">
        <Components.AchievementList />
        <Components.ProficiencyList />
      </div>
    </div>
  )
}

export default MySkills
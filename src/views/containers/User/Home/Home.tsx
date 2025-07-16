import * as Components from "../../../components"

const Home = () => {
  return (
    <div className="flex flex-col gap-6 py-8">
      <Components.HomeBanner />
      <div className="flex flex-col justify-center items-start">
        <p className="font-bold text-2xl">Minigames</p>
      </div>
      <Components.GameList />
    </div>
  )
}

export default Home
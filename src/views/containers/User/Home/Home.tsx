import * as Components from "../../../components"

const Home = () => {
  return (
    <div className="flex flex-col gap-6 py-8">
      <Components.ProgressBar />
      <div className="flex flex-col justify-center items-center gap-1">
        <p className="font-bold text-3xl">Python Game Zone</p>
        <p className="text-lg">Pick your challenge and level up your Python skills.</p>
      </div>
      <Components.GameList />
    </div>
  )
}

export default Home
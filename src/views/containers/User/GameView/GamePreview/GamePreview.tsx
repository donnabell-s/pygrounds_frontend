import { useParams } from "react-router-dom";
import * as Interfaces from "../../../../../interfaces";
import * as Components from "../../../../components";

const convertSlugToTitle = (slug: string) => {
  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const GamePreview = () => {
  const { game } = useParams();
  const gameTitle = game ? convertSlugToTitle(game) : "";
  const selectedGame = Interfaces.mockGames.find(g => g.title === gameTitle);

  if (!selectedGame) {
    return <div className="text-center py-10 text-gray-600">Game not found.</div>;
  }

  return (
    <div className="flex flex-col gap-11 py-8">
      <Components.PreviewAction selectedGame={selectedGame} />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <Components.PreviewCards.Cards.Instructions instructions={selectedGame.instructions} />
        </div>
        <div className="flex flex-col gap-6 w-full lg:w-1/3">
          <Components.PreviewCards.Cards.Stats
            challenges={selectedGame.challenges}
            lives={selectedGame.lives}
            timeLimit={selectedGame.time_limit_seconds}
          />
          <Components.PreviewCards.Cards.Tips tips={selectedGame.tips} />
        </div>
      </div>
    </div>
  );
};

export default GamePreview;

import { useParams } from "react-router-dom";
import * as Interfaces from "../../../../../interfaces";
import * as Components from "../../../../components";

// Helper: Converts slug back to readable title
const convertSlugToTitle = (slug: string) => {
  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const GamePreview = () => {
  const { game } = useParams(); // from route /user/:game/preview

  const gameTitle = game ? convertSlugToTitle(game) : "";
  const selectedGame = Interfaces.mockGames.find(g => g.title === gameTitle);

  if (!selectedGame) {
    return <div className="text-center py-10 text-gray-600">Game not found.</div>;
  }

  const renderInstructions = () => (
    <ul className="list-disc list-inside space-y-1">
      {selectedGame.instructions.map((item, idx) => {
        if (typeof item === "string") {
          return <li key={idx}>{item}</li>;
        } else {
          return (
            <li key={idx}>
              {item.text}
              <ul className="list-[circle] list-inside ml-5 mt-1 space-y-1">
                {item.substeps.map((sub, subIdx) => (
                  <li key={subIdx}>{sub}</li>
                ))}
              </ul>
            </li>
          );
        }
      })}
    </ul>
  );

  const renderStats = () => (
    <div className="flex justify-between text-center text-sm">
      <div className="flex flex-col flex-1 items-center">
        <span className="font-semibold text-gray-500 mb-1">Challenges</span>
        <span className="text-black">{selectedGame.challenges}</span>
      </div>
      <div className="flex flex-col flex-1 items-center">
        <span className="font-semibold text-gray-500 mb-1">Lives</span>
        <span className="text-black">{selectedGame.lives}</span>
      </div>
      <div className="flex flex-col flex-1 items-center">
        <span className="font-semibold text-gray-500 mb-1">Time Limit</span>
        <span className="text-black">
          {selectedGame.time_limit_seconds ? `${selectedGame.time_limit_seconds}s` : "None"}
        </span>
      </div>
    </div>
  );


  const renderTips = () => (
    <ul className="list-disc list-inside space-y-1 text-sm">
      {selectedGame.tips.map((tip, idx) => (
        <li key={idx}>{tip}</li>
      ))}
    </ul>
  );

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <Components.PreviewCards header={<h3 className="text-lg font-semibold">Instructions</h3>}>
            {renderInstructions()}
          </Components.PreviewCards>
        </div>

        <div className="flex flex-col gap-6 w-full lg:w-1/3">
          <Components.PreviewCards header={<h3 className="text-lg font-semibold">Game Stats</h3>}>
            {renderStats()}
          </Components.PreviewCards>

          <Components.PreviewCards header={<h3 className="text-lg font-semibold">Pro Tips</h3>}>
            {renderTips()}
          </Components.PreviewCards>
        </div>
      </div>
    </div>
  );
};

export default GamePreview;

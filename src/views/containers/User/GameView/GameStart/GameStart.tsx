import { useParams } from "react-router-dom";
import * as Components from "../../../../components";
import { useGame } from "../../../../../context/GameContext";

const gameTypeMap: Record<string, React.FC> = {
  crossword: Components.Crossword,
  wordsearch: Components.WordSearch,
  // Extendable
};

const extractGameType = (slug: string): string | null =>
  Object.keys(gameTypeMap).find((key) => slug.includes(key)) || null;

const GameStart = () => {
  const { game } = useParams();
  const { activeSession } = useGame();
  const gameType = game ? extractGameType(game) : null;
  const SelectedGame = gameType ? gameTypeMap[gameType] : null;

  if (!SelectedGame) {
    return (
      <div className="text-center py-10 text-red-500">
        Game not found for slug: <span className="font-mono">{game}</span>
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="text-center py-10 text-gray-500">
        No active session found. Please go back and start the game properly.
      </div>
    );
  }

  return <SelectedGame />;
};

export default GameStart;

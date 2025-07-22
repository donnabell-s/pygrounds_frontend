// src/pages/user/game/GameStart.tsx
import { useParams } from "react-router-dom";
import * as Components from "../../../../components";
import { useGame } from "../../../../../context/GameContext";

// Map URL slug keywords to actual components
const gameTypeMap: Record<string, React.FC> = {
  crossword: Components.Crossword,
};

const extractGameType = (slug: string): string | null =>
  Object.keys(gameTypeMap).find((key) => slug.includes(key)) || null;

const GameStart = () => {
  const { game } = useParams();
  const { activeSession } = useGame(); // Session pulled from context (or localStorage via context useEffect)
  const gameType = game ? extractGameType(game) : null;
  const SelectedGame = gameType ? gameTypeMap[gameType] : null;

  if (!SelectedGame || !activeSession) {
    return (
      <div className="text-center py-10 text-red-500">
        {!SelectedGame ? (
          <>Game not found for slug: <strong>{game}</strong></>
        ) : (
          <>Loading game session...</>
        )}
      </div>
    );
  }

  return (
    <>
      <SelectedGame />
    </>
  );
};

export default GameStart;

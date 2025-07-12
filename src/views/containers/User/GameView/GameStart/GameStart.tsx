import { useParams } from "react-router-dom";

const GameStart = () => {
  const { game } = useParams(); // game === "hangman-coding-game"
  return <div>Start: {game}</div>;
};
export default GameStart;
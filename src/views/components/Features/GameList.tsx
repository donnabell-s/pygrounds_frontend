import * as Components from "../../components"
import { mockGames } from "../../../interfaces/minigames";

const GameList = () => {
    const gameColors = [
    "#0077B6",
    "#CF3535",
    "#2E8B57",
    "#8E7CC3",
    ];

    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {mockGames.map((game, index) => (
            <Components.GameCard
                key={index}
                title={game.title}
                description={game.description}
                category={game.category}
                color={gameColors[index % gameColors.length]}
            />
            ))}
            <Components.GameCard
            title="More Games Coming"
            description="We're constantly adding new minigames to enhance your Python learning experience."
            category="Coming Soon"
            comingSoon
            color="#9CA3AF"
            />
        </div>
    );
};

export default GameList;
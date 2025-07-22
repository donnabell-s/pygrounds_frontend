import * as Interfaces from "../../../interfaces";

type ConfirmGameProps = {
  game: Interfaces.Minigame;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmGame = ({ game, onConfirm, onCancel }: ConfirmGameProps) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-[#0077B6]">Start Game?</h2>
      <p className="text-sm">
        You're about to begin <span className="font-semibold">{game.title}</span>.
      </p>
      
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-[#0077B6] text-white rounded-md hover:brightness-110 cursor-pointer"
        >
          Confirm & Start
        </button>
      </div>
    </div>
  );
};

export default ConfirmGame;

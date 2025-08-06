type ConfirmExitProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmExit = ({ onConfirm, onCancel }: ConfirmExitProps) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-[#E74C3C]">Exit Game?</h2>
      <p className="text-sm text-gray-700">
        Are you sure you want to exit? Your current answers and progress will <span className="font-semibold text-[#E74C3C]">not</span> be saved.
      </p>

      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={onCancel}
          className="px-1.5 py-2 cursor-pointer font-semibold"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex items-center justify-center gap-2 bg-[#E74C3C] text-white rounded-full hover:brightness-110 transition cursor-pointer px-5 py-2 font-semoibold text-md"
        >
          Exit Anyway
        </button>
      </div>
    </div>
  );
};

export default ConfirmExit;

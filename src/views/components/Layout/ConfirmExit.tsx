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
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-[#E74C3C] text-white rounded-md hover:brightness-110 cursor-pointer"
        >
          Exit Anyway
        </button>
      </div>
    </div>
  );
};

export default ConfirmExit;

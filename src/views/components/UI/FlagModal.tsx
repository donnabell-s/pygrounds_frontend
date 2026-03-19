import React, { useState } from "react";

interface FlagModalProps {
  questionNumber: number;
  onSubmit: (comment: string) => void;
  onCancel: () => void;
}

const FlagModal: React.FC<FlagModalProps> = ({ questionNumber, onSubmit, onCancel }) => {
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    onSubmit(comment);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mx-4 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-[#704EE7]">Flag Question</h2>
        <p className="text-sm">
          You're flagging <span className="font-semibold">Question {questionNumber}</span> for review.
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Comment <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="e.g. The answer seems incorrect, unclear wording..."
            rows={3}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#704EE7]/40 focus:border-[#704EE7] resize-none transition"
          />
        </div>

        <div className="flex justify-end gap-3 mt-1">
          <button
            onClick={onCancel}
            className="px-1.5 py-2 cursor-pointer font-semibold text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#704EE7] text-white text-sm font-semibold rounded-lg hover:brightness-110 cursor-pointer transition"
          >
            Submit Flag
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlagModal;
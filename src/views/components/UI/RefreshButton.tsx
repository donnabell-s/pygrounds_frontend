// src/views/components/UI/RefreshButton.tsx
import React from "react";
import { useAdaptive } from "../../../context/AdaptiveContext";
import { FaSync } from "react-icons/fa";

const RefreshButton: React.FC = () => {
  const { refresh, isLoading, lastUpdated } = useAdaptive();

  const handleRefresh = async () => {
    await refresh();
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleRefresh}
        disabled={isLoading}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
          ${isLoading 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-[#704EE7] text-white hover:bg-[#5a3bc4] hover:shadow-md'
          }
        `}
        title="Refresh data"
      >
        <FaSync className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Refreshing...' : 'Refresh'}
      </button>
      
      {lastUpdated && !isLoading && (
        <span className="text-xs text-gray-500">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default RefreshButton;

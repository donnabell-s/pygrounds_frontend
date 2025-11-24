import React from 'react';
import { useStatusPolling } from '../../../hooks/useStatusPolling';
import { adminApi } from '../../../api';
import StatusBadge from '../UI/StatusBadge';
import { FiRefreshCw } from 'react-icons/fi';
import type { AdminSubtopic } from '../../../types/adaptive';

interface SubtopicStatusTrackerProps {
  subtopic: AdminSubtopic;
  onStatusChange?: (updatedSubtopic: AdminSubtopic) => void;
}

const SubtopicStatusTracker: React.FC<SubtopicStatusTrackerProps> = ({ 
  subtopic, 
  onStatusChange 
}) => {
  const {
    data,
    isProcessing,
    refreshStatus,
    isLoading
  } = useStatusPolling(
    () => adminApi.getSubtopic(subtopic.id),
    'embedding_status',
    {
      pollInterval: 2000,
      autoStart: subtopic.embedding_status === 'processing' || subtopic.embedding_status === 'pending',
      stopPollingOnComplete: true,
      completedStatuses: ['completed'],
      failedStatuses: ['failed'],
      onStatusChange: (newData: AdminSubtopic, _oldData: AdminSubtopic) => {
        if (newData && onStatusChange) {
          onStatusChange(newData);
        }
        
        // Show notification for status changes
        if (newData?.embedding_status === 'completed') {
          console.log(`✅ Embeddings completed for subtopic: ${subtopic.name}`);
        } else if (newData?.embedding_status === 'failed') {
          console.log(`❌ Embedding failed for subtopic: ${subtopic.name}`);
        }
      }
    }
  );

  const currentSubtopic = data || subtopic;
  const embeddingStatus = currentSubtopic.embedding_status;
  const embeddingError = currentSubtopic.embedding_error;

  return (
    <div className="flex items-center gap-2">
      <StatusBadge
        status={embeddingStatus}
        error={embeddingError}
        size="sm"
      />
      
      {(isProcessing || embeddingStatus === 'processing' || embeddingStatus === 'pending') && (
        <button
          onClick={refreshStatus}
          disabled={isLoading}
          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          title="Refresh status"
        >
          <FiRefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
};

export default SubtopicStatusTracker;
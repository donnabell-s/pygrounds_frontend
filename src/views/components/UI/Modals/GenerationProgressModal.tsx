import { useState, useEffect } from 'react';
import AdminModal from './AdminModal';
import type { GenerationStatus, WorkerStatus } from '../../../../types/questions';
import { adminApi } from '../../../../api';

interface GenerationProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessionId: string | null;
    onComplete: (result: GenerationStatus) => void;
}

export const GenerationProgressModal = ({ 
    isOpen, 
    onClose, 
    sessionId, 
    onComplete 
}: GenerationProgressModalProps) => {
    const [status, setStatus] = useState<GenerationStatus | null>(null);
    const [workers, setWorkers] = useState<WorkerStatus[]>([]);
    const [isPolling, setIsPolling] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (!sessionId || !isPolling || !isOpen) return;

        const pollInterval = setInterval(async () => {
            try {
                // Get overall status
                const statusResponse = await adminApi.getGenerationStatus(sessionId);
                setStatus(statusResponse);

                // Get detailed worker info
                const workersResponse = await adminApi.getWorkerStatus(sessionId);
                setWorkers(workersResponse.workers);

                // Stop polling if completed
                if (statusResponse.status === 'completed' || statusResponse.status === 'completed_with_errors') {
                    setIsPolling(false);
                    onComplete(statusResponse);
                }
            } catch (error: any) {
                console.error('Error polling generation status:', error);
                setError(error.message || 'Failed to fetch generation status');
            }
        }, 2000); // Poll every 2 seconds

        return () => clearInterval(pollInterval);
    }, [sessionId, isPolling, isOpen, onComplete]);

    const handleClose = () => {
        setIsPolling(false);
        onClose();
    };

    const getWorkerStatusColor = (workerStatus: string) => {
        switch (workerStatus) {
            case 'pending': return 'border-l-gray-400';
            case 'processing': return 'border-l-blue-500';
            case 'completed': return 'border-l-green-500';
            case 'error': return 'border-l-red-500';
            case 'failed': return 'border-l-orange-500';
            default: return 'border-l-gray-300';
        }
    };

    const getWorkerStatusIcon = (workerStatus: string) => {
        switch (workerStatus) {
            case 'pending': return '⏳';
            case 'processing': return '🔄';
            case 'completed': return '✅';
            case 'error': return '❌';
            case 'failed': return '⚠️';
            default: return '❓';
        }
    };

    const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${seconds.toFixed(1)}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
    };

    return (
        <AdminModal 
            isOpen={isOpen} 
            onClose={handleClose} 
            title="Question Generation Progress"
        >
            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-md">
                        {error}
                    </div>
                )}

                {status && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3">Overall Progress</h3>
                        
                        <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
                            <div 
                                className="bg-blue-600 h-4 rounded-full transition-all duration-300" 
                                style={{ width: `${status.overall_progress.completion_percentage}%` }}
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Progress:</span><br />
                                {status.overall_progress.completion_percentage.toFixed(1)}%
                            </div>
                            <div>
                                <span className="font-medium">Questions:</span><br />
                                {status.overall_progress.total_questions_generated}
                            </div>
                            <div>
                                <span className="font-medium">Workers:</span><br />
                                {status.worker_summary.active_workers} active, {status.worker_summary.completed_workers} completed
                            </div>
                            <div>
                                <span className="font-medium">Combinations:</span><br />
                                {status.overall_progress.total_combinations_processed} processed
                            </div>
                        </div>

                        {status.zones.length > 0 && (
                            <div className="mt-3">
                                <span className="font-medium">Zones:</span> {status.zones.join(', ')}
                            </div>
                        )}
                        
                        {status.difficulties.length > 0 && (
                            <div className="mt-1">
                                <span className="font-medium">Difficulties:</span> {status.difficulties.join(', ')}
                            </div>
                        )}
                    </div>
                )}

                <div>
                    <h3 className="text-lg font-semibold mb-3">Worker Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {workers.map(worker => (
                            <div 
                                key={worker.worker_id} 
                                className={`border-l-4 ${getWorkerStatusColor(worker.status)} bg-white border border-gray-200 rounded-lg p-4 shadow-sm`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium">Worker {worker.worker_id}</h4>
                                    <span className="text-xl">{getWorkerStatusIcon(worker.status)}</span>
                                </div>
                                
                                <div className="text-sm space-y-1">
                                    <div>
                                        <span className="font-medium">Zone:</span> {worker.zone_name || 'Waiting...'}
                                    </div>
                                    <div>
                                        <span className="font-medium">Difficulty:</span> {worker.difficulty || 'N/A'}
                                    </div>
                                    <div>
                                        <span className="font-medium">Status:</span> 
                                        <span className={`ml-1 px-2 py-1 rounded text-xs ${
                                            worker.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            worker.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                            worker.status === 'error' ? 'bg-red-100 text-red-800' :
                                            worker.status === 'failed' ? 'bg-orange-100 text-orange-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {worker.status}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Step:</span> {worker.current_step}
                                    </div>
                                </div>

                                {worker.progress.total_combinations > 0 && (
                                    <div className="mt-3">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span>Progress</span>
                                            <span>{worker.progress.processed_combinations}/{worker.progress.total_combinations}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                                style={{ 
                                                    width: `${(worker.progress.processed_combinations / worker.progress.total_combinations) * 100}%` 
                                                }}
                                            />
                                        </div>
                                        <div className="mt-1 text-xs">
                                            <span className="font-medium">Questions:</span> {worker.progress.questions_generated}
                                        </div>
                                        {worker.progress.failed_combinations > 0 && (
                                            <div className="text-xs text-red-600">
                                                Failed: {worker.progress.failed_combinations}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {worker.duration > 0 && (
                                    <div className="mt-2 text-xs text-gray-500">
                                        Duration: {formatDuration(worker.duration)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        disabled={isPolling && status?.status === 'processing'}
                    >
                        {isPolling && status?.status === 'processing' ? 'Close (will continue)' : 'Close'}
                    </button>
                </div>
            </div>
        </AdminModal>
    );
};

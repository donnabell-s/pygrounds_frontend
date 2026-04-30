import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../../api/adminApi';
import type { PreAssessmentGenerationStatus } from '../../../../types/questions';

interface PreAssessmentProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessionId: string | null;
    onComplete: (status: PreAssessmentGenerationStatus) => void;
}

const PreAssessmentProgressModal: React.FC<PreAssessmentProgressModalProps> = ({
    isOpen,
    onClose,
    sessionId,
    onComplete
}) => {
    const [status, setStatus] = useState<PreAssessmentGenerationStatus | null>(null);
    const [isPolling, setIsPolling] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (!sessionId || !isPolling || !isOpen) return;

        const pollInterval = setInterval(async () => {
            try {
                const statusData = await adminApi.getPreAssessmentGenerationStatus(sessionId);
                setStatus(statusData);

                // Stop polling if completed or error
                if (statusData.status === 'completed' || statusData.status === 'error') {
                    setIsPolling(false);
                    onComplete(statusData);
                }
            } catch (error: any) {
                console.error('Error polling pre-assessment generation status:', error);
                setError('Failed to get generation status');
                setIsPolling(false);
            }
        }, 2000); // Poll every 2 seconds

        return () => clearInterval(pollInterval);
    }, [sessionId, isPolling, isOpen, onComplete]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Pre-Assessment Question Generation Progress
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {status && (
                    <div className="space-y-4">
                        {/* Overall Progress */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-blue-900">Generation Status</h4>
                                <span className={`px-2 py-1 rounded text-sm ${
                                    status.status === 'processing' 
                                        ? 'bg-yellow-100 text-yellow-800' 
                                        : status.status === 'completed'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {status.status}
                                </span>
                            </div>
                            <p className="text-blue-700 mb-2">
                                {status.status === 'processing' ? 'LLM is thinking...' : status.step}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-blue-600">
                                <span>Requested: {status.total_questions_requested || status.total_questions}</span>
                                {status.questions_generated > 0 && <span>Generated: {status.questions_generated}</span>}
                                {status.assessment_info?.questions_saved !== undefined && (
                                    <span className="text-green-700 font-medium">
                                        Saved To DB: {status.assessment_info.questions_saved}
                                    </span>
                                )}
                                <span>Topics: {status.topic_count || status.assessment_info?.topics_covered}</span>
                                {status.assessment_info?.subtopics_total && <span>Subtopics: {status.assessment_info.subtopics_total}</span>}
                            </div>
                            
                            {status.message && status.status !== 'processing' && (
                                <div className="mt-2 text-sm italic text-gray-700 bg-white/50 p-2 rounded">
                                    {status.message}
                                </div>
                            )}

                            {/* Progress Area */}
                            <div className="mt-3">
                                {status.status === 'processing' && (
                                    <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden relative">
                                        <div className="bg-blue-600 h-2 rounded-full absolute left-0 top-0 w-1/4 animate-ping-pong" />
                                    </div>
                                )}
                                {status.status === 'completed' && (
                                    <div className="w-full bg-blue-200 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full w-full" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Topics Information */}
                        {(status.topics && status.topics.length > 0) || (status.topics_covered && status.topics_covered.length > 0) ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h4 className="font-medium text-green-900 mb-3">
                                    Topics Processed ({status.topics_covered?.length || status.topics?.length || 0})
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {(status.topics_covered || status.topics).map((topic: any) => (
                                        <div key={topic.id} className="bg-white border border-green-200 rounded p-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-green-900">
                                                    {topic.name}
                                                </span>
                                                {topic.questions_generated !== undefined && (
                                                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                                        {topic.questions_generated} questions
                                                    </span>
                                                )}
                                            </div>
                                            {topic.subtopics && topic.subtopics.length > 0 && (
                                                <div className="mt-1 text-xs text-gray-500">
                                                    Subtopics: {topic.subtopics.join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {/* Questions Preview */}
                        {((status.questions_preview && status.questions_preview.length > 0) || (status.questions && status.questions.length > 0)) && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-3">
                                    Question Preview ({((status.questions_preview || status.questions) ?? []).length} generated)
                                </h4>
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {((status.questions_preview || status.questions) ?? []).map((question, index) => (
                                        <div key={index} className="bg-white border border-gray-200 rounded p-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="text-sm font-medium text-gray-900 flex-1">
                                                    {question.question_text}
                                                </p>
                                                <span className={`ml-2 px-2 py-1 text-xs rounded ${
                                                    (question.estimated_difficulty || question.difficulty) === 'beginner' 
                                                        ? 'bg-green-100 text-green-700'
                                                        : (question.estimated_difficulty || question.difficulty) === 'intermediate'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : (question.estimated_difficulty || question.difficulty) === 'advanced'
                                                        ? 'bg-orange-100 text-orange-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {question.estimated_difficulty || question.difficulty || 'unknown'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-600 space-y-1">
                                                {(question.options || question.choices || []).map((option: string, optIndex: number) => (
                                                    <div key={optIndex} className={`${
                                                        option === question.correct_answer 
                                                            ? 'font-medium text-green-700' 
                                                            : ''
                                                    }`}>
                                                        • {option}
                                                        {option === question.correct_answer && ' ✓'}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Auto-refresh indicator */}
                        {isPolling && status.status === 'processing' && (
                            <div className="text-center text-sm text-gray-500">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    Auto-refreshing every 2 seconds...
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!status && !error && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading generation status...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PreAssessmentProgressModal;

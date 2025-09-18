import { useState, useEffect } from 'react';
import { adminApi } from '../../../../api';
import type { GeneratedQuestion, PreAssessmentQuestion, BulkGenerationParams, PreAssessmentBulkGenerationParams, QuestionListResponse } from '../../../../types/questions';
import { AdminTable, BulkGenerationModal } from '../../../components/UI';
import { FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi';

type QuestionType = 'minigame' | 'preassessment';
type GameType = 'all' | 'coding' | 'non_coding';
type ValidationStatus = 'all' | 'pending' | 'processed';

const QuestionBank = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [questionType, setQuestionType] = useState<QuestionType>('minigame');
    const [gameType, setGameType] = useState<GameType>('all');
    const [validationStatus, setValidationStatus] = useState<ValidationStatus>('all');
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [questionsData, setQuestionsData] = useState<QuestionListResponse | null>(null);
    const [preassessmentQuestions, setPreassessmentQuestions] = useState<PreAssessmentQuestion[]>([]);
    const [preassessmentData, setPreassessmentData] = useState<{ count: number; results: PreAssessmentQuestion[] } | null>(null);
    const [generationSuccess, setGenerationSuccess] = useState<string>('');
    const [isCheckingDifficulty, setIsCheckingDifficulty] = useState(false);
    const [difficultyCheckResult, setDifficultyCheckResult] = useState<string>('');
    const [activePreAssessmentSession, setActivePreAssessmentSession] = useState<string | null>(null);
    const [activeMinigameSession, setActiveMinigameSession] = useState<string | null>(null);
    const [minigameGenerationStatus, setMinigameGenerationStatus] = useState<string>('');
    const [editingQuestion, setEditingQuestion] = useState<PreAssessmentQuestion | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingMinigameQuestion, setEditingMinigameQuestion] = useState<GeneratedQuestion | null>(null);
    const [isMinigameEditModalOpen, setIsMinigameEditModalOpen] = useState(false);

    const handleCancelGeneration = async (sessionId: string, generationType: 'minigame' | 'preassessment') => {
        try {
            const response = await adminApi.cancelGeneration(sessionId);
            
            if (response.success) {
                // Clear the appropriate session and status
                if (generationType === 'minigame') {
                    localStorage.removeItem('minigame_generation_session');
                    setActiveMinigameSession(null);
                    setMinigameGenerationStatus(
                        `Generation cancelled. ${response.cancellation_stats.cleanup_stats.valid_questions_kept} questions were saved.`
                    );
                    
                    // Clear the message after 10 seconds
                    setTimeout(() => {
                        setMinigameGenerationStatus('');
                    }, 10000);
                } else {
                    localStorage.removeItem('preassessment_generation_session');
                    setActivePreAssessmentSession(null);
                    setGenerationSuccess(
                        `Generation cancelled. ${response.cancellation_stats.cleanup_stats.valid_questions_kept} questions were saved.`
                    );
                    
                    // Clear the message after 10 seconds
                    setTimeout(() => {
                        setGenerationSuccess('');
                    }, 10000);
                }
                
                // Refresh questions to show any that were saved
                await fetchQuestions();
            }
        } catch (err: any) {
            setError(err.message || 'Failed to cancel generation');
        }
    };

    useEffect(() => {
        // Reset to page 1 when filters change
        if (currentPage !== 1) {
            setCurrentPage(1);
        } else {
            fetchQuestions();
        }
        
        // Check for active pre-assessment session on mount
        const savedSession = localStorage.getItem('preassessment_generation_session');
        if (savedSession) {
            setActivePreAssessmentSession(savedSession);
            setGenerationSuccess('Pre-assessment generation in progress...');
            pollPreAssessmentStatus(savedSession);
        }

        // Check for active minigame generation session on mount
        const savedMinigameSession = localStorage.getItem('minigame_generation_session');
        if (savedMinigameSession) {
            setActiveMinigameSession(savedMinigameSession);
            setMinigameGenerationStatus('Minigame generation in progress...');
            pollMinigameGenerationStatus(savedMinigameSession);
        }
    }, [questionType, gameType, validationStatus]);

    // Separate effect for page changes to avoid infinite loops
    useEffect(() => {
        fetchQuestions();
    }, [currentPage]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            if (questionType === 'minigame') {
                const response = await adminApi.getAllQuestions({
                    game_type: gameType === 'all' ? undefined : gameType as 'coding' | 'non_coding',
                    validation_status: validationStatus === 'all' ? undefined : validationStatus as 'pending' | 'processed',
                    page: currentPage,
                    page_size: 10
                });
                setQuestionsData(response);
                
                // Validate current page and reset if invalid
                const totalPages = Math.ceil((response.count || 0) / 10);
                if (currentPage > totalPages && totalPages > 0) {
                    setCurrentPage(1);
                    return; // fetchQuestions will be called again due to useEffect dependency
                }
            } else {
                const response = await adminApi.getPreAssessmentQuestions({
                    page: currentPage,
                    page_size: 10
                });
                setPreassessmentData(response);
                setPreassessmentQuestions(response.results);
                
                // Validate current page for preassessment and reset if invalid
                const totalPages = Math.ceil((response.count || 0) / 10);
                if (currentPage > totalPages && totalPages > 0) {
                    setCurrentPage(1);
                    return; // fetchQuestions will be called again due to useEffect dependency
                }
            }
        } catch (err: any) {
            console.error('Error fetching questions:', err);
            setError(err.message || 'Failed to fetch questions');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this question?')) {
            return;
        }

        try {
            if (questionType === 'minigame') {
                await adminApi.deleteQuestion(id);
            } else {
                // Handle preassessment question deletion
                await adminApi.deletePreAssessmentQuestion(id);
            }
            await fetchQuestions();
        } catch (err: any) {
            setError(err.message || 'Failed to delete question');
        }
    };

    const handleEdit = async (question: PreAssessmentQuestion) => {
        setEditingQuestion(question);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (updatedData: {
        question_text: string;
        topic_ids: number[];
        estimated_difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
        order: number;
    }) => {
        if (!editingQuestion) return;

        try {
            // Only send the allowed fields for partial update
            const updatePayload = {
                question_text: updatedData.question_text,
                topic_ids: updatedData.topic_ids,
                subtopic_ids: editingQuestion.subtopic_ids, // Include existing subtopic_ids
                estimated_difficulty: updatedData.estimated_difficulty
            };
            await adminApi.partialUpdatePreAssessmentQuestion(editingQuestion.id, updatePayload);
            setIsEditModalOpen(false);
            setEditingQuestion(null);
            await fetchQuestions();
        } catch (err: any) {
            setError(err.message || 'Failed to update question');
        }
    };

    // Minigame question handlers
    const handleMinigameEdit = async (question: GeneratedQuestion) => {
        setEditingMinigameQuestion(question);
        setIsMinigameEditModalOpen(true);
    };

    const handleMinigameSaveEdit = async (updatedData: {
        question_text: string;
        correct_answer: string;
        estimated_difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
        game_type: 'coding' | 'non_coding';
    }) => {
        if (!editingMinigameQuestion) return;

        try {
            await adminApi.partialUpdateQuestion(editingMinigameQuestion.id, updatedData);
            setIsMinigameEditModalOpen(false);
            setEditingMinigameQuestion(null);
            await fetchQuestions();
        } catch (err: any) {
            setError(err.message || 'Failed to update minigame question');
        }
    };

    const filteredQuestions = questionsData?.results || [];

    const handleBulkDifficultyCheck = async () => {
        try {
            setIsCheckingDifficulty(true);
            setError('');
            setDifficultyCheckResult('');
            
            const response = await adminApi.bulkCheckDifficulty(questionType);
            setDifficultyCheckResult(response.message);
            
            // If it was successful, refresh the questions to show any updates
            if (response.status === 'success') {
                await fetchQuestions();
            }
        } catch (err: any) {
            setError(err.message || 'Failed to check question difficulty');
        } finally {
            setIsCheckingDifficulty(false);
        }
    };

    const pollPreAssessmentStatus = async (sessionId: string) => {
        // Save session to localStorage for persistence across page refreshes
        localStorage.setItem('preassessment_generation_session', sessionId);
        setActivePreAssessmentSession(sessionId);
        
        const pollInterval = setInterval(async () => {
            try {
                console.log('Polling pre-assessment status for session:', sessionId);
                const status = await adminApi.getPreAssessmentGenerationStatus(sessionId);
                console.log('Pre-assessment status response:', status);
                
                // Update message with progress
                setGenerationSuccess(`Pre-assessment generation: ${status.questions_generated} questions generated...`);
                
                // Stop polling if completed or error
                if (status.status === 'completed' || status.status === 'error') {
                    clearInterval(pollInterval);
                    
                    // Clear session from localStorage
                    localStorage.removeItem('preassessment_generation_session');
                    setActivePreAssessmentSession(null);
                    
                    if (status.status === 'completed') {
                        setGenerationSuccess(`Successfully generated ${status.questions_generated} pre-assessment questions!`);
                        await fetchQuestions();
                    } else {
                        setError('Pre-assessment question generation failed');
                        setGenerationSuccess('');
                    }
                }
            } catch (error: any) {
                console.error('Error polling pre-assessment status:', error);
                clearInterval(pollInterval);
                
                // Clear session from localStorage on error
                localStorage.removeItem('preassessment_generation_session');
                setActivePreAssessmentSession(null);
                
                setError('Failed to check generation status');
                setGenerationSuccess('');
            }
        }, 3000); // Poll every 3 seconds
        
        // Clear interval after 10 minutes to prevent infinite polling
        setTimeout(() => {
            clearInterval(pollInterval);
            localStorage.removeItem('preassessment_generation_session');
            setActivePreAssessmentSession(null);
        }, 600000);
    };

    const pollMinigameGenerationStatus = async (sessionId: string) => {
        // Save session to localStorage for persistence across page refreshes
        localStorage.setItem('minigame_generation_session', sessionId);
        setActiveMinigameSession(sessionId);
        
        const pollInterval = setInterval(async () => {
            try {
                console.log('Polling minigame generation status for session:', sessionId);
                const status = await adminApi.getGenerationStatus(sessionId);
                console.log('Minigame generation status response:', status);
                
                // Get worker details for more detailed progress
                const workerStatus = await adminApi.getWorkerStatus(sessionId);
                
                if (workerStatus.workers && workerStatus.workers.length > 0) {
                    const activeWorkers = workerStatus.workers.filter(w => w.status === 'processing');
                    const completedWorkers = workerStatus.workers.filter(w => w.status === 'completed');
                    
                    if (activeWorkers.length > 0) {
                        const currentWork = activeWorkers.map(w => 
                            `Worker ${w.worker_id}: ${w.current_step} (${w.zone_name})`
                        ).join(', ');
                        setMinigameGenerationStatus(`Generating questions... ${completedWorkers.length}/${workerStatus.workers.length} workers completed. Active: ${currentWork}`);
                    } else {
                        setMinigameGenerationStatus(`Processing... ${completedWorkers.length}/${workerStatus.workers.length} workers completed`);
                    }
                } else {
                    setMinigameGenerationStatus(`Generating questions... ${status.overall_progress.total_questions_generated || 0} questions generated`);
                }
                
                // Stop polling if completed or error
                if (status.status === 'completed' || status.status === 'error') {
                    clearInterval(pollInterval);
                    
                    // Clear session from localStorage
                    localStorage.removeItem('minigame_generation_session');
                    setActiveMinigameSession(null);
                    
                    if (status.status === 'completed') {
                        setMinigameGenerationStatus(`Successfully generated ${status.overall_progress.total_questions_generated || 'multiple'} minigame questions!`);
                        await fetchQuestions(); // Refresh the questions list
                        
                        // Clear success message after 10 seconds
                        setTimeout(() => {
                            setMinigameGenerationStatus('');
                        }, 10000);
                    } else {
                        setMinigameGenerationStatus('Generation failed. Please try again.');
                        setTimeout(() => {
                            setMinigameGenerationStatus('');
                        }, 10000);
                    }
                }
            } catch (error: any) {
                console.error('Error polling minigame generation status:', error);
                clearInterval(pollInterval);
                
                // Clear session from localStorage on error
                localStorage.removeItem('minigame_generation_session');
                setActiveMinigameSession(null);
                
                setError('Failed to check generation status');
                setMinigameGenerationStatus('');
            }
        }, 2000); // Poll every 2 seconds for more responsive worker tracking
        
        // Clear interval after 15 minutes to prevent infinite polling
        setTimeout(() => {
            clearInterval(pollInterval);
            localStorage.removeItem('minigame_generation_session');
            setActiveMinigameSession(null);
        }, 900000);
    };

    const getValidationStatusIcon = (status: string) => {
        switch (status) {
            case 'processed':
                return <FiCheck className="text-green-500" />;
            case 'pending':
                return <FiCheck className="text-yellow-500" />;
            default:
                return <FiCheck className="text-gray-500" />;
        }
    };

    return (
        <div className="space-y-4">
            {/* Filters and Action Buttons Container - Responsive Layout */}
            <div className="flex flex-wrap gap-3 mb-4 items-center">
                <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                    className="rounded-md border border-gray-300 p-2 min-w-[180px]"
                >
                    <option value="minigame">Minigame Questions</option>
                    <option value="preassessment">Pre-assessment Questions</option>
                </select>

                {questionType === 'minigame' && (
                    <>
                        <select
                            value={gameType}
                            onChange={(e) => setGameType(e.target.value as GameType)}
                            className="rounded-md border border-gray-300 p-2 min-w-[150px]"
                        >
                            <option value="all">All Types</option>
                            <option value="coding">Coding Questions</option>
                            <option value="non_coding">Non-Coding Questions</option>
                        </select>

                        <select
                            value={validationStatus}
                            onChange={(e) => setValidationStatus(e.target.value as ValidationStatus)}
                            className="rounded-md border border-gray-300 p-2 min-w-[150px]"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending (Default)</option>
                            <option value="processed">Processed</option>
                        </select>
                    </>
                )}

                <button
                    onClick={() => setIsBulkModalOpen(true)}
                    className="bg-[#3776AB] text-white px-4 py-2 rounded hover:brightness-110 transition-all whitespace-nowrap"
                >
                    Bulk Generate Questions
                </button>

                <button
                    onClick={handleBulkDifficultyCheck}
                    disabled={isCheckingDifficulty || loading}
                    className="bg-orange-500 text-white px-4 py-2 rounded hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    title="Check difficulty for all questions (AI model not connected yet)"
                >
                    {isCheckingDifficulty ? 'Checking...' : 'Check Difficulty'}
                </button>

                {activePreAssessmentSession && (
                    <button
                        onClick={() => handleCancelGeneration(activePreAssessmentSession, 'preassessment')}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:brightness-110 transition-all whitespace-nowrap"
                        title="Cancel pre-assessment generation"
                    >
                        Cancel Generation
                    </button>
                )}

                {activeMinigameSession && (
                    <button
                        onClick={() => handleCancelGeneration(activeMinigameSession, 'minigame')}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:brightness-110 transition-all whitespace-nowrap"
                        title="Cancel minigame generation"
                    >
                        Cancel Generation
                    </button>
                )}
            </div>

                <BulkGenerationModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                questionType={questionType}
                onSubmit={async (params: BulkGenerationParams | PreAssessmentBulkGenerationParams) => {
                    try {
                        setError('');
                        setGenerationSuccess('');
                        setIsBulkModalOpen(false);
                        
                        if (questionType === 'minigame') {
                            const response = await adminApi.generateBulkQuestions(params as BulkGenerationParams);
                            
                            if (response.session_id) {
                                // Start inline real-time tracking
                                setMinigameGenerationStatus('Starting minigame question generation...');
                                pollMinigameGenerationStatus(response.session_id);
                            } else {
                                // Immediate completion
                                setMinigameGenerationStatus(response.message);
                                setTimeout(() => setMinigameGenerationStatus(''), 10000);
                                await fetchQuestions();
                            }
                        } else {
                            // Handle preassessment generation
                            setGenerationSuccess('Pre-assessment question generation is running...');
                            
                            const response = await adminApi.generatePreAssessmentQuestions(params as PreAssessmentBulkGenerationParams);
                            
                            if (response.session_id) {
                                // Get initial status immediately
                                try {
                                    const initialStatus = await adminApi.getPreAssessmentGenerationStatus(response.session_id);
                                    setGenerationSuccess(`Pre-assessment generation: ${initialStatus.questions_generated} questions generated...`);
                                } catch (err) {
                                    console.warn('Could not get initial status, will start polling anyway');
                                }
                                
                                // Start polling for status updates
                                pollPreAssessmentStatus(response.session_id);
                            } else {
                                // Immediate completion (fallback case)
                                setGenerationSuccess('Pre-assessment questions generated successfully');
                                await fetchQuestions();
                            }
                        }
                    } catch (err: any) {
                        setError(err.message || 'Failed to generate questions');
                    }
                }}
            />

            <AdminTable
                title={questionType === 'minigame' ? 'Minigame Questions' : 'Pre-assessment Questions'}
                loading={loading}
                error={error}
                items={questionType === 'minigame' ? (filteredQuestions || []) : (preassessmentQuestions || [])}
                total={questionType === 'minigame' ? questionsData?.count : preassessmentData?.count}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                itemsPerPage={10}
                headerColumns={questionType === 'minigame' 
                    ? ['Question', 'Zone', 'Topic', 'Subtopic', 'Type', 'Difficulty', 'Status', 'Actions']
                    : ['Question', 'Topics', 'Difficulty', 'Order', 'Actions']
                }
                renderRow={(item: GeneratedQuestion | PreAssessmentQuestion) => {
                    if (questionType === 'minigame') {
                        const question = item as GeneratedQuestion;
                        return (
                            <tr key={question.id}>
                                <td className="px-3 py-3">
                                    <div className="line-clamp-2 text-sm max-w-[400px]">{question.question_preview || question.question_text || 'No question text'}</div>
                                </td>
                                <td className="px-3 py-3 text-sm">
                                    <div className="line-clamp-1 max-w-[150px]">{question.topic?.zone?.name || 'Unknown Zone'}</div>
                                </td>
                                <td className="px-3 py-3 text-sm">
                                    <div className="line-clamp-1 max-w-[150px]">{question.topic?.name || 'Unknown Topic'}</div>
                                </td>
                                <td className="px-3 py-3 text-sm">
                                    <div className="line-clamp-1 max-w-[150px]">{question.subtopic?.name || 'Unknown Subtopic'}</div>
                                </td>
                                <td className="px-3 py-3 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                                        question.game_type === 'coding' 
                                            ? 'bg-blue-100 text-blue-800' 
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {question.game_type === 'coding' ? 'Coding' : question.game_type === 'non_coding' ? 'Non-Coding' : 'Unknown'}
                                    </span>
                                </td>
                                <td className="px-3 py-3 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs capitalize whitespace-nowrap ${
                                        question.estimated_difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                                        question.estimated_difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                        question.estimated_difficulty === 'advanced' ? 'bg-orange-100 text-orange-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {question.estimated_difficulty || 'Unknown'}
                                    </span>
                                </td>
                                <td className="px-3 py-3 text-sm">
                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                        {getValidationStatusIcon(question.validation_status || 'pending')}
                                        <span className="capitalize text-xs">{(question.validation_status || 'pending').replace('_', ' ')}</span>
                                    </div>
                                </td>
                                <td className="px-3 py-3 text-center">
                                    <div className="flex justify-center space-x-1">
                                        <button
                                            onClick={() => handleMinigameEdit(question)}
                                            className="p-1 text-gray-600 hover:text-yellow-600 transition-colors"
                                            title="Edit"
                                        >
                                            <FiEdit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(question.id)}
                                            className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                                            title="Delete"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    } else {
                        const question = item as PreAssessmentQuestion;
                        return (
                            <tr key={question.id}>
                                <td className="px-3 py-3">
                                    <div className="line-clamp-2 text-sm max-w-[400px]">{question.question_text || 'No question text'}</div>
                                </td>
                                <td className="px-3 py-3">
                                    <div className="line-clamp-1 text-sm max-w-[200px]">
                                        {question.topic_ids?.join(', ') || 'No topics'}
                                    </div>
                                </td>
                                <td className="px-3 py-3 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs capitalize whitespace-nowrap ${
                                        question.estimated_difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                                        question.estimated_difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                        question.estimated_difficulty === 'advanced' ? 'bg-orange-100 text-orange-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {question.estimated_difficulty || 'Unknown'}
                                    </span>
                                </td>
                                <td className="px-3 py-3 text-sm text-center">
                                    {question.order || 0}
                                </td>
                                <td className="px-3 py-3 text-center">
                                    <div className="flex justify-center space-x-1">
                                        <button
                                            onClick={() => handleEdit(question)}
                                            className="p-1 text-gray-600 hover:text-yellow-600 transition-colors"
                                            title="Edit"
                                        >
                                            <FiEdit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(question.id)}
                                            className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                                            title="Delete"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    }
                }}
            />

            {generationSuccess && (
                <div className="mb-4 bg-green-100 text-green-700 p-3 rounded-md flex justify-between items-center">
                    <span>{generationSuccess}</span>
                    <div className="flex items-center space-x-2">
                        {activePreAssessmentSession && (
                            <button 
                                onClick={() => handleCancelGeneration(activePreAssessmentSession, 'preassessment')}
                                className="bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                        <button 
                            onClick={() => setGenerationSuccess('')}
                            className="ml-2 text-green-500 hover:text-green-700 text-lg"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {minigameGenerationStatus && (
                <div className="mb-4 bg-blue-100 text-blue-700 p-3 rounded-md flex justify-between items-center">
                    <span>{minigameGenerationStatus}</span>
                    <div className="flex items-center space-x-2">
                        {activeMinigameSession && (
                            <button 
                                onClick={() => handleCancelGeneration(activeMinigameSession, 'minigame')}
                                className="bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                        <button 
                            onClick={() => setMinigameGenerationStatus('')}
                            className="ml-2 text-blue-500 hover:text-blue-700 text-lg"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {activeMinigameSession && (
                <div className="mb-4 flex items-center gap-2">
                    <span className="text-sm text-gray-600">Minigame generation in progress...</span>
                    <button
                        onClick={() => {
                            localStorage.removeItem('minigame_generation_session');
                            setActiveMinigameSession(null);
                            setMinigameGenerationStatus('');
                        }}
                        className="bg-red-500 text-white px-3 py-1 text-sm rounded hover:brightness-110 transition-all"
                        title="Stop minigame generation tracking"
                    >
                        Stop Tracking
                    </button>
                </div>
            )}

            {difficultyCheckResult && (
                <div className="mb-4 bg-orange-100 text-orange-700 p-3 rounded-md">
                    {difficultyCheckResult}
                    <button 
                        onClick={() => setDifficultyCheckResult('')}
                        className="ml-2 text-orange-500 hover:text-orange-700"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Edit Pre-Assessment Question Modal */}
            {isEditModalOpen && editingQuestion && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">Edit Pre-Assessment Question</h3>
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const updatedData = {
                                question_text: formData.get('question_text') as string,
                                topic_ids: (formData.get('topic_ids') as string).split(',').map(t => parseInt(t.trim())).filter(n => !isNaN(n)),
                                estimated_difficulty: formData.get('estimated_difficulty') as 'beginner' | 'intermediate' | 'advanced' | 'master',
                                order: parseInt(formData.get('order') as string)
                            };
                            handleSaveEdit(updatedData);
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Question Text
                                    </label>
                                    <textarea
                                        name="question_text"
                                        defaultValue={editingQuestion.question_text}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Topic IDs (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        name="topic_ids"
                                        defaultValue={editingQuestion.topic_ids.join(', ')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Difficulty
                                    </label>
                                    <select
                                        name="estimated_difficulty"
                                        defaultValue={editingQuestion.estimated_difficulty}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Order
                                    </label>
                                    <input
                                        type="number"
                                        name="order"
                                        defaultValue={editingQuestion.order}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Minigame Question Modal */}
            {isMinigameEditModalOpen && editingMinigameQuestion && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">Edit Minigame Question</h3>
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const updatedData = {
                                question_text: formData.get('question_text') as string,
                                correct_answer: formData.get('correct_answer') as string,
                                estimated_difficulty: formData.get('estimated_difficulty') as 'beginner' | 'intermediate' | 'advanced' | 'master',
                                game_type: formData.get('game_type') as 'coding' | 'non_coding'
                            };
                            handleMinigameSaveEdit(updatedData);
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Question Text
                                    </label>
                                    <textarea
                                        name="question_text"
                                        defaultValue={editingMinigameQuestion.question_preview || editingMinigameQuestion.question_text || ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={4}
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Correct Answer
                                    </label>
                                    <textarea
                                        name="correct_answer"
                                        defaultValue={editingMinigameQuestion.correct_answer}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Difficulty
                                    </label>
                                    <select
                                        name="estimated_difficulty"
                                        defaultValue={editingMinigameQuestion.estimated_difficulty}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                        <option value="master">Master</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Game Type
                                    </label>
                                    <select
                                        name="game_type"
                                        defaultValue={editingMinigameQuestion.game_type}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="coding">Coding</option>
                                        <option value="non_coding">Non-Coding</option>
                                    </select>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-md">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Read-Only Information</h4>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p><strong>Topic:</strong> {editingMinigameQuestion.topic.name}</p>
                                        <p><strong>Subtopic:</strong> {editingMinigameQuestion.subtopic.name}</p>
                                        <p><strong>Zone:</strong> {editingMinigameQuestion.topic.zone.name}</p>
                                        <p><strong>Status:</strong> {editingMinigameQuestion.validation_status}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsMinigameEditModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionBank;

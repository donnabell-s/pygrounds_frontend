import { useState, useEffect } from 'react';
import { adminApi } from '../../../../api';
import type { GeneratedQuestion, PreAssessmentQuestion, BulkGenerationParams, PreAssessmentBulkGenerationParams, QuestionListResponse } from '../../../../types/questions';
import { AdminTable, BulkGenerationModal } from '../../../components/UI';
import StatusBadge from '../../../components/UI/StatusBadge';
import MinigameBulkGeneration from './MinigameBulkGeneration';
import { ADMIN_BUTTON_STYLES } from '../../../components/Layout';
import { FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi';

type QuestionType = 'minigame' | 'preassessment';
type GameType = 'all' | 'coding' | 'non_coding';
type ValidationStatus = 'all' | 'pending' | 'processed';
type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced' | 'master';

type BulkDifficultyCheckResponse = {
  status: "success" | "error";
  message?: string;
  results?: {
    total_checked: number;
    updated_count: number;
    unchanged_count: number;
    error_count: number;
  };
};


const QuestionBank = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [questionType, setQuestionType] = useState<QuestionType>('minigame');
    const [gameType, setGameType] = useState<GameType>('all');
    const [validationStatus, setValidationStatus] = useState<ValidationStatus>('all');
    const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
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
    const [showMinigameBulkGeneration, setShowMinigameBulkGeneration] = useState(false);



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
        }, [questionType, gameType, validationStatus, difficultyFilter]);    // Separate effect for page changes to avoid infinite loops
    useEffect(() => {
        fetchQuestions();
    }, [currentPage]);

    const fetchQuestions = async (options?: { silent?: boolean }) => {
        const silent = options?.silent ?? false;
        try {
            if (!silent) {
                setLoading(true);
            }
            if (questionType === 'minigame') {
                const response = await adminApi.getAllQuestions({
                    game_type: gameType === 'all' ? undefined : gameType as 'coding' | 'non_coding',
                    validation_status: validationStatus === 'all' ? undefined : validationStatus as 'pending' | 'processed',
                    difficulty: difficultyFilter === 'all' ? undefined : difficultyFilter,
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
            if (!silent) {
                setLoading(false);
            }
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
        answer_options: string[];
        correct_answer: string;
        topic_ids: number[];
        estimated_difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
        order: number;
    }) => {
        if (!editingQuestion) return;

        try {
            // Only send the allowed fields for partial update
            const updatePayload = {
                question_text: updatedData.question_text,
                answer_options: updatedData.answer_options,
                correct_answer: updatedData.correct_answer,
                topic_ids: updatedData.topic_ids,
                subtopic_ids: editingQuestion.subtopic_ids, // Include existing subtopic_ids
                estimated_difficulty: updatedData.estimated_difficulty,
                order: updatedData.order
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
        try {
            setLoading(true);
            const fullQuestionData = await adminApi.getAdminQuestion(question.id);
            console.log("Full Question Data for Editing:", fullQuestionData); // Log the full data
            setEditingMinigameQuestion(fullQuestionData);
            setIsMinigameEditModalOpen(true);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch full question data');
        } finally {
            setLoading(false);
        }
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
    setError("");
    setDifficultyCheckResult("");

    // Build payload based on CURRENT UI filters
    const payload = {
    questionType,
    gameType: questionType === "minigame" && gameType !== "all" ? gameType : undefined,
    validationStatus: questionType === "minigame" && validationStatus !== "all" ? validationStatus : undefined,
    difficultyFilter: difficultyFilter !== "all" ? difficultyFilter : undefined,
    };


    const response: BulkDifficultyCheckResponse =
      await adminApi.bulkCheckDifficulty(payload);

    // error status
    if (response.status !== "success") {
      setDifficultyCheckResult(`❌ ${response.message || "Difficulty check failed."}`);
      return;
    }

    // success but no results (allowed)
    if (!response.results) {
      setDifficultyCheckResult(`✅ ${response.message || "Difficulty check done."}`);
      return;
    }

    const r = response.results;
    const summary =
      `✅ Difficulty Check Completed!\n` +
      `Total checked: ${r.total_checked}\n` +
      `Updated: ${r.updated_count}\n` +
      `Unchanged: ${r.unchanged_count}\n` +
      `Errors: ${r.error_count}`;

    setDifficultyCheckResult(summary);

    // If admin was viewing Pending, after check they become Processed
    if (questionType === "minigame" && validationStatus === "pending") {
      setValidationStatus("processed");
    }

    setTimeout(() => {
      setDifficultyCheckResult("");
      fetchQuestions();
    }, 2000);
  } catch (err: any) {
    setError(err?.message || "Failed to check question difficulty");
  } finally {
    setIsCheckingDifficulty(false);
  }
};


    const pollPreAssessmentStatus = async (sessionId: string) => {
        // Save session to localStorage for persistence across page refreshes
        localStorage.setItem('preassessment_generation_session', sessionId);
        setActivePreAssessmentSession(sessionId);

        let lastSeenQuestionsGenerated = -1;
        let lastRefreshAt = 0;
        
        const pollInterval = setInterval(async () => {
            try {
                console.log('Polling pre-assessment status for session:', sessionId);
                const status = await adminApi.getPreAssessmentGenerationStatus(sessionId);
                console.log('Pre-assessment status response:', status);
                
                // Update message with progress
                setGenerationSuccess(`Pre-assessment generation: ${status.questions_generated} questions generated...`);

                // Refresh table when backend reports new questions
                if (status.questions_generated > lastSeenQuestionsGenerated) {
                    lastSeenQuestionsGenerated = status.questions_generated;
                    const now = Date.now();
                    if (lastSeenQuestionsGenerated > 0 && now - lastRefreshAt >= 5000) {
                        lastRefreshAt = now;
                        await fetchQuestions({ silent: true });
                    }
                }
                
                // Stop polling if completed or error
                if (status.status === 'completed' || status.status === 'error') {
                    clearInterval(pollInterval);
                    clearTimeout(pollTimeout);
                    
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
                clearTimeout(pollTimeout);
                
                // Clear session from localStorage on error
                localStorage.removeItem('preassessment_generation_session');
                setActivePreAssessmentSession(null);
                
                setError('Failed to check generation status');
                setGenerationSuccess('');
            }
        }, 3000); // Poll every 3 seconds

        const pollTimeout = window.setTimeout(() => {
            // Only time out the same active session
            if (localStorage.getItem('preassessment_generation_session') !== sessionId) {
                return;
            }

            clearInterval(pollInterval);
            localStorage.removeItem('preassessment_generation_session');
            setActivePreAssessmentSession(null);
            setGenerationSuccess('');
            setError('');
            window.location.reload();
        }, 600000);
    };

    const pollMinigameGenerationStatus = async (sessionId: string) => {
        // Save session to localStorage for persistence across page refreshes
        localStorage.setItem('minigame_generation_session', sessionId);
        setActiveMinigameSession(sessionId);

        let lastSeenQuestionsGenerated = -1;
        let lastRefreshAt = 0;
        
        const pollInterval = setInterval(async () => {
            try {
                console.log('Polling minigame generation status for session:', sessionId);
                const status = await adminApi.getGenerationStatus(sessionId);
                console.log('Minigame generation status response:', status);
                console.log('Worker summary from status:', status.worker_summary);
                console.log('Overall progress:', status.overall_progress);
                console.log('Session status:', status.status);
                
                // Use the worker_summary from the main status response
                const workerSummary = status.worker_summary;
                const overallProgress = status.overall_progress;
                const questionsGenerated = overallProgress?.total_questions_generated ?? 0;

                // Refresh table when backend reports new questions
                if (questionsGenerated > lastSeenQuestionsGenerated) {
                    lastSeenQuestionsGenerated = questionsGenerated;
                    const now = Date.now();
                    if (lastSeenQuestionsGenerated > 0 && now - lastRefreshAt >= 5000) {
                        lastRefreshAt = now;
                        await fetchQuestions({ silent: true });
                    }
                }
                
                if (workerSummary && workerSummary.total_workers > 0) {
                    const activeWorkers = workerSummary.active_workers;
                    const completedWorkers = workerSummary.completed_workers;
                    const failedWorkers = workerSummary.failed_workers;
                    const totalWorkers = workerSummary.total_workers;
                    const pendingWorkers = totalWorkers - activeWorkers - completedWorkers - failedWorkers;
                    
                    let statusMessage = '';
                    
                    if (activeWorkers > 0) {
                        statusMessage = `🔄 Generating questions... ${activeWorkers} workers active, ${completedWorkers} questions`;
                    } else if (pendingWorkers > 0) {
                        statusMessage = `⏳ Starting workers... ${pendingWorkers} workers pending, ${completedWorkers} questions`;
                    } else if (completedWorkers > 0) {
                        statusMessage = `✅ Processing... ${completedWorkers}/${totalWorkers} workers completed`;
                    } else {
                        statusMessage = `🚀 Initializing ${totalWorkers} workers...`;
                    }

                    if (questionsGenerated > 0) {
                        statusMessage += ` | ${questionsGenerated} questions`;
                    }
                    
                    if (failedWorkers > 0) {
                        statusMessage += ` | ⚠️ ${failedWorkers} failed`;
                    }
                    
                    setMinigameGenerationStatus(statusMessage);
                } else {
                    if (questionsGenerated > 0) {
                        setMinigameGenerationStatus(`Generating questions... ${questionsGenerated} questions`);
                    } else {
                        setMinigameGenerationStatus('Generating questions...');
                    }
                }
                
                // Stop polling if completed or error
                if (status.status === 'completed' || status.status === 'error') {
                    clearInterval(pollInterval);
                    clearTimeout(pollTimeout);
                    
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
                clearTimeout(pollTimeout);
                
                // Clear session from localStorage on error
                localStorage.removeItem('minigame_generation_session');
                setActiveMinigameSession(null);
                
                setError('Failed to check generation status');
                setMinigameGenerationStatus('');
            }
        }, 2000); // Poll every 2 seconds for more responsive worker tracking

        const pollTimeout = window.setTimeout(() => {
            // Only time out the same active session
            if (localStorage.getItem('minigame_generation_session') !== sessionId) {
                return;
            }

            clearInterval(pollInterval);
            localStorage.removeItem('minigame_generation_session');
            setActiveMinigameSession(null);
            setMinigameGenerationStatus('');
            setError('');
            window.location.reload();
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

    // Show minigame bulk generation page if requested
    if (showMinigameBulkGeneration) {
        return (
            <MinigameBulkGeneration
                onBack={() => setShowMinigameBulkGeneration(false)}
                onSubmit={async (params: BulkGenerationParams) => {
                    try {
                        setError('');
                        setMinigameGenerationStatus('');
                        setShowMinigameBulkGeneration(false);
                        
                        const response = await adminApi.generateBulkQuestions(params);
                        
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
                    } catch (err: any) {
                        setError(err.message || 'Failed to generate questions');
                        setShowMinigameBulkGeneration(false);
                    }
                }}
            />
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-semibold text-gray-800">Question Bank</h2>
                <p className="text-sm text-gray-500">Manage and review minigame and pre-assessment questions.</p>
            </div>
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

                        <select
                            value={difficultyFilter}
                            onChange={(e) => setDifficultyFilter(e.target.value as 'all' | 'beginner' | 'intermediate' | 'advanced' | 'master')}
                            className="rounded-md border border-gray-300 p-2 min-w-[150px]"
                        >
                            <option value="all">All Difficulties</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="master">Master</option>
                        </select>
                    </>
                )}

                <button
                    onClick={() => {
                        if (questionType === 'minigame') {
                            setShowMinigameBulkGeneration(true);
                        } else {
                            setIsBulkModalOpen(true);
                        }
                    }}
                    className={ADMIN_BUTTON_STYLES.PRIMARY}
                >
                    Bulk Generate Questions
                </button>


                <button
                    onClick={handleBulkDifficultyCheck}
                    disabled={isCheckingDifficulty || loading}
                    className={`${ADMIN_BUTTON_STYLES.WARNING} disabled:opacity-50 disabled:cursor-not-allowed`}
                    title="Check difficulty for all questions (AI model not connected yet)"
                >
                    {isCheckingDifficulty ? 'Checking...' : 'Check Difficulty'}
                </button>

                {activePreAssessmentSession && (
                    <button
                        onClick={() => handleCancelGeneration(activePreAssessmentSession, 'preassessment')}
                        className={ADMIN_BUTTON_STYLES.DANGER}
                        title="Cancel pre-assessment generation"
                    >
                        Cancel Generation
                    </button>
                )}

                {activeMinigameSession && (
                    <button
                        onClick={() => handleCancelGeneration(activeMinigameSession, 'minigame')}
                        className={ADMIN_BUTTON_STYLES.DANGER}
                        title="Cancel minigame generation"
                    >
                        Cancel Generation
                    </button>
                )}
            </div>

                <BulkGenerationModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                onSubmit={async (params: PreAssessmentBulkGenerationParams) => {
                    try {
                        setError('');
                        setGenerationSuccess('');
                        setIsBulkModalOpen(false);
                        
                        // Handle preassessment generation
                        setGenerationSuccess('Pre-assessment question generation is running...');
                        
                        const response = await adminApi.generatePreAssessmentQuestions(params);
                        
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
                    } catch (err: any) {
                        setError(err.message || 'Failed to generate questions');
                    }
                }}
            />

            <AdminTable
                title="Question Bank"
                loading={loading}
                error={error}
                items={questionType === 'minigame' ? (filteredQuestions || []) : (preassessmentQuestions || [])}
                total={questionType === 'minigame' ? questionsData?.count : preassessmentData?.count}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                itemsPerPage={10}
                headerColumns={questionType === 'minigame' 
                    ? ['ID', 'Question', 'Topic', 'Subtopic', 'Type', 'Difficulty', 'Status', 'Actions']
                    : ['ID', 'Question', 'Topics', 'Difficulty', 'Order', 'Actions']
                }
                renderRow={(item: GeneratedQuestion | PreAssessmentQuestion) => {
                    if (questionType === 'minigame') {
                        const question = item as GeneratedQuestion;
                        getValidationStatusIcon(question.validation_status || 'pending');
                        return (
                            <tr key={question.id}>
                                <td className="px-3 py-3 text-sm font-mono text-center">
                                    {question.id}
                                </td>
                                <td className="px-3 py-3">
                                    <div className="line-clamp-2 text-sm max-w-[400px]">{question.question_preview || question.question_text || 'No question text'}</div>
                                </td>
                                <td className="px-3 py-3 text-sm">
                                    <div className="line-clamp-1 max-w-[150px]">{question.topic?.name || 'Unknown Topic'}</div>
                                </td>
                                <td className="px-3 py-3 text-sm">
                                    <div className="line-clamp-1 max-w-[150px]">{question.subtopic?.name || 'Unknown Subtopic'}</div>
                                </td>
                                <td className="px-3 py-3 text-sm text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                                        question.game_type === 'coding' 
                                            ? 'bg-blue-100 text-blue-800' 
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {question.game_type === 'coding' ? 'Coding' : question.game_type === 'non_coding' ? 'Non-Coding' : 'Unknown'}
                                    </span>
                                </td>
                                <td className="px-3 py-3 text-sm text-center">
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
                                    <StatusBadge
                                        status={question.validation_status || 'pending'}
                                        size="sm"
                                    />
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
                                <td className="px-3 py-3 text-sm font-mono text-center">
                                    {question.id}
                                </td>
                                <td className="px-3 py-3">
                                    <div className="line-clamp-2 text-sm max-w-[400px]">{question.question_text || 'No question text'}</div>
                                </td>
                                <td className="px-3 py-3">
                                    <div className="line-clamp-1 text-sm max-w-[200px]">
                                        {question.topic_ids?.join(', ') || 'No topics'}
                                    </div>
                                </td>
                                <td className="px-3 py-3 text-sm text-center">
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
                <div className="mb-4 bg-green-100 text-green-700 p-3 rounded-md">
                    <span>{generationSuccess}</span>
                </div>
            )}

            {minigameGenerationStatus && (
                <div className="mb-4 bg-blue-100 text-blue-700 p-3 rounded-md">
                    <span>{minigameGenerationStatus}</span>
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
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">Edit Pre-Assessment Question</h3>
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const answerOptions = [
                                formData.get('answer_option_1') as string,
                                formData.get('answer_option_2') as string,
                                formData.get('answer_option_3') as string,
                                formData.get('answer_option_4') as string,
                            ].filter(option => option.trim() !== '');
                            
                            const correctAnswerIndex = parseInt(formData.get('correct_answer') as string);
                            const correctAnswer = answerOptions[correctAnswerIndex] || '';
                            
                            const updatedData = {
                                question_text: formData.get('question_text') as string,
                                answer_options: answerOptions,
                                correct_answer: correctAnswer,
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
                                        Answer Options
                                    </label>
                                    <div className="space-y-2">
                                        {[0, 1, 2, 3].map((index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    name="correct_answer"
                                                    value={index}
                                                    defaultChecked={editingQuestion.answer_options[index] === editingQuestion.correct_answer}
                                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                                                />
                                                <input
                                                    type="text"
                                                    name={`answer_option_${index + 1}`}
                                                    defaultValue={editingQuestion.answer_options[index] || ''}
                                                    placeholder={`Option ${index + 1}`}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Select the radio button next to the correct answer</p>
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
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">Edit Minigame Question (ID: {editingMinigameQuestion.id})</h3>
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const gameType = formData.get('game_type') as 'coding' | 'non_coding';
                            
                            const updatedData: any = {
                                question_text: formData.get('question_text') as string,
                                estimated_difficulty: formData.get('estimated_difficulty') as 'beginner' | 'intermediate' | 'advanced' | 'master',
                                game_type: gameType,
                            };

                            if (gameType === 'non_coding') {
                                updatedData.correct_answer = formData.get('correct_answer') as string;
                                updatedData.game_data = {
                                    explanation: formData.get('explanation') as string,
                                };
                            }

                            if (gameType === 'coding') {
                                let hidden_tests = editingMinigameQuestion?.game_data?.hidden_tests ?? [];
                                try {
                                    hidden_tests = JSON.parse(formData.get('hidden_tests') as string);
                                } catch { /* keep existing value */ }
                                updatedData.game_data = {
                                    correct_code: formData.get('correct_code') as string,
                                    sample_input: formData.get('sample_input') as string,
                                    sample_output: formData.get('sample_output') as string,
                                    hidden_tests,
                                    explanation: formData.get('explanation') as string,
                                    function_name: formData.get('function_name') as string,
                                    buggy_question_text: formData.get('buggy_question_text') as string,
                                    buggy_code: formData.get('buggy_code') as string,
                                    buggy_correct_code: formData.get('buggy_correct_code') as string,
                                    buggy_explanation: formData.get('buggy_explanation') as string,
                                };
                            }
                            
                            handleMinigameSaveEdit(updatedData);
                        }}>
                            <div className="space-y-4">
                                {/* Common Fields */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                                    <textarea name="question_text" defaultValue={editingMinigameQuestion.question_text || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} required />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                                        <select name="estimated_difficulty" defaultValue={editingMinigameQuestion.estimated_difficulty} className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                            <option value="master">Master</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Game Type</label>
                                        <select name="game_type" defaultValue={editingMinigameQuestion.game_type} className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                                            <option value="coding">Coding</option>
                                            <option value="non_coding">Non-Coding</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Conditional Fields */}
                                {editingMinigameQuestion.game_type === 'non_coding' ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                                            <textarea name="correct_answer" defaultValue={editingMinigameQuestion.correct_answer || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={2} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
                                            <textarea name="explanation" defaultValue={editingMinigameQuestion.game_data?.explanation || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} placeholder="Brief concept note shown after the game (30–40 words)" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Normal Variant */}
                                        <div className="p-4 border border-gray-200 rounded-lg">
                                            <h4 className="text-md font-semibold mb-3 text-blue-600">Normal Question Details</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Function Name</label>
                                                    <input type="text" name="function_name" defaultValue={editingMinigameQuestion.game_data?.function_name || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Correct Code (clean_solution)</label>
                                                    <textarea name="correct_code" defaultValue={editingMinigameQuestion.game_data?.correct_code || (editingMinigameQuestion.game_data as any)?.clean_solution || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm" rows={6} />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sample Input</label>
                                                        <input type="text" name="sample_input" defaultValue={editingMinigameQuestion.game_data?.sample_input || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sample Output</label>
                                                        <input type="text" name="sample_output" defaultValue={editingMinigameQuestion.game_data?.sample_output || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hidden Tests <span className="text-gray-400 font-normal">(JSON array)</span></label>
                                                    <textarea name="hidden_tests" defaultValue={JSON.stringify(editingMinigameQuestion.game_data?.hidden_tests ?? [], null, 2)} className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm" rows={4} placeholder='[{"input": "(1,)", "expected_output": "1"}]' />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Explanation <span className="text-gray-400 font-normal">(shown after Hangman)</span></label>
                                                    <textarea name="explanation" defaultValue={editingMinigameQuestion.game_data?.explanation || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} placeholder="Cover what the function does, a common beginner mistake, and the key concept. 30–40 words." />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Buggy Variant */}
                                        <div className="p-4 border border-gray-200 rounded-lg">
                                            <h4 className="text-md font-semibold mb-3 text-red-600">Buggy Question Details</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Buggy Question Text</label>
                                                    <textarea name="buggy_question_text" defaultValue={editingMinigameQuestion.game_data?.buggy_question_text || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={2} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Buggy Code (code_shown_to_student)</label>
                                                    <textarea name="buggy_code" defaultValue={editingMinigameQuestion.game_data?.buggy_code || (editingMinigameQuestion.game_data as any)?.code_shown_to_student || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm" rows={6} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bug-Fixed Code (code_with_bug_fixed)</label>
                                                    <textarea name="buggy_correct_code" defaultValue={editingMinigameQuestion.game_data?.buggy_correct_code || (editingMinigameQuestion.game_data as any)?.code_with_bug_fixed || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm" rows={6} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Buggy Code Explanation</label>
                                                    <textarea name="buggy_explanation" defaultValue={editingMinigameQuestion.game_data?.buggy_explanation || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
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

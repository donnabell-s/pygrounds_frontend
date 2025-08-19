import { useState, useEffect } from 'react';
import { adminQuestionApi } from '../../../../api';
import type { GeneratedQuestion, PreAssessmentQuestion, BulkGenerationParams, PreAssessmentBulkGenerationParams } from '../../../../types/questions';
import { AdminTable, BulkGenerationModal } from '../../../components/UI';
import { FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';

type QuestionType = 'minigame' | 'preassessment';
type GameType = 'all' | 'coding' | 'non_coding';

const QuestionBank = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [questionType, setQuestionType] = useState<QuestionType>('minigame');
    const [gameType, setGameType] = useState<GameType>('all');
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [minigameQuestions, setMinigameQuestions] = useState<GeneratedQuestion[]>([]);
    const [preassessmentQuestions, setPreassessmentQuestions] = useState<PreAssessmentQuestion[]>([]);
    const [totalQuestions, setTotalQuestions] = useState(0);

    useEffect(() => {
        fetchQuestions();
    }, [questionType, gameType, currentPage]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            if (questionType === 'minigame') {
                const response = await adminQuestionApi.getAllQuestions(currentPage);
                setMinigameQuestions(response.results);
                setTotalQuestions(response.total);
            } else {
                const response = await adminQuestionApi.getAdminPreAssessmentQuestions(currentPage);
                setPreassessmentQuestions(response.results);
                setTotalQuestions(response.total);
            }
        } catch (err: any) {
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
                await adminQuestionApi.deleteAdminQuestion(id);
            } else {
                await adminQuestionApi.deleteAdminPreAssessmentQuestion(id);
            }
            await fetchQuestions();
        } catch (err: any) {
            setError(err.message || 'Failed to delete question');
        }
    };

    const filteredMinigameQuestions = gameType === 'all' 
        ? minigameQuestions 
        : minigameQuestions.filter(q => q.game_type === gameType);

    const getValidationStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <FiCheck className="text-green-500" />;
            case 'rejected':
                return <FiX className="text-red-500" />;
            case 'needs_review':
                return <FiCheck className="text-yellow-500" />;
            default:
                return <FiCheck className="text-gray-500" />;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-4 mb-4">
                <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                    className="rounded-md border border-gray-300 p-2"
                >
                    <option value="minigame">Minigame Questions</option>
                    <option value="preassessment">Pre-assessment Questions</option>
                </select>

                {questionType === 'minigame' && (
                    <select
                        value={gameType}
                        onChange={(e) => setGameType(e.target.value as GameType)}
                        className="rounded-md border border-gray-300 p-2"
                    >
                        <option value="all">All Types</option>
                        <option value="coding">Coding</option>
                        <option value="non_coding">Non-Coding</option>
                    </select>
                )}

                <button
                    onClick={() => setIsBulkModalOpen(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                    Bulk Generate Questions
                </button>
            </div>

                <BulkGenerationModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                questionType={questionType}
                onSubmit={async (params: BulkGenerationParams | PreAssessmentBulkGenerationParams) => {
                    try {
                        setLoading(true);
                        if (questionType === 'minigame') {
                            await adminQuestionApi.generateBulkQuestions(params as BulkGenerationParams);
                        } else {
                            await adminQuestionApi.generatePreAssessmentQuestions(params as PreAssessmentBulkGenerationParams);
                        }
                        await fetchQuestions();
                        setIsBulkModalOpen(false);
                    } catch (err: any) {
                        setError(err.message || 'Failed to generate questions');
                    } finally {
                        setLoading(false);
                    }
                }}
            />            <AdminTable
                title={questionType === 'minigame' ? 'Minigame Questions' : 'Pre-assessment Questions'}
                loading={loading}
                error={error}
                items={questionType === 'minigame' ? filteredMinigameQuestions : preassessmentQuestions}
                total={totalQuestions}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onAdd={() => {/* TODO: Implement add */}}
                headerColumns={questionType === 'minigame' 
                    ? ['Question', 'Type', 'Difficulty', 'Status', 'Actions']
                    : ['Question', 'Topics', 'Difficulty', 'Order', 'Actions']
                }
                renderRow={(item: GeneratedQuestion | PreAssessmentQuestion) => {
                    if (questionType === 'minigame') {
                        const question = item as GeneratedQuestion;
                        return (
                            <tr key={question.id}>
                                <td className="px-4 py-4 w-[30%]">
                                    <div className="line-clamp-2 text-sm">{question.question_text}</div>
                                </td>
                                <td className="px-4 py-4 text-sm">
                                    {question.game_type === 'coding' ? 'Coding' : 'Non-Coding'}
                                </td>
                                <td className="px-4 py-4 text-sm capitalize">
                                    {question.estimated_difficulty}
                                </td>
                                <td className="px-4 py-4 text-sm">
                                    {getValidationStatusIcon(question.validation_status)}
                                </td>
                                <td className="px-4 py-4 w-[84px] text-right">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => {/* TODO: Implement edit */}}
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
                                <td className="px-4 py-4 w-[30%]">
                                    <div className="line-clamp-2 text-sm">{question.question_text}</div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="line-clamp-1 text-sm">
                                        {question.topic_ids.join(', ')}
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-sm capitalize">
                                    {question.estimated_difficulty}
                                </td>
                                <td className="px-4 py-4 text-sm">
                                    {question.order}
                                </td>
                                <td className="px-4 py-4 w-[84px] text-right">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => {/* TODO: Implement edit */}}
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
        </div>
    );
};

export default QuestionBank;

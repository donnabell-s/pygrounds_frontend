import { useState, useEffect } from 'react';
import AdminModal from './AdminModal';
import type { SingleGenerationParams } from '../../../../types/questions';
import type { AdminSubtopic } from '../../../../types/adaptive';

interface SingleQuestionGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    subtopic: AdminSubtopic | null;
    onSubmit: (subtopicId: number, params: SingleGenerationParams) => Promise<void>;
}

const difficultyOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'master', label: 'Master' }
];

const gameTypeOptions = [
    { value: 'coding', label: 'Coding Questions' },
    { value: 'non_coding', label: 'Non-Coding Questions' }
];

export const SingleQuestionGenerationModal = ({ 
    isOpen, 
    onClose, 
    subtopic, 
    onSubmit 
}: SingleQuestionGenerationModalProps) => {
    const [formData, setFormData] = useState<SingleGenerationParams>({
        difficulty: 'beginner',
        game_type: 'non_coding',
        num_questions: 3
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setFormData({
                difficulty: 'beginner',
                game_type: 'non_coding',
                num_questions: 3
            });
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subtopic) return;

        try {
            setLoading(true);
            setError('');
            await onSubmit(subtopic.id, formData);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to generate questions');
        } finally {
            setLoading(false);
        }
    };

    if (!subtopic) return null;

    return (
        <AdminModal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`Generate Questions: ${subtopic.name}`}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-md">
                        {error}
                    </div>
                )}

                <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600">
                        <strong>Topic:</strong> {subtopic.topic_name}
                    </p>
                    <p className="text-sm text-gray-600">
                        <strong>Subtopic:</strong> {subtopic.name}
                    </p>
                    <p className="text-sm text-gray-600">
                        <strong>Zone:</strong> {subtopic.zone_name}
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Game Type
                    </label>
                    <div className="flex gap-4">
                        {gameTypeOptions.map(option => (
                            <label key={option.value} className="flex items-center">
                                <input
                                    type="radio"
                                    checked={formData.game_type === option.value}
                                    onChange={() => setFormData(prev => ({ 
                                        ...prev, 
                                        game_type: option.value as 'coding' | 'non_coding'
                                    }))}
                                    className="mr-2"
                                />
                                {option.label}
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty Level
                    </label>
                    <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced' | 'master'
                        }))}
                        className="w-full rounded-md border border-gray-300 p-2"
                    >
                        {difficultyOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Questions
                    </label>
                    <input
                        type="number"
                        min={1}
                        max={20}
                        value={formData.num_questions}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            num_questions: parseInt(e.target.value) || 1
                        }))}
                        className="w-full rounded-md border border-gray-300 p-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">1-20 questions</p>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-[#3776AB] text-white rounded-md hover:brightness-110 disabled:opacity-50 transition-all"
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : `Generate ${formData.num_questions} Question${formData.num_questions !== 1 ? 's' : ''}`}
                    </button>
                </div>
            </form>
        </AdminModal>
    );
};

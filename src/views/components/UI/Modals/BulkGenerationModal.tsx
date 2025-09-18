import { useState, useEffect } from 'react';
import Modal from './Modal';
import type { BulkGenerationParams, PreAssessmentBulkGenerationParams } from '../../../../types/questions';
import type { AdminZone } from '../../../../types/adaptive';
import { adminApi } from '../../../../api';

interface BulkGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    questionType: 'minigame' | 'preassessment';
    onSubmit: (data: BulkGenerationParams | PreAssessmentBulkGenerationParams) => Promise<void>;
}

const difficultyLevels = ['beginner', 'intermediate', 'advanced', 'master'] as const;

export const BulkGenerationModal = ({ isOpen, onClose, onSubmit, questionType }: BulkGenerationModalProps) => {
    const [minigameData, setMinigameData] = useState<BulkGenerationParams>({
        game_type: 'non_coding',
        difficulty_levels: [],
        num_questions_per_subtopic: 5,
        zone_ids: []
    });
    const [preassessmentData, setPreassessmentData] = useState<PreAssessmentBulkGenerationParams>({
        total_questions: 20
    });
    const [zones, setZones] = useState<AdminZone[]>([]);
    const [topics, setTopics] = useState<{ id: number; name: string }[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (questionType === 'minigame') {
            fetchZones();
        } else {
            fetchTopics();
        }
    }, [questionType]);

    const fetchZones = async () => {
        try {
            const data = await adminApi.getAllZonesNoPagination();
            setZones(data);
        } catch (err) {
            console.error('Error fetching zones:', err);
        }
    };

    const fetchTopics = async () => {
        try {
            const data = await adminApi.getAllTopicsNoPagination();
            setTopics(data);
        } catch (err) {
            console.error('Error fetching topics:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            if (questionType === 'minigame') {
                // If no difficulty levels selected, default to all levels
                const submissionData = {
                    ...minigameData,
                    difficulty_levels: (minigameData.difficulty_levels?.length ?? 0) > 0 
                        ? minigameData.difficulty_levels 
                        : ['beginner', 'intermediate', 'advanced', 'master'] as ('beginner' | 'intermediate' | 'advanced' | 'master')[]
                };
                console.log('Submitting minigame data:', submissionData);
                await onSubmit(submissionData);
            } else {
                console.log('Submitting preassessment data:', preassessmentData);
                await onSubmit(preassessmentData);
            }
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to generate questions');
        } finally {
            setLoading(false);
        }
    };

    const toggleDifficulty = (difficulty: typeof difficultyLevels[number]) => {
        setMinigameData(prev => {
            const currentLevels = prev.difficulty_levels ?? [];
            return {
                ...prev,
                difficulty_levels: currentLevels.includes(difficulty)
                    ? currentLevels.filter(d => d !== difficulty)
                    : [...currentLevels, difficulty]
            };
        });
    };

    const toggleZone = (zoneId: number) => {
        setMinigameData(prev => ({
            ...prev,
            zone_ids: prev.zone_ids?.includes(zoneId)
                ? prev.zone_ids.filter(id => id !== zoneId)
                : [...(prev.zone_ids || []), zoneId]
        }));
    };

    const toggleTopic = (topicId: number) => {
        setPreassessmentData(prev => ({
            ...prev,
            topic_ids: prev.topic_ids?.includes(topicId)
                ? prev.topic_ids.filter(id => id !== topicId)
                : [...(prev.topic_ids || []), topicId]
        }));
    };

    if (questionType === 'preassessment') {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Generate Pre-assessment Questions">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Total Questions
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={50}
                            value={preassessmentData.total_questions}
                            onChange={(e) => setPreassessmentData(prev => ({
                                ...prev,
                                total_questions: parseInt(e.target.value) || 20
                            }))}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Topics (Optional)
                        </label>
                        <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                            {topics.map(topic => (
                                <label key={topic.id} className="flex items-center py-1">
                                    <input
                                        type="checkbox"
                                        checked={preassessmentData.topic_ids?.includes(topic.id) || false}
                                        onChange={() => toggleTopic(topic.id)}
                                        className="mr-2"
                                    />
                                    {topic.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#3776AB] text-white rounded-md hover:brightness-110 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Generating...' : 'Generate Questions'}
                        </button>
                    </div>
                </form>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Generate Minigame Questions">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-md">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Game Type
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                checked={minigameData.game_type === 'coding'}
                                onChange={() => setMinigameData(prev => ({ ...prev, game_type: 'coding' }))}
                                className="mr-2"
                            />
                            Coding Questions
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                checked={minigameData.game_type === 'non_coding'}
                                onChange={() => setMinigameData(prev => ({ ...prev, game_type: 'non_coding' }))}
                                className="mr-2"
                            />
                            Non-Coding Questions
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty Levels
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        Leave empty to generate questions for all difficulty levels
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {difficultyLevels.map(difficulty => (
                            <label key={difficulty} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={minigameData.difficulty_levels?.includes(difficulty) ?? false}
                                    onChange={() => toggleDifficulty(difficulty)}
                                    className="mr-2"
                                />
                                <span className="capitalize">{difficulty}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Questions per Subtopic
                    </label>
                    <input
                        type="number"
                        min={1}
                        max={50}
                        value={minigameData.num_questions_per_subtopic}
                        onChange={(e) => setMinigameData(prev => ({
                            ...prev,
                            num_questions_per_subtopic: parseInt(e.target.value) || 5
                        }))}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">1-50 questions per subtopic</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Zones (Optional)
                    </label>
                    <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                        {zones.map(zone => (
                            <label key={zone.id} className="flex items-center py-1">
                                <input
                                    type="checkbox"
                                    checked={minigameData.zone_ids?.includes(zone.id) || false}
                                    onChange={() => toggleZone(zone.id)}
                                    className="mr-2"
                                />
                                {zone.name} ({zone.topics_count} topics)
                            </label>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Leave empty to generate for all zones</p>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-[#3776AB] text-white rounded-md hover:brightness-110 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : 'Generate Questions'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

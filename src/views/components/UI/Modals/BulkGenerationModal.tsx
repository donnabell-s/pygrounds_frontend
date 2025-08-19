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
        subtopic_ids: [],
        game_type: 'non_coding',
        difficulties: [],
        count: 1
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
            const data = await adminApi.getAllZones();
            setZones(data);
        } catch (err) {
            console.error('Error fetching zones:', err);
        }
    };

    const fetchTopics = async () => {
        try {
            const data = await adminApi.getAllTopics();
            setTopics(data);
        } catch (err) {
            console.error('Error fetching topics:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (questionType === 'minigame') {
                if (minigameData.difficulties.length === 0) {
                    setError('Please select at least one difficulty level');
                    return;
                }
                await onSubmit(minigameData);
            } else {
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
        setMinigameData(prev => ({
            ...prev,
            difficulties: prev.difficulties.includes(difficulty)
                ? prev.difficulties.filter(d => d !== difficulty)
                : [...prev.difficulties, difficulty]
        }));
    };

    const toggleZone = (zoneId: number) => {
        setMinigameData(prev => ({
            ...prev,
            subtopic_ids: prev.subtopic_ids.includes(zoneId)
                ? prev.subtopic_ids.filter(id => id !== zoneId)
                : [...prev.subtopic_ids, zoneId]
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
                            Coding
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                checked={minigameData.game_type === 'non_coding'}
                                onChange={() => setMinigameData(prev => ({ ...prev, game_type: 'non_coding' }))}
                                className="mr-2"
                            />
                            Non-Coding
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty Levels
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {difficultyLevels.map(difficulty => (
                            <label key={difficulty} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={minigameData.difficulties.includes(difficulty)}
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
                        Number of Questions per Zone
                    </label>
                    <input
                        type="number"
                        min={1}
                        max={10}
                        value={minigameData.count}
                        onChange={(e) => setMinigameData(prev => ({
                            ...prev,
                            count: parseInt(e.target.value) || 1
                        }))}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Zones
                    </label>
                    <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                        {zones.map(zone => (
                            <label key={zone.id} className="flex items-center py-1">
                                <input
                                    type="checkbox"
                                    checked={minigameData.subtopic_ids.includes(zone.id)}
                                    onChange={() => toggleZone(zone.id)}
                                    className="mr-2"
                                />
                                {zone.name}
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
};

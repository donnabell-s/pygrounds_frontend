import { useState, useEffect } from 'react';
import Modal from './Modal';
import type { AdminSubtopic, AdminTopic } from '../../../../types/adaptive';

type FormData = {
    name: string;
    topic: number;
    concept_intent?: string;
    code_intent?: string;
};

type SubtopicModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        topic: number;
        name: string;
        concept_intent?: string;
        code_intent?: string;
    }) => Promise<void>;
    initialData?: AdminSubtopic;
    title: string;
    topics: AdminTopic[];
};

const SubtopicModal = ({ isOpen, onClose, onSubmit, initialData, title, topics }: SubtopicModalProps) => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        topic: 0,
        concept_intent: undefined,
        code_intent: undefined
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                topic: initialData.topic,
                concept_intent: initialData.concept_intent || undefined,
                code_intent: initialData.code_intent || undefined
            });
        } else {
            setFormData({
                name: '',
                topic: 0,
                concept_intent: undefined,
                code_intent: undefined
            });
        }
    }, [initialData]);

    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            setError('Name is required');
            return;
        }

        if (!formData.topic) {
            setError('Topic is required');
            return;
        }

        try {
            await onSubmit(formData);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to submit form');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-md">
                        {error}
                    </div>
                )}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        className="mt-1 w-full rounded-md border border-gray-300 p-2"
                    />
                </div>
                <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
                        Topic
                    </label>
                    <select
                        id="topic"
                        value={formData.topic}
                        onChange={(e) => setFormData((prev) => ({ ...prev, topic: parseInt(e.target.value) }))}
                        className="mt-1 w-full rounded-md border border-gray-300 p-2"
                    >
                        <option value="">Select a topic</option>
                        {topics.map((topic) => (
                            <option key={topic.id} value={topic.id}>
                                {topic.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="concept_intent" className="block text-sm font-medium text-gray-700">
                        Concept Intent
                    </label>
                    <textarea
                        id="concept_intent"
                        value={formData.concept_intent || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, concept_intent: e.target.value || undefined }))}
                        className="mt-1 w-full rounded-md border border-gray-300 p-2"
                        rows={3}
                    />
                </div>
                <div>
                    <label htmlFor="code_intent" className="block text-sm font-medium text-gray-700">
                        Code Intent
                    </label>
                    <textarea
                        id="code_intent"
                        value={formData.code_intent || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, code_intent: e.target.value || undefined }))}
                        className="mt-1 w-full rounded-md border border-gray-300 p-2"
                        rows={3}
                    />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="px-4 py-2 bg-[#3776AB] text-white rounded-md hover:brightness-110"
                    >
                        {initialData ? 'Update' : 'Create'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default SubtopicModal;

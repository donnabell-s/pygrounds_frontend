import { useState, useEffect } from 'react';
import { adminApi } from '../../../../api';
import { TopicModal, AdminTable } from '../../../../views/components/UI';
import type { AdminTopic, AdminZone } from '../../../../types/adaptive';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const ViewTopic = () => {
    const [topics, setTopics] = useState<AdminTopic[]>([]);
    const [zones, setZones] = useState<AdminZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [editingTopic, setEditingTopic] = useState<AdminTopic | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        Promise.all([fetchTopics(), fetchZones()]);
    }, []);

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
            setLoading(true);
            const data = await adminApi.getAllTopics();
            setTopics(data);
        } catch (err) {
            setError('Failed to fetch topics');
            console.error('Error fetching topics:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data: {
        zone: number;
        name: string;
        description: string;
    }) => {
        try {
            await adminApi.createTopic(data);
            await fetchTopics();
            setShowCreateForm(false);
            setError('');
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.response?.data?.detail || err.response?.data?.message || 'Failed to create topic';
            setError(errorMessage);
            console.error('Error creating topic:', err.response?.data);
            throw new Error(errorMessage);
        }
    };

    const handleUpdate = async (data: {
        zone: number;
        name: string;
        description: string;
    }) => {
        if (!editingTopic) return;

        try {
            await adminApi.updateTopic(editingTopic.id, data);
            await fetchTopics();
            setEditingTopic(null);
            setError('');
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.response?.data?.detail || err.response?.data?.message || 'Failed to update topic';
            setError(errorMessage);
            console.error('Error updating topic:', err.response?.data);
            throw new Error(errorMessage);
        }
    };

    const handleDelete = async (topicId: number) => {
        if (!window.confirm('Are you sure you want to delete this topic?')) {
            return;
        }

        try {
            await adminApi.deleteTopic(topicId);
            await fetchTopics();
        } catch (err) {
            setError('Failed to delete topic');
            console.error('Error deleting topic:', err);
        }
    };

    const startEdit = (topic: AdminTopic) => {
        setEditingTopic(topic);
    };

    return (
        <>
            <AdminTable
                title="Topic Management"
                loading={loading}
                error={error}
                items={topics}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onAdd={() => setShowCreateForm(true)}
                headerColumns={['Name', 'Description', 'Zone', 'Subtopics', 'Actions']}
                renderRow={(topic) => (
                    <tr key={topic.id}>
                        <td className="px-6 py-4 w-1/4">{topic.name}</td>
                        <td className="px-6 py-4 w-1/3">
                            <div className="max-w-xs truncate">
                                {topic.description || '-'}
                            </div>
                        </td>
                        <td className="px-6 py-4 w-1/6">{topic.zone_name}</td>
                        <td className="px-6 py-4 w-1/12 text-center">{topic.subtopics_count}</td>
                        <td className="px-6 py-4 w-1/12">
                            <div className="flex justify-start space-x-2">
                                <button
                                    onClick={() => startEdit(topic)}
                                    className="p-1 text-gray-600 hover:text-yellow-600 transition-colors"
                                    title="Edit"
                                >
                                    <FiEdit2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(topic.id)}
                                    className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                                    title="Delete"
                                >
                                    <FiTrash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </td>
                    </tr>
                )}
            />

            <TopicModal
                isOpen={showCreateForm || !!editingTopic}
                onClose={() => editingTopic ? setEditingTopic(null) : setShowCreateForm(false)}
                onSubmit={editingTopic ? handleUpdate : handleCreate}
                initialData={editingTopic || undefined}
                title={editingTopic ? 'Edit Topic' : 'Create New Topic'}
                zones={zones}
            />
        </>
    );
};

export default ViewTopic;

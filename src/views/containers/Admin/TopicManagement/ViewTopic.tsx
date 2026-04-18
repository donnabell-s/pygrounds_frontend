import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../../../api';
import { TopicModal, AdminTable, BackButton } from '../../../../views/components/UI';
import { ADMIN_BUTTON_STYLES } from '../../../components/Layout';
import type { AdminTopic, AdminZone } from '../../../../types/adaptive';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const ViewTopic = () => {
    const navigate = useNavigate();
    const [topics, setTopics] = useState<AdminTopic[]>([]);
    const [zones, setZones] = useState<AdminZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [editingTopic, setEditingTopic] = useState<AdminTopic | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        Promise.all([fetchTopics(), fetchZones()]);
    }, [currentPage]);

    const fetchZones = async () => {
        try {
            const data = await adminApi.getAllZonesNoPagination(); // Use non-paginated for dropdown
            setZones(data);
        } catch (err) {
            console.error('Error fetching zones:', err);
        }
    };

    const fetchTopics = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getAllTopics({
                page: currentPage,
                page_size: itemsPerPage
            });
            setTopics(data.results);
            setTotalCount(data.count);
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
        <div className="space-y-4">
            <BackButton onClick={() => navigate(-1)} />
            <AdminTable
                title="Topic Management"
                loading={loading}
                error={error}
                items={topics}
                total={totalCount}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onAdd={() => setShowCreateForm(true)}
                headerColumns={['ID', 'Name', 'Description', 'Zone Name', 'Subtopics Count', 'Actions']}
                itemsPerPage={itemsPerPage}
                renderRow={(topic) => (
                    <tr key={topic.id}>
                        <td className="px-6 py-4 w-1/12 text-sm font-mono text-center">{topic.id}</td>
                        <td className="px-6 py-4 w-1/4">{topic.name}</td>
                        <td className="px-6 py-4 w-1/3">
                            <div className="max-w-xs truncate">
                                {topic.description || '-'}
                            </div>
                        </td>
                        <td className="px-6 py-4 w-1/6">{topic.zone_name || 'No Zone Name'}</td>
                        <td className="px-6 py-4 w-1/12 text-center">{topic.subtopics_count !== undefined ? topic.subtopics_count : 0}</td>
                        <td className="px-6 py-4 w-1/12">
                            <div className="flex justify-start space-x-2">
                                <button
                                    onClick={() => startEdit(topic)}
                                    className={ADMIN_BUTTON_STYLES.ICON_PRIMARY}
                                    title="Edit"
                                >
                                    <FiEdit2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(topic.id)}
                                    className={ADMIN_BUTTON_STYLES.ICON_DANGER}
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
        </div>
    );
};

export default ViewTopic;

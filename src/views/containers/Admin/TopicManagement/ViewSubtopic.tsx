import { useState, useEffect } from 'react';
import { adminApi } from '../../../../api';
import { SubtopicModal, AdminTable } from '../../../../views/components/UI';
import SubtopicStatusTracker from '../../../components/Features/SubtopicStatusTracker';
import { ADMIN_BUTTON_STYLES } from '../../../components/Layout';
import type { AdminSubtopic, AdminTopic } from '../../../../types/adaptive';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

interface ExpandableTextProps {
    text: string;
    maxLength?: number;
}

const ExpandableText: React.FC<ExpandableTextProps> = ({ text, maxLength = 100 }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const needsTruncation = text.length > maxLength;
    const displayText = isExpanded ? text : text.slice(0, maxLength);

    return (
        <div className="group relative">
            <div className={`${!isExpanded ? 'line-clamp-2' : ''} text-sm`}>
                {displayText}
                {!isExpanded && needsTruncation && '...'}
            </div>
            {needsTruncation && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-blue-600 hover:text-blue-800 text-xs mt-1"
                >
                    {isExpanded ? 'Show Less' : 'Show More'}
                </button>
            )}
            {!isExpanded && needsTruncation && (
                <div className="invisible group-hover:visible absolute z-10 bg-gray-800 text-white p-2 rounded shadow-lg text-sm max-w-md mt-1">
                    {text}
                </div>
            )}
        </div>
    );
};

const ViewSubtopic = () => {
    const [subtopics, setSubtopics] = useState<AdminSubtopic[]>([]);
    const [topics, setTopics] = useState<AdminTopic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [editingSubtopic, setEditingSubtopic] = useState<AdminSubtopic | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        Promise.all([fetchSubtopics(), fetchTopics()]);
    }, [currentPage]);

    const fetchTopics = async () => {
        try {
            const data = await adminApi.getAllTopicsNoPagination(); // Use non-paginated for dropdown
            setTopics(data);
        } catch (err: any) {
            console.error('Error fetching topics:', err);
        }
    };

    const fetchSubtopics = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getAllSubtopics({
                page: currentPage,
                page_size: itemsPerPage
            });
            setSubtopics(data.results);
            setTotalCount(data.count);
        } catch (err: any) {
            setError(`Failed to fetch subtopics: ${err.message || 'Unknown error'}`);
            console.error('Error fetching subtopics:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data: Omit<AdminSubtopic, 'id'>) => {
        try {
            setError('');
            await adminApi.createSubtopic(data);
            await fetchSubtopics();
            setShowCreateForm(false);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to create subtopic';
            console.error('Error creating subtopic:', err.response?.data || err);
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const handleUpdate = async (data: Omit<AdminSubtopic, 'id'>) => {
        if (!editingSubtopic) return;

        try {
            setError('');
            await adminApi.updateSubtopic(editingSubtopic.id, data);
            await fetchSubtopics();
            setEditingSubtopic(null);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to update subtopic';
            console.error('Error updating subtopic:', err.response?.data || err);
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const handleDelete = async (subtopicId: number) => {
        if (!window.confirm('Are you sure you want to delete this subtopic?')) {
            return;
        }

        try {
            await adminApi.deleteSubtopic(subtopicId);
            await fetchSubtopics();
        } catch (err) {
            setError('Failed to delete subtopic');
            console.error('Error deleting subtopic:', err);
        }
    };

    const startEdit = (subtopic: AdminSubtopic) => {
        setEditingSubtopic(subtopic);
        setShowCreateForm(false);
    };

    return (
        <>
            <AdminTable
                title="Subtopic Management"
                loading={loading}
                error={error}
                items={subtopics}
                total={totalCount}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onAdd={() => setShowCreateForm(true)}
                headerColumns={['ID', 'Name', 'Topic', 'Concept Intent', 'Code Intent', 'Embedding Status', 'Actions']}
                itemsPerPage={itemsPerPage}
                renderRow={(subtopic) => (
                    <tr key={subtopic.id}>
                        <td className="px-6 py-4 w-1/12 text-sm font-mono text-center">{subtopic.id}</td>
                        <td className="px-6 py-4 w-1/6">
                            <div className="font-medium">{subtopic.name}</div>
                        </td>
                        <td className="px-6 py-4 w-1/12">
                            <div>
                                {topics.find(t => t.id === subtopic.topic)?.name || subtopic.topic_name || 'Unknown'}
                            </div>
                        </td>
                        <td className="px-6 py-4 w-1/4">
                            <ExpandableText text={subtopic.concept_intent || ''} maxLength={150} />
                        </td>
                        <td className="px-6 py-4 w-1/4">
                            <ExpandableText text={subtopic.code_intent || ''} maxLength={150} />
                        </td>
                        <td className="px-6 py-4 w-1/12">
                            <div className="text-center">
                                <SubtopicStatusTracker 
                                    subtopic={subtopic}
                                    onStatusChange={(updatedSubtopic) => {
                                        // Update the subtopic in the list when status changes
                                        setSubtopics(prev => 
                                            prev.map(s => s.id === updatedSubtopic.id ? updatedSubtopic : s)
                                        );
                                    }}
                                />
                            </div>
                        </td>
                        <td className="px-6 py-4 w-1/12">
                            <div className="flex justify-start space-x-2">
                                <button
                                    onClick={() => startEdit(subtopic)}
                                    className={ADMIN_BUTTON_STYLES.ICON_PRIMARY}
                                    title="Edit"
                                >
                                    <FiEdit2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(subtopic.id)}
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

            <SubtopicModal
                isOpen={showCreateForm || !!editingSubtopic}
                onClose={() => editingSubtopic ? setEditingSubtopic(null) : setShowCreateForm(false)}
                onSubmit={(data) => {
                    // Transform the data to match AdminSubtopic type without id
                    const subtopicData: Omit<AdminSubtopic, 'id'> = {
                        ...data,
                        has_embedding: false,
                        embedding_status: 'not_started',
                        embedding_error: null,
                        embedding_updated_at: new Date().toISOString(),
                        topic_name: topics.find(t => t.id === data.topic)?.name || '',
                        zone_name: '',  // This will be set by the backend
                    };
                    return editingSubtopic ? handleUpdate(subtopicData) : handleCreate(subtopicData);
                }}
                initialData={editingSubtopic || undefined}
                title={editingSubtopic ? 'Edit Subtopic' : 'Create New Subtopic'}
                topics={topics}
            />
        </>
    );
};

export default ViewSubtopic;

import { useState, useEffect } from 'react';
import { adminApi } from '../../../../api';
import { SubtopicModal, AdminTable } from '../../../../views/components/UI';
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
            // Start the API call but don't wait for it
            adminApi.createSubtopic(data).then(() => {
                // Refresh the list in background after API completes
                fetchSubtopics().catch(err => {
                    console.error('Error refreshing subtopics:', err);
                });
            }).catch(err => {
                const errorMessage = err.response?.data?.error || err.response?.data?.detail || err.response?.data?.message || 'Failed to create subtopic';
                console.error('Error creating subtopic:', err.response?.data);
                setError(errorMessage);
            });
            
            // Close modal immediately
            setShowCreateForm(false);
            setError('');
        } catch (err: any) {
            // This should not happen since we're not awaiting
            console.error('Unexpected error:', err);
        }
    };

    const handleUpdate = async (data: Omit<AdminSubtopic, 'id'>) => {
        if (!editingSubtopic) return;

        try {
            // Start the API call but don't wait for it
            adminApi.updateSubtopic(editingSubtopic.id, data).then(() => {
                // Refresh the list in background after API completes
                fetchSubtopics().catch(err => {
                    console.error('Error refreshing subtopics:', err);
                });
            }).catch(err => {
                const errorMessage = err.response?.data?.error || err.response?.data?.detail || err.response?.data?.message || 'Failed to update subtopic';
                console.error('Error updating subtopic:', err.response?.data);
                setError(errorMessage);
            });
            
            // Close modal immediately
            setEditingSubtopic(null);
            setError('');
        } catch (err: any) {
            // This should not happen since we're not awaiting
            console.error('Unexpected error:', err);
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
                headerColumns={['ID', 'Name', 'Topic ID', 'Topic Name', 'Concept Intent', 'Code Intent', 'Embedding Status', 'Actions']}
                itemsPerPage={itemsPerPage}
                renderRow={(subtopic) => (
                    <tr key={subtopic.id}>
                        <td className="px-6 py-4 w-1/12 text-sm font-mono">{subtopic.id}</td>
                        <td className="px-6 py-4 w-1/6">
                            <div className="font-medium">{subtopic.name}</div>
                        </td>
                        <td className="px-6 py-4 w-1/12 text-center font-mono">{subtopic.topic}</td>
                        <td className="px-6 py-4 w-1/12">
                            <div className="text-center">
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
                                {subtopic.embedding_status === 'not_started' && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        Not Started
                                    </span>
                                )}
                                {subtopic.embedding_status === 'pending' && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Pending
                                    </span>
                                )}
                                {subtopic.embedding_status === 'processing' && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Processing
                                    </span>
                                )}
                                {subtopic.embedding_status === 'completed' && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Completed
                                    </span>
                                )}
                                {subtopic.embedding_status === 'failed' && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Failed
                                    </span>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4 w-1/12">
                            <div className="flex justify-start space-x-2">
                                <button
                                    onClick={() => startEdit(subtopic)}
                                    className="p-1 text-gray-600 hover:text-yellow-600 transition-colors"
                                    title="Edit"
                                >
                                    <FiEdit2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(subtopic.id)}
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

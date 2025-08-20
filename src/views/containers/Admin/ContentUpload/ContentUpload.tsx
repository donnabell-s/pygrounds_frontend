import { useState, useEffect } from 'react';
import { adminApi } from '../../../../api';
import { AdminTable, DocumentManagementModal } from '../../../components/UI';
import { MdDelete } from 'react-icons/md';
import { BsFillPlayFill } from 'react-icons/bs';
import { FiSquare } from 'react-icons/fi';

import type { UploadedDocument } from '../../../../types/adaptive';
type Document = UploadedDocument;

export const ContentUpload = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [documents, setDocuments] = useState<Document[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalDocuments, setTotalDocuments] = useState(0);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [processingDocuments, setProcessingDocuments] = useState<Set<number>>(new Set());

    useEffect(() => {
        fetchDocuments();
    }, [currentPage]);

    // Auto-refresh when there are processing documents
    useEffect(() => {
        let intervalId: number | null = null;

        if (processingDocuments.size > 0) {
            intervalId = setInterval(() => {
                checkProcessingDocuments();
            }, 2000); // Poll every 2 seconds as recommended
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [processingDocuments]);

    const checkProcessingDocuments = async () => {
        const stillProcessing = new Set<number>();
        
        for (const docId of processingDocuments) {
            try {
                const doc = await adminApi.getDocumentStatus(docId);
                if (doc.processing_status === 'PROCESSING') {
                    stillProcessing.add(docId);
                }
                // Update the document in the list
                setDocuments(prev => prev.map(d => d.id === docId ? doc : d));
            } catch (err) {
                console.error(`Error checking status for document ${docId}:`, err);
            }
        }
        
        setProcessingDocuments(stillProcessing);
    };

    useEffect(() => {
        fetchDocuments();
    }, [currentPage]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getAllDocuments();
            if (response.status === 'success') {
                setDocuments(response.documents);
                setTotalDocuments(response.count);
            } else {
                setError(response.message);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch documents');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (data: { file: File; difficulty: string; is_pipeline: boolean }) => {
        try {
            // Start the API call but don't wait for it
            const formData = new FormData();
            formData.append('file', data.file);
            formData.append('difficulty', data.difficulty);
            formData.append('is_pipeline', data.is_pipeline.toString());
            
            adminApi.uploadDocument(formData).then(() => {
                // Refresh the list in background after API completes
                fetchDocuments().catch(err => {
                    console.error('Error refreshing documents:', err);
                });
            }).catch(err => {
                const errorMessage = err?.message || err?.response?.data?.message || 'Failed to upload document';
                console.error('Error uploading document:', err);
                setError(errorMessage);
            });
            
            // Close modal immediately
            setIsUploadModalOpen(false);
            setError('');
        } catch (err: any) {
            // This should not happen since we're not awaiting
            console.error('Unexpected error:', err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this document?')) {
            return;
        }

        try {
            await adminApi.deleteDocument(id);
            await fetchDocuments();
        } catch (err: any) {
            setError(err.message || 'Failed to delete document');
        }
    };

    const handleRunPipeline = async (id: number) => {
        try {
            setProcessingDocuments(prev => new Set(prev).add(id));
            const response = await adminApi.runPipeline(id, false);
            
            // Update document status immediately
            setDocuments(prev => prev.map(doc => 
                doc.id === id 
                    ? { ...doc, processing_status: 'PROCESSING' as const }
                    : doc
            ));
            
            // Show success message if available
            if (response.status === 'success') {
                setError(''); // Clear any previous errors
                console.log('Pipeline started successfully');
            }
        } catch (err: any) {
            setProcessingDocuments(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
            setError(err?.message || err?.response?.data?.message || 'Failed to run pipeline');
        }
    };

    const handleCancelPipeline = async (id: number) => {
        try {
            await adminApi.cancelPipeline(id);
            
            // Remove from processing set and update status
            setProcessingDocuments(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
            
            // Update document status immediately
            setDocuments(prev => prev.map(doc => 
                doc.id === id 
                    ? { ...doc, processing_status: 'PENDING' as const, processing_message: 'Processing cancelled' }
                    : doc
            ));
            
            setError(''); // Clear any previous errors
        } catch (err: any) {
            setError(err?.message || err?.response?.data?.message || 'Failed to cancel pipeline');
        }
    };

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto">
                <AdminTable
                    title="Content Upload"
                    loading={loading}
                    error={error}
                    items={documents}
                    total={totalDocuments}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    onAdd={() => setIsUploadModalOpen(true)}
                    headerColumns={['Name', 'Status', 'Difficulty', 'Created At', 'Actions']}
                    renderRow={(document: Document) => (
                    <tr key={document.id}>
                        <td className="px-6 py-4">
                            <div className="line-clamp-1">{document.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                    ${document.processing_status === 'COMPLETED' && 'bg-green-100 text-green-800'}
                                    ${document.processing_status === 'PROCESSING' && 'bg-yellow-100 text-yellow-800'}
                                    ${document.processing_status === 'PENDING' && 'bg-gray-100 text-gray-800'}
                                    ${document.processing_status === 'FAILED' && 'bg-red-100 text-red-800'}
                                `}>
                                    {document.processing_status.toLowerCase()}
                                </span>
                                {document.processing_message && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        {document.processing_message}
                                    </p>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap capitalize">
                            {document.difficulty}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(document.uploaded_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                                {document.processing_status === 'PROCESSING' ? (
                                    <button
                                        onClick={() => handleCancelPipeline(document.id)}
                                        className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                                        title="Cancel Pipeline"
                                    >
                                        <FiSquare className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleRunPipeline(document.id)}
                                        className="p-1 text-gray-600 hover:text-green-600 transition-colors"
                                        title="Run Pipeline"
                                    >
                                        <BsFillPlayFill className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(document.id)}
                                    className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                                    title="Delete"
                                >
                                    <MdDelete className="w-5 h-5" />
                                </button>
                            </div>
                        </td>
                    </tr>
                )}
            />
            </div>

            <DocumentManagementModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSubmit={handleUpload}
            />
        </div>
    );
};

export default ContentUpload;

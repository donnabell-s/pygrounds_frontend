import { useState, useEffect } from 'react';
import { adminApi } from '../../../../api';
import { AdminTable, DocumentManagementModal } from '../../../components/UI';
import { ADMIN_BUTTON_STYLES } from '../../../components/Layout';
import { MdDelete } from 'react-icons/md';
import { BsFillPlayFill } from 'react-icons/bs';
import { FiSquare } from 'react-icons/fi';
import ReadingMaterialSelector from "./ReadingMaterialSelector";
import ReadingMaterial from "../../../components/Features/ReadingMaterial";

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
    const [startingPipelines, setStartingPipelines] = useState<Set<number>>(new Set());
    const [viewType, setViewType] = useState<"documents" | "reading">("documents");


    useEffect(() => {
        fetchDocuments();
    }, [currentPage]);

    // Auto-refresh when there are processing documents - Poll every 5 seconds
    useEffect(() => {
        let intervalId: number | null = null;

        if (processingDocuments.size > 0) {
            intervalId = setInterval(() => {
                checkProcessingDocuments();
            }, 5000); // Poll every 5 seconds for queued processing
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
                
                // Log status for debugging
                console.log(`📊 Document ${docId} status:`, {
                    status: doc.processing_status,
                    message: doc.processing_message
                });
                
                // Check if still processing, queued, or pending
                if (doc.processing_status === 'PROCESSING' || 
                    doc.processing_status === 'QUEUED' ||
                    doc.processing_status === 'PENDING') {
                    stillProcessing.add(docId);
                } else if (doc.processing_status === 'COMPLETED') {
                    console.log(`✅ Document ${docId} completed successfully`);
                } else if (doc.processing_status === 'FAILED') {
                    console.error(`❌ Document ${docId} failed:`, doc.processing_message);
                } else if (doc.processing_status === 'COMPLETED_WITH_WARNINGS') {
                    console.warn(`⚠️ Document ${docId} completed with warnings:`, doc.processing_message);
                }
                
                // Update the document in the list
                setDocuments(prev => prev.map(d => d.id === docId ? doc : d));
            } catch (err) {
                console.error(`Error checking status for document ${docId}:`, err);
                // Keep polling on error
                stillProcessing.add(docId);
            }
        }
        
        setProcessingDocuments(stillProcessing);
        
        // Refresh the full list if any document completed
        if (stillProcessing.size < processingDocuments.size) {
            fetchDocuments();
        }
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
            // Add to starting set to show loading
            setStartingPipelines(prev => new Set(prev).add(id));

            // Start the pipeline (may take time with queue-based processing)
            // Set a timeout for the request itself
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            let response;
            try {
                response = await adminApi.runPipeline(id, false);
                clearTimeout(timeoutId);
            } catch (pipelineError: any) {
                clearTimeout(timeoutId);

                // If it's a timeout, still start polling - backend might be processing
                if (pipelineError.code === 'ECONNABORTED' || pipelineError.message?.includes('timeout')) {
                    console.warn('⏰ Pipeline request timed out, but starting polling anyway...');

                    // Show a message to user that processing started despite timeout
                    setError(''); // Clear any previous errors first
                    setTimeout(() => {
                        setError('Processing started (request timed out but polling active)');
                        setTimeout(() => setError(''), 5000); // Clear after 5 seconds
                    }, 1000);

                    // Continue with polling even if request timed out
                } else {
                    throw pipelineError; // Re-throw other errors
                }
            } finally {
                // Remove from starting set
                setStartingPipelines(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(id);
                    return newSet;
                });
            }

            // Check if we got the expected response
            if (response && (response.status === 'accepted' || response.message)) {
                console.log('✅ Pipeline queued:', response.message);

                // Update document status to show it's queued/processing
                setDocuments(prev => prev.map(doc =>
                    doc.id === id
                        ? {
                            ...doc,
                            processing_status: 'PROCESSING' as const,
                            processing_message: response.message || 'Processing started...'
                          }
                        : doc
                ));

                setError(''); // Clear any previous errors
            } else {
                // If no response or unexpected response, still start polling
                console.log('🔄 Starting pipeline processing (no immediate response)...');

                setDocuments(prev => prev.map(doc =>
                    doc.id === id
                        ? {
                            ...doc,
                            processing_status: 'PROCESSING' as const,
                            processing_message: 'Processing started...'
                          }
                        : doc
                ));

                setError(''); // Clear any previous errors
            }

            // Always start polling regardless of response
            setProcessingDocuments(prev => new Set(prev).add(id));

        } catch (err: any) {
            console.error('Failed to start pipeline:', err);

            // Remove from both sets
            setStartingPipelines(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
            setProcessingDocuments(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });

            const errorMessage = err?.response?.data?.error || err?.message || 'Failed to start pipeline';
            setError(errorMessage);

            // Update document to show error
            setDocuments(prev => prev.map(doc =>
                doc.id === id
                    ? {
                        ...doc,
                        processing_status: 'FAILED' as const,
                        processing_message: errorMessage
                      }
                    : doc
            ));
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
    {/* Header Section */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {/* Left side: Title + Dropdown */}
      <div className="flex items-center space-x-3">
        <h2 className="text-lg font-semibold text-gray-800"></h2>

        {/* Dropdown Selector beside title */}
        <div className="relative inline-block">
  <select
    onChange={(e) => setViewType(e.target.value as "documents" | "reading")}
    value={viewType}
    className="block w-56 appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 
               shadow-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:outline-none focus-visible:ring-[#2563EB] 
               transition duration-150"
  >
    <option value="documents">Uploaded Files</option>
    <option value="reading">Reading Materials</option>
  </select>

  {/* custom arrow icon */}
  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
    <svg
      className="h-4 w-4 text-gray-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
</div>
</div>
        

      {/* Right side: Add New Button */}
      {viewType === "documents" && (
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors"
        >
          Add New Content
        </button>
      )}
    </div>

    {/* Main Table or Reading Material Section */}
    <div className="flex items-center space-x-3 mt-1">
      {viewType === "documents" ? (
        <AdminTable
          title="Content Management"
          loading={loading}
          error={error}
          items={documents}
          total={totalDocuments}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          headerColumns={["Name", "Status", "Difficulty", "Created At", "Actions"]}
          renderRow={(document: Document) => (
            <tr key={document.id}>
              <td className="px-6 py-4">
                <div className="line-clamp-1">{document.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      document.processing_status === "COMPLETED" && "bg-green-100 text-green-800"
                    } ${
                      document.processing_status === "FAILED" && "bg-red-100 text-red-800"
                    } ${
                      document.processing_status === "PROCESSING" && "bg-blue-100 text-blue-800"
                    } ${
                      document.processing_status === "QUEUED" && "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {document.processing_status.toLowerCase()}
                  </span>
                  {document.processing_message && (
                    <p
                      className="text-sm text-gray-500 mt-1 max-w-xs truncate"
                      title={document.processing_message}
                    >
                      {document.processing_message}
                    </p>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap capitalize text-center">
                {document.difficulty}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {new Date(document.uploaded_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex justify-center space-x-2">
                  {(document.processing_status === "PROCESSING" ||
                    document.processing_status === "QUEUED") && (
                    <button
                      onClick={() => handleCancelPipeline(document.id)}
                      className={ADMIN_BUTTON_STYLES.ICON_DANGER}
                      title="Cancel Pipeline"
                    >
                      <FiSquare className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleRunPipeline(document.id)}
                    disabled={startingPipelines.has(document.id)}
                    className={`${ADMIN_BUTTON_STYLES.ICON_SUCCESS} ${
                      startingPipelines.has(document.id)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    title={
                      startingPipelines.has(document.id)
                        ? "Starting..."
                        : "Run Pipeline"
                    }
                  >
                    {startingPipelines.has(document.id) ? (
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-green-500 rounded-full animate-spin"></div>
                    ) : (
                      <BsFillPlayFill className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(document.id)}
                    className={ADMIN_BUTTON_STYLES.ICON_DANGER}
                    title="Delete"
                  >
                    <MdDelete className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      ) : (
        <div className="bg-gray-50 rounded-md p-6 border border-gray-200">
          <ReadingMaterial />
        </div>
      )}
    </div>

    {/* Modal */}
    <DocumentManagementModal
      isOpen={isUploadModalOpen}
      onClose={() => setIsUploadModalOpen(false)}
      onSubmit={handleUpload}
    />
  </div>
);
}
export default ContentUpload;

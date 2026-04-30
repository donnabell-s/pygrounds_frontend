import { useState, useEffect } from 'react';
import { adminApi } from '../../../../api';
import { ZoneModal, AdminTable } from '../../../../views/components/UI';
import { ADMIN_BUTTON_STYLES } from '../../../components/Layout';
import type { AdminZone } from '../../../../types/adaptive';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const ViewZone = () => {
    const [zones, setZones] = useState<AdminZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [editingZone, setEditingZone] = useState<AdminZone | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [itemsPerPage] = useState(10);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        zone: AdminZone;
        topicCount?: number;
        showForceConfirm?: boolean;
    } | null>(null);

    useEffect(() => {
        fetchZones();
    }, [currentPage]);

    const fetchZones = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getAllZones({
                page: currentPage,
                page_size: itemsPerPage
            });
            setZones(data.results);
            setTotalCount(data.count);
        } catch (err) {
            setError('Failed to fetch zones');
            console.error('Error fetching zones:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data: {
        name: string;
        description: string;
        order: number;
    }) => {
        try {
            await adminApi.createZone(data);
            setCurrentPage(1); // Reset to first page
            await fetchZones();
            setShowCreateForm(false);
            setError('');
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.response?.data?.detail || err.response?.data?.message || 'Failed to create zone';
            setError(errorMessage);
            console.error('Error creating zone:', err.response?.data);
            throw new Error(errorMessage); // Propagate specific error to form
        }
    };

    const handleUpdate = async (data: {
        name?: string;
        description?: string;
        order?: number;
    }) => {
        if (!editingZone) return;

        try {
            await adminApi.updateZone(editingZone.id, data);
            await fetchZones();
            setEditingZone(null);
            setError('');
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.response?.data?.detail || err.response?.data?.message || 'Failed to update zone';
            setError(errorMessage);
            console.error('Error updating zone:', err.response?.data);
            throw new Error(errorMessage); // Propagate specific error to form
        }
    };

    const handleDelete = async (zoneId: number, force: boolean = false) => {
        const zone = zones.find(z => z.id === zoneId);
        if (!zone) return;

        try {
            // First attempt - normal delete
            if (force) {
                await adminApi.deleteZone(zoneId, true); // Add force parameter to API
                await fetchZones();
                setDeleteConfirmation(null);
                setError('');
            } else {
                await adminApi.deleteZone(zoneId);
                await fetchZones();
            }
        } catch (err: any) {
            const errorData = err.response?.data;
            
            if (errorData?.topic_count !== undefined) {
                // Show confirmation with topic count
                setDeleteConfirmation({
                    zone,
                    topicCount: errorData.topic_count,
                    showForceConfirm: true
                });
            } else {
                setError('Failed to delete zone');
                console.error('Error deleting zone:', err);
            }
        }
    };

    const handleDeleteClick = (zoneId: number) => {
        const zone = zones.find(z => z.id === zoneId);
        if (!zone) return;

        if (!window.confirm('Are you sure you want to delete this zone?')) {
            return;
        }

        handleDelete(zoneId);
    };

    const handleForceDelete = () => {
        if (deleteConfirmation) {
            handleDelete(deleteConfirmation.zone.id, true);
        }
    };

    const startEdit = (zone: AdminZone) => {
        setEditingZone(zone);
        setShowCreateForm(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Zone Management</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Manage learning zones and their topics</p>
                    </div>
                </div>
            </div>
            <AdminTable
                title="Zone Management"
                loading={loading}
                error={error}
                items={zones}
                total={totalCount}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onAdd={() => setShowCreateForm(true)}
                headerColumns={['ID', 'Name', 'Description', 'Order', 'Topics', 'Actions']}
                itemsPerPage={itemsPerPage}
                renderRow={(zone) => (
                    <tr key={zone.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 w-20 text-sm text-center">{zone.id}</td>
                        <td className="px-4 py-4 w-44 text-sm">
                            <div className="truncate">{zone.name}</div>
                        </td>
                        <td className="px-4 py-4 text-sm">
                            <div className="line-clamp-2 break-words">{zone.description}</div>
                        </td>
                        <td className="px-4 py-4 w-20 text-sm text-center">{zone.order}</td>
                        <td className="px-4 py-4 w-20 text-sm text-center">{zone.topics_count}</td>
                        <td className="px-4 py-4 w-24">
                            <div className="flex items-center justify-center space-x-2">
                                <button
                                    onClick={() => startEdit(zone)}
                                    className={ADMIN_BUTTON_STYLES.ICON_PRIMARY}
                                    title="Edit"
                                >
                                    <FiEdit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(zone.id)}
                                    className={ADMIN_BUTTON_STYLES.ICON_DANGER}
                                    title="Delete"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                )}
            />

            <ZoneModal
                isOpen={showCreateForm || !!editingZone}
                onClose={() => editingZone ? setEditingZone(null) : setShowCreateForm(false)}
                onSubmit={editingZone ? handleUpdate : handleCreate}
                initialData={editingZone || undefined}
                title={editingZone ? 'Edit Zone' : 'Create New Zone'}
            />

            {/* Delete Confirmation Modal */}
            {deleteConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg border">
                        <h3 className="text-lg font-semibold text-red-600 mb-4">
                            ⚠️ Warning: Zone Contains Content
                        </h3>
                        
                        <div className="mb-4">
                            <p className="text-gray-700 mb-2">
                                Zone "<strong>{deleteConfirmation.zone.name}</strong>" contains{' '}
                                <strong>{deleteConfirmation.topicCount}</strong> topic(s).
                            </p>
                            <p className="text-red-600 font-medium">
                                All topics and their content will be permanently deleted.
                            </p>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setDeleteConfirmation(null)}
                                className={ADMIN_BUTTON_STYLES.SECONDARY}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleForceDelete}
                                className={ADMIN_BUTTON_STYLES.DANGER}
                            >
                                Delete Zone & All Content
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewZone;

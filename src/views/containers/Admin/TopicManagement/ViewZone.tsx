import { useState, useEffect } from 'react';
import { adminApi } from '../../../../api';
import { ZoneModal, AdminTable } from '../../../../views/components/UI';
import type { AdminZone } from '../../../../types/adaptive';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const ViewZone = () => {
    const [zones, setZones] = useState<AdminZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [editingZone, setEditingZone] = useState<AdminZone | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getAllZones();
            setZones(data);
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

    const handleDelete = async (zoneId: number) => {
        if (!window.confirm('Are you sure you want to delete this zone?')) {
            return;
        }

        try {
            await adminApi.deleteZone(zoneId);
            await fetchZones();
        } catch (err) {
            setError('Failed to delete zone');
            console.error('Error deleting zone:', err);
        }
    };

    const startEdit = (zone: AdminZone) => {
        setEditingZone(zone);
        setShowCreateForm(false);
    };

    return (
        <>
            <AdminTable
                title="Zone Management"
                loading={loading}
                error={error}
                items={zones}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onAdd={() => setShowCreateForm(true)}
                headerColumns={['ID', 'Name', 'Description', 'Order', 'Topics', 'Actions']}
                renderRow={(zone) => (
                    <tr key={zone.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 w-20 text-sm">{zone.id}</td>
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
                                    className="p-1 text-gray-600 hover:text-yellow-600 transition-colors"
                                    title="Edit"
                                >
                                    <FiEdit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(zone.id)}
                                    className="p-1 text-gray-600 hover:text-red-600 transition-colors"
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
        </>
    );
};

export default ViewZone;

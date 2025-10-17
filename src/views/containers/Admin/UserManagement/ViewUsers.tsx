import { useState, useEffect } from 'react';
import { AdminTable } from '../../../components/UI';
import { FiEdit2, FiTrash2, FiUser, FiMail, FiCalendar } from 'react-icons/fi';
import RegisterAdmin from '../../Authentication/Register/RegisterAdmin/RegisterAdmin';
import { adminApi } from '../../../../api/adminApi';
import { ADMIN_BUTTON_STYLES } from '../../../components/Layout';
import type { AdminUser, AdminUserListResponse } from '../../../../types/admin';

const ViewUsers = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersData, setUsersData] = useState<AdminUserListResponse | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

    useEffect(() => {
        fetchUsers();
    }, [currentPage]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await adminApi.getAllUsers({
                page: currentPage,
                page_size: 10
            });
            
            setUsersData(response);
        } catch (err: any) {
            console.error('Error fetching users:', err);
            setError(err.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        // Find the user to check if they're active
        const user = usersData?.results?.find((user: AdminUser) => user.id === id);
        if (!user) return;

        let confirmMessage: string;
        let isHardDelete = false;

        if (user.is_active) {
            confirmMessage = 'This will deactivate the user. Are you sure?';
        } else {
            confirmMessage = 'This user is already inactive. This will permanently delete the user. Are you sure?';
            isHardDelete = true;
        }

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            if (isHardDelete) {
                // Hard delete for inactive users
                await adminApi.deleteUser(id);
            } else {
                // Soft delete (deactivate) for active users
                await adminApi.deactivateUser(id);
            }
            // Always refresh the user list after attempting deletion/deactivation
            await fetchUsers();
        } catch (err: any) {
            // Even if there's an error, refresh the list to check if operation actually succeeded
            await fetchUsers();
            // Check if the operation succeeded despite the error
            const updatedUser = usersData?.results?.find((user: AdminUser) => user.id === id);
            let operationFailed = false;
            
            if (isHardDelete) {
                // For hard delete, check if user still exists
                operationFailed = !!updatedUser;
            } else {
                // For deactivation, check if user is still active
                operationFailed = updatedUser?.is_active === true;
            }
            
            if (operationFailed) {
                setError(err.message || `Failed to ${isHardDelete ? 'delete' : 'deactivate'} user`);
            }
        }
    };

    const handleEdit = (user: AdminUser) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (updatedData: {
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        is_active: boolean;
        role: string;
        is_staff: boolean;
        is_superuser: boolean;
    }) => {
        if (!editingUser) return;

        try {
            await adminApi.updateUser(editingUser.id, updatedData);
            setIsEditModalOpen(false);
            setEditingUser(null);
            await fetchUsers();
        } catch (err: any) {
            setError(err.message || 'Failed to update user');
        }
    };

    const getRoleDisplay = (user: AdminUser) => {
        if (user.is_superuser) return { text: 'Admin', color: 'bg-red-100 text-red-800' };
        return { text: 'User', color: 'bg-green-100 text-green-800' };
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never';
        try {
            const date = new Date(dateString);
            // Check if date is valid
            if (isNaN(date.getTime())) return 'Invalid date';
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid date';
        }
    };

    return (
        <div className="space-y-4">
            <AdminTable
                title="User Management"
                loading={loading}
                error={error}
                items={usersData?.results || []}
                total={usersData?.count}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onAdd={() => setIsAddModalOpen(true)}
                itemsPerPage={10}
                headerColumns={['ID', 'User', 'Email', 'Role', 'Status', 'Joined', 'Actions']}
                renderRow={(user: AdminUser) => (
                    <tr key={user.id} className={!user.is_active ? "opacity-50 bg-gray-50" : ""}>
                        <td className={`px-3 py-3 text-sm font-mono ${user.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                            {user.id}
                        </td>
                        <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                                <FiUser className={`w-4 h-4 ${user.is_active ? 'text-gray-400' : 'text-gray-300'}`} />
                                <div>
                                    <div className={`font-medium text-sm ${user.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {user.username}
                                    </div>
                                    <div className={`text-xs ${user.is_active ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {user.first_name} {user.last_name}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td className="px-3 py-3">
                            <div className={`flex items-center gap-2 text-sm ${user.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                                <FiMail className={`w-4 h-4 ${user.is_active ? 'text-gray-400' : 'text-gray-300'}`} />
                                {user.email}
                            </div>
                        </td>
                        <td className="px-3 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${getRoleDisplay(user).color}`}>
                                {getRoleDisplay(user).text}
                            </span>
                        </td>
                        <td className="px-3 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                                user.is_active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                                {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td className={`px-3 py-3 text-sm ${user.is_active ? 'text-gray-600' : 'text-gray-400'}`}>
                            <div className="flex items-center gap-1">
                                <FiCalendar className="w-3 h-3" />
                                {formatDate(user.date_joined)}
                            </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                            <div className="flex justify-center space-x-1">
                                <button
                                    onClick={() => handleEdit(user)}
                                    className={ADMIN_BUTTON_STYLES.ICON_PRIMARY}
                                    title="Edit"
                                >
                                    <FiEdit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    className={user.is_active ? ADMIN_BUTTON_STYLES.ICON_WARNING : ADMIN_BUTTON_STYLES.ICON_DANGER}
                                    title={user.is_active ? "Deactivate User" : "Permanently Delete User"}
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                )}
            />

            {/* Add User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Add New User</h3>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <RegisterAdmin 
                            showTitle={false}
                            inModal={true}
                            onUserCreated={() => {
                                setIsAddModalOpen(false);
                                fetchUsers();
                            }} 
                        />
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && editingUser && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">Edit User</h3>
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const updatedData = {
                                username: formData.get('username') as string,
                                email: formData.get('email') as string,
                                first_name: formData.get('first_name') as string,
                                last_name: formData.get('last_name') as string,
                                is_active: formData.get('is_active') === 'on',
                                role: formData.get('is_staff') === 'admin' ? 'admin' : 'learner',
                                is_staff: formData.get('is_staff') === 'admin',
                                is_superuser: formData.get('is_staff') === 'admin',
                            };
                            
                            // Debug logging for edit
                            console.log('Editing user - sending data:', {
                                username: updatedData.username,
                                email: updatedData.email,
                                first_name: updatedData.first_name,
                                last_name: updatedData.last_name,
                                is_active: updatedData.is_active,
                                role: updatedData.role,
                                is_staff: updatedData.is_staff,
                                is_superuser: updatedData.is_superuser,
                                selectedUserType: formData.get('is_staff')
                            });
                            
                            handleSaveEdit(updatedData);
                        }}>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                        <input
                                            type="text"
                                            name="username"
                                            defaultValue={editingUser.username}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            defaultValue={editingUser.email}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            defaultValue={editingUser.first_name}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            defaultValue={editingUser.last_name}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                                    <select
                                        name="is_staff"
                                        defaultValue={editingUser.is_staff ? 'admin' : 'learner'}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="learner">Learner</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        id="edit_is_active"
                                        defaultChecked={editingUser.is_active}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="edit_is_active" className="ml-2 block text-sm text-gray-700">
                                        Active User
                                    </label>
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className={ADMIN_BUTTON_STYLES.SECONDARY}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={ADMIN_BUTTON_STYLES.PRIMARY}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewUsers;
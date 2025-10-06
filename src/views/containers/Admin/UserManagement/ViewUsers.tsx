import { useState, useEffect } from 'react';
import { AdminTable } from '../../../components/UI';
import { FiEdit2, FiTrash2, FiPlus, FiUser, FiMail, FiCalendar } from 'react-icons/fi';
import RegisterAdmin from '../../Authentication/Register/RegisterAdmin/RegisterAdmin';

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    is_staff: boolean;
    is_superuser: boolean;
    date_joined: string;
    last_login: string | null;
}

interface UserListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: User[];
}

const ViewUsers = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersData, setUsersData] = useState<UserListResponse | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    useEffect(() => {
        fetchUsers();
    }, [currentPage]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            // Mock API call - replace with actual API endpoint
            const mockUsers: User[] = [
                {
                    id: 1,
                    username: "admin",
                    email: "admin@pygrounds.com",
                    first_name: "Admin",
                    last_name: "User",
                    is_active: true,
                    is_staff: true,
                    is_superuser: true,
                    date_joined: "2024-01-15T10:30:00Z",
                    last_login: "2024-10-07T08:15:00Z"
                },
                {
                    id: 2,
                    username: "teacher1",
                    email: "teacher@pygrounds.com",
                    first_name: "Jane",
                    last_name: "Smith",
                    is_active: true,
                    is_staff: true,
                    is_superuser: false,
                    date_joined: "2024-02-20T14:45:00Z",
                    last_login: "2024-10-06T16:20:00Z"
                },
                {
                    id: 3,
                    username: "student1",
                    email: "student@example.com",
                    first_name: "John",
                    last_name: "Doe",
                    is_active: true,
                    is_staff: false,
                    is_superuser: false,
                    date_joined: "2024-03-10T09:00:00Z",
                    last_login: "2024-10-07T12:30:00Z"
                }
            ];

            setUsersData({
                count: mockUsers.length,
                next: null,
                previous: null,
                results: mockUsers
            });
        } catch (err: any) {
            console.error('Error fetching users:', err);
            setError(err.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            // Mock delete - replace with actual API call
            console.log(`Deleting user with ID: ${id}`);
            await fetchUsers();
        } catch (err: any) {
            setError(err.message || 'Failed to delete user');
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (updatedData: {
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        is_active: boolean;
        is_staff: boolean;
        is_superuser: boolean;
    }) => {
        if (!editingUser) return;

        try {
            // Mock update - replace with actual API call
            console.log('Updating user:', { id: editingUser.id, ...updatedData });
            setIsEditModalOpen(false);
            setEditingUser(null);
            await fetchUsers();
        } catch (err: any) {
            setError(err.message || 'Failed to update user');
        }
    };

    const getRoleDisplay = (user: User) => {
        if (user.is_superuser) return { text: 'Admin', color: 'bg-red-100 text-red-800' };
        return { text: 'User', color: 'bg-green-100 text-green-800' };
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="space-y-4">
            {/* Header and Actions */}
            <div className="flex flex-wrap gap-3 mb-4 items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-[#3776AB] text-white px-4 py-2 rounded hover:brightness-110 transition-all whitespace-nowrap flex items-center gap-2"
                >
                    <FiPlus className="w-4 h-4" />
                    Add User
                </button>
            </div>

            <AdminTable
                title="Users"
                loading={loading}
                error={error}
                items={usersData?.results || []}
                total={usersData?.count}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                itemsPerPage={10}
                headerColumns={['ID', 'User', 'Email', 'Role', 'Status', 'Joined', 'Last Login', 'Actions']}
                renderRow={(user: User) => (
                    <tr key={user.id}>
                        <td className="px-3 py-3 text-sm font-mono">
                            {user.id}
                        </td>
                        <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                                <FiUser className="w-4 h-4 text-gray-400" />
                                <div>
                                    <div className="font-medium text-sm">{user.username}</div>
                                    <div className="text-xs text-gray-500">{user.first_name} {user.last_name}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-3 py-3">
                            <div className="flex items-center gap-2 text-sm">
                                <FiMail className="w-4 h-4 text-gray-400" />
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
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                                <FiCalendar className="w-3 h-3" />
                                {formatDate(user.date_joined)}
                            </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-600">
                            {formatDate(user.last_login)}
                        </td>
                        <td className="px-3 py-3 text-center">
                            <div className="flex justify-center space-x-1">
                                <button
                                    onClick={() => handleEdit(user)}
                                    className="p-1 text-gray-600 hover:text-yellow-600 transition-colors"
                                    title="Edit"
                                >
                                    <FiEdit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(user.id)}
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
                                is_staff: formData.get('role') === 'staff' || formData.get('role') === 'admin',
                                is_superuser: formData.get('role') === 'admin',
                            };
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        name="role"
                                        defaultValue={
                                            editingUser.is_superuser ? 'admin' : 
                                            editingUser.is_staff ? 'staff' : 'user'
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="user">User</option>
                                        <option value="staff">Staff</option>
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

                                <div className="bg-gray-50 p-3 rounded-md">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Read-Only Information</h4>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p><strong>ID:</strong> {editingUser.id}</p>
                                        <p><strong>Date Joined:</strong> {formatDate(editingUser.date_joined)}</p>
                                        <p><strong>Last Login:</strong> {formatDate(editingUser.last_login)}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
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
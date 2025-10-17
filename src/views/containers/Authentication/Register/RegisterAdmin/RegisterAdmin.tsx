import { useState } from 'react';
import { adminApi } from '../../../../../api/adminApi';

interface RegisterAdminProps {
    onUserCreated?: () => void;
    showTitle?: boolean;
    inModal?: boolean;
}

const RegisterAdmin = ({ onUserCreated, showTitle = true, inModal = false }: RegisterAdminProps) => {
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleAddUser = async (userData: {
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        password: string;
        role: string;
        is_staff: boolean;
        is_superuser: boolean;
    }) => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');
            
            // Create user via admin API
            await adminApi.createUser({
                username: userData.username,
                email: userData.email,
                first_name: userData.first_name,
                last_name: userData.last_name,
                password: userData.password,
                role: userData.role,
                is_staff: userData.is_staff,
                is_superuser: userData.is_superuser,
            });
            
            setSuccess('User created successfully!');
            
            // Call the callback if provided
            if (onUserCreated) {
                onUserCreated();
            }
            
            // Reset form after success
            setTimeout(() => {
                setSuccess('');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={inModal ? "" : "max-w-2xl mx-auto p-6"}>
            {showTitle && <h2 className="text-2xl font-bold text-gray-900 mb-6">Register New User</h2>}
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                </div>
            )}
            
            <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const userData = {
                    username: formData.get('username') as string,
                    email: formData.get('email') as string,
                    first_name: formData.get('first_name') as string,
                    last_name: formData.get('last_name') as string,
                    password: formData.get('password') as string,
                    role: formData.get('is_staff') === 'admin' ? 'admin' : 'learner',
                    is_staff: formData.get('is_staff') === 'admin',
                    is_superuser: formData.get('is_staff') === 'admin',
                };
                
                // Debug logging to check what data is being sent
                console.log('Sending data:', {
                    username: userData.username,
                    email: userData.email,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    password: userData.password ? "***" : "",
                    role: userData.role,
                    is_staff: userData.is_staff,
                    is_superuser: userData.is_superuser
                });
                
                handleAddUser(userData);
                // Reset form
                e.currentTarget.reset();
            }} className={inModal ? "" : "bg-white shadow-md rounded-lg p-6"}>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                                type="text"
                                name="username"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                        <select
                            name="is_staff"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={loading}
                        >
                            <option value="learner">Learner</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
                
                <div className="flex justify-end mt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating...' : 'Create User'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterAdmin;

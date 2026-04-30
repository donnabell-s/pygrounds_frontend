import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { useAdaptive } from '../../../../context/AdaptiveContext';
import Logo from "../../../../assets/logo/PyGrounds_Logo.png";

const AdminLogin = () => {
    const { login } = useAuth();
    const { refresh } = useAdaptive();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

   const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any existing admin session data
    localStorage.removeItem("adminSession");
    
    // Add console logging here
    console.log('🔐 Admin Login Attempt:', {
        username: username,
        password: password ? '***' : '' // Don't log actual password for security
    });
    
    try {
        // For now, let's try the regular login and see what we get
        const loggedInUser = await login(username, password);
        
        // Check if user has admin privileges
        // Use type assertion to check for admin properties safely
        const adminUser = loggedInUser as any;
        
        // Debug logging to see what we received
        console.log('👤 User data received:', {
            id: adminUser.id,
            username: adminUser.username,
            role: adminUser.role,
            is_staff: adminUser.is_staff,
            is_superuser: adminUser.is_superuser
        });
        
        // Check if user has admin privileges (multiple checks for defense)
        const hasAdminAccess = adminUser.role === 'admin' || adminUser.is_staff || adminUser.is_superuser;
        
        if (!hasAdminAccess) {
            setError("Access denied. Admin privileges required.");
            console.log('❌ Access denied - user lacks admin privileges');
            return;
        }
        
        console.log('✅ Admin access granted');
        
        // Store admin session data separately for persistence
        const adminSessionData = {
            id: adminUser.id,
            username: adminUser.username,
            role: adminUser.role,
            is_staff: adminUser.is_staff,
            is_superuser: adminUser.is_superuser,
            loginTime: Date.now()
        };
        localStorage.setItem("adminSession", JSON.stringify(adminSessionData));
        
        // Refresh adaptive data after successful login
        refresh();
        
        // Navigate to admin dashboard with admin ID
        navigate(`/admin/${loggedInUser.id}`);
    } catch (err: any) {
        setError("Login failed. Please check your credentials.");
        console.error('❌ Login error:', err);
    }
};
    return (
        <div className="bg-gray-100 min-h-screen w-full flex items-start justify-center px-4">
            <div className="flex flex-col items-center w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5 2xl:w-1/3 max-w-2xl mt-12 md:mt-20">
                <div className="text-center mb-6 md:mb-8">
                    <div className="mb-2">
                        <img 
                            src={Logo} 
                            alt="PyGrounds Logo"
                            className="h-12 md:h-16 w-auto mx-auto"
                        />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-medium text-purple-800">Login to Pygrounds Admin</h3>
                </div>
                
                <div className="bg-[#f6f8fa] w-full sm:w-4/5 md:w-2/3 px-6 md:px-10 pt-10 md:pt-[5rem] pb-8 border-2 border-purple-800 rounded-lg">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center">
                            {error}
                        </div>
                    )}
                    
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="username" className="block font-medium text-lg md:text-xl text-purple-800">
                                    Username
                                </label>
                                <input 
                                    id="username"
                                    className="w-full px-3 py-2 md:px-4 md:py-3 bg-white rounded placeholder-gray-500/60 border-2 border-purple-500"
                                    type="text" 
                                    name="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    autoComplete="username"
                                    required
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label htmlFor="password" className="block font-medium text-lg md:text-xl text-purple-800">
                                    Password
                                </label>
                                <input 
                                    id="password"
                                    className="w-full px-3 py-2 md:px-4 md:py-3 bg-white rounded placeholder-gray-500/60 border-2 border-purple-500"
                                    type="password" 
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                />
                            </div>

                            <div className="pt-2">
                                <button 
                                    className="w-full px-4 py-2 md:py-3 bg-[#7053D0] text-white font-bold rounded shadow transition-colors hover:bg-purple-700" 
                                    type="submit"
                                >
                                    Sign In
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
};

export default AdminLogin;

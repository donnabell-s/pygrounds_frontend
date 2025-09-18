import Logo from "../../../../assets/logo/PyGrounds_Logo.png";

const AdminLogin = () => {
    return (
        <div className="bg-gray-100 w-screen h-screen flex items-start justify-center">
            <div className="flex flex-col items-center w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5 2xl:w-1/3 max-w-2xl mt-20 scale-[1.2]">
                <div className="text-center mb-8">
                    <div className="mb-2">
                        <img 
                            src={Logo} 
                            alt="PyGrounds Logo"
                            className="h-16 w-auto mx-auto"
                        />
                    </div>
                    <h3 className="text-3xl font-medium text-purple-800">Login to Pygrounds Admin</h3>
                </div>
                
                <div className="bg-[#f6f8fa] w-2/3 px-10 pt-[5rem] pb-8 border-2 border-purple-800">             
                    <form className="space-y-6">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="identity" className="block font-medium text-xl text-purple-800">
                                    Username or Email address
                                </label>
                                <input 
                                    id="identity"
                                    className="w-full px-4 py-3 bg-white rounded placeholder-gray-500/60 border-2 border-purple-500"
                                    type="text" 
                                    name="identity" 
                                    autoComplete="username" 
                
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label htmlFor="password" className="block font-medium text-xl text-purple-800">
                                    Password
                                </label>
                                <input 
                                    id="password"
                                    className="w-full px-4 py-3 bg-white rounded  placeholder-gray-500/60 border-2 border-purple-500"
                                    type="password" 
                                    name="password" 
                                    autoComplete="current-password"
                                  
                                />
                            </div>

                            <div className="pt-2">
                                <button 
                                    className="w-full px-4 py-3 bg-[#7053D0] text-white font-bold rounded shadow" 
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

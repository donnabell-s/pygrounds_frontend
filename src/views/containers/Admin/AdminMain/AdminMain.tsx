import { Outlet } from 'react-router-dom';
import * as Component from "../../../components";

const AdminMain = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-100">
      {/* Top Bar */}
      <div className="w-full h-13 bg-[#7054D0] shadow-md flex items-center px-6">
        <h1 className="text-lg font-bold text-white">PyGrounds</h1>
      </div>

      {/* Main Section */}
      <main className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64">
          <Component.AdminSideNav nav={true} />
        </div>

        {/* Outlet */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminMain;

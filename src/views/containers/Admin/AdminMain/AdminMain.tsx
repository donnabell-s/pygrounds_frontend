import { Outlet } from 'react-router-dom';
import * as Component from "../../../components";
import PyGroundsAdminLogo from "../../../../assets/logo/PyGroundsAdmin.png";

const AdminMain = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-100">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 w-full h-16 bg-[#7054D0] shadow-md flex items-center px-6 z-30">
        <img src={PyGroundsAdminLogo} alt="PyGrounds Admin" className="h-12 w-auto" />
      </div>

      {/* Main Section */}
      <main className="pt-16 min-h-screen bg-gray-100">
        {/* Sidebar - Fixed positioning */}
        <Component.AdminSideNav nav={true} />

        {/* Main Content Area - With left margin to account for fixed sidebar */}
        <div className="ml-0 sm:ml-64 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminMain;
